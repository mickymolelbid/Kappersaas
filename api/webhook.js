// api/webhook.js
// Ontvangt betalingsbevestigingen van Stripe
// Stripe stuurt automatisch een bericht als een betaling geslaagd is

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    // Lees raw body voor Stripe verificatie
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook verificatie mislukt:', err.message);
    return res.status(400).json({ fout: `Webhook fout: ${err.message}` });
  }

  // Verwerk verschillende Stripe events
  switch (event.type) {

    // ── ABONNEMENT AANGEMAAKT ────────────────────────────────────────────
    case 'customer.subscription.created': {
      const abonnement = event.data.object;
      const klantenId = abonnement.customer;
      const plan = abonnement.metadata?.plan || 'starter';

      // Haal klantgegevens op bij Stripe
      const klant = await stripe.customers.retrieve(klantenId);

      // Update kapper status in Supabase
      if (klant.email) {
        await supabase
          .from('kappers')
          .update({
            plan: plan,
            stripe_customer_id: klantenId,
            stripe_subscription_id: abonnement.id,
            actief: true,
          })
          .eq('email', klant.email);
      }

      console.log(`✅ Nieuw abonnement: ${klant.email} — ${plan}`);
      break;
    }

    // ── BETALING GESLAAGD ────────────────────────────────────────────────
    case 'invoice.payment_succeeded': {
      const factuur = event.data.object;
      const klantenId = factuur.customer;
      const klant = await stripe.customers.retrieve(klantenId);

      // Sla factuur op in Supabase
      if (klant.email) {
        await supabase.from('facturen').insert({
          email: klant.email,
          bedrag: factuur.amount_paid / 100,
          stripe_factuur_id: factuur.id,
          periode_start: new Date(factuur.period_start * 1000).toISOString(),
          periode_einde: new Date(factuur.period_end * 1000).toISOString(),
          status: 'betaald',
          aangemaakt_op: new Date().toISOString(),
        }).catch(() => {});
      }

      console.log(`💳 Betaling geslaagd: ${klant.email} — €${factuur.amount_paid / 100}`);
      break;
    }

    // ── BETALING MISLUKT ─────────────────────────────────────────────────
    case 'invoice.payment_failed': {
      const factuur = event.data.object;
      const klantenId = factuur.customer;
      const klant = await stripe.customers.retrieve(klantenId);

      // Stuur herinnering mail via Resend
      if (klant.email) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'KapperBot <noreply@kapperbot.be>',
            to: klant.email,
            subject: '⚠️ Betaling mislukt — KapperBot',
            html: `
              <p>Beste klant,</p>
              <p>Je betaling voor KapperBot is helaas mislukt. Controleer je betaalgegevens.</p>
              <p><a href="https://kapperbot.be/dashboard">Klik hier om je betaalgegevens bij te werken</a></p>
              <p>KapperBot team</p>
            `,
          }),
        }).catch(() => {});
      }

      console.log(`❌ Betaling mislukt: ${klant.email}`);
      break;
    }

    // ── ABONNEMENT OPGEZEGD ──────────────────────────────────────────────
    case 'customer.subscription.deleted': {
      const abonnement = event.data.object;
      const klantenId = abonnement.customer;
      const klant = await stripe.customers.retrieve(klantenId);

      // Deactiveer kapper in Supabase
      if (klant.email) {
        await supabase
          .from('kappers')
          .update({ actief: false })
          .eq('email', klant.email);
      }

      console.log(`🔴 Abonnement opgezegd: ${klant.email}`);
      break;
    }

    default:
      console.log(`Onbekend event: ${event.type}`);
  }

  return res.status(200).json({ ontvangen: true });
}

// Helper: lees raw body
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
