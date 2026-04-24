// api/betaling.js
// Maakt een Stripe checkout sessie aan voor een abonnement
// POST /api/betaling { plan: 'starter' | 'pro' | 'salon', email, salon }

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { plan, email, salon } = req.body;

    if (!plan || !email) {
      return res.status(400).json({ fout: 'Plan en e-mail zijn verplicht.' });
    }

    // Kies de juiste Price ID op basis van plan
    const priceIds = {
      starter: process.env.STRIPE_PRICE_STARTER,
      pro: process.env.STRIPE_PRICE_PRO,
      salon: process.env.STRIPE_PRICE_SALON,
    };

    const priceId = priceIds[plan];
    if (!priceId) {
      return res.status(400).json({ fout: 'Ongeldig plan.' });
    }

    // Maak Stripe checkout sessie aan
    const sessie = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'],
      customer_email: email,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      // Gratis proefperiode van 30 dagen
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          salon: salon || '',
          plan: plan,
        }
      },
      // Belasting automatisch berekenen
      automatic_tax: { enabled: true },
      // Na betaling doorsturen naar dashboard
      success_url: `https://kapperbot.be/dashboard?betaling=geslaagd&sessie={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://kapperbot.be/contract?betaling=geannuleerd`,
      locale: 'nl',
      metadata: {
        salon: salon || '',
        plan: plan,
      }
    });

    return res.status(200).json({
      succes: true,
      checkout_url: sessie.url,
      sessie_id: sessie.id,
    });

  } catch (err) {
    console.error('Stripe fout:', err);
    return res.status(500).json({ fout: err.message || 'Betaling aanmaken mislukt.' });
  }
}
