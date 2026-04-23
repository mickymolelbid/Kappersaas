# KapperBot — Setup Gids

## Wat je nu hebt
- `index.html` — je verkooppagina (landingspagina)
- `dashboard.html` — het kappersdashboard
- `SETUP.md` — deze gids

---

## Stap 1: Anthropic API-sleutel (gratis te starten)

1. Ga naar https://console.anthropic.com
2. Maak een account aan
3. Ga naar "API Keys" → "Create Key"
4. Kopieer de sleutel (begint met `sk-ant-...`)
5. Bewaar deze veilig — je hebt hem nodig in stap 3

Kosten: ~€0,01 per gesprek (heel goedkoop)

---

## Stap 2: Supabase database (gratis)

1. Ga naar https://supabase.com → "Start your project"
2. Maak een nieuw project aan (kies regio: EU West)
3. Bewaar je `Project URL` en `anon key`
4. Ga naar "SQL Editor" en voer dit uit:

```sql
-- Kappers (gebruikers)
create table kappers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  naam text not null,
  salon_naam text,
  whatsapp_nummer text,
  plan text default 'starter',
  actief boolean default true,
  aangemaakt_op timestamp default now()
);

-- Klanten van de kapper
create table klanten (
  id uuid default gen_random_uuid() primary key,
  kapper_id uuid references kappers(id),
  naam text,
  telefoon text not null,
  email text,
  aangemaakt_op timestamp default now()
);

-- Afspraken
create table afspraken (
  id uuid default gen_random_uuid() primary key,
  kapper_id uuid references kappers(id),
  klant_id uuid references klanten(id),
  dienst text not null,
  datum date not null,
  tijd time not null,
  prijs numeric,
  status text default 'gepland', -- gepland, bevestigd, geannuleerd, klaar
  aangemaakt_op timestamp default now()
);

-- WhatsApp gesprekken
create table gesprekken (
  id uuid default gen_random_uuid() primary key,
  kapper_id uuid references kappers(id),
  klant_telefoon text not null,
  klant_naam text,
  berichten jsonb default '[]',
  status text default 'actief',
  aangemaakt_op timestamp default now(),
  bijgewerkt_op timestamp default now()
);
```

---

## Stap 3: Vercel hosting (gratis)

1. Ga naar https://vercel.com → maak account aan
2. Installeer Vercel CLI: `npm install -g vercel`
3. In je projectmap: `vercel deploy`
4. Voeg environment variables toe in Vercel dashboard:
   - `ANTHROPIC_API_KEY` = jouw Anthropic sleutel
   - `SUPABASE_URL` = jouw Supabase URL
   - `SUPABASE_KEY` = jouw Supabase anon key

---

## Stap 4: WhatsApp Business API via Twilio

1. Ga naar https://www.twilio.com/whatsapp
2. Maak account aan (gratis sandbox om te testen)
3. Voor productie: vraag WhatsApp Business Account aan (~1-2 weken)
4. Voeg toe aan Vercel env vars:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`

### Webhook instellen in Twilio:
- URL: `https://jouw-app.vercel.app/api/whatsapp`
- Methode: POST

---

## Stap 5: Betalingen via Stripe

1. Ga naar https://stripe.com → maak account aan
2. Ga naar Developers → API Keys
3. Voeg toe aan Vercel:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
4. Maak 3 producten aan in Stripe:
   - Starter: €29/maand
   - Pro: €49/maand
   - Salon: €89/maand

---

## Kosten overzicht per maand (met 10 kappers als klant)

| Service | Kosten |
|---------|--------|
| Anthropic API | ~€15 (1500 gesprekken) |
| Supabase | Gratis (tot 500MB) |
| Vercel | Gratis |
| Twilio WhatsApp | €50 (vaste kost) |
| Stripe | 2.9% per betaling |
| **Totaal kosten** | ~€70/maand |
| **Inkomsten (10×€49)** | €490/maand |
| **Winst** | ~€420/maand |

---

## Volgende stap na setup
