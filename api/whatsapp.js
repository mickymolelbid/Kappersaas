// api/whatsapp.js
// Vercel serverless function — wordt automatisch een API endpoint
// URL: https://jouw-app.vercel.app/api/whatsapp

import Anthropic from "@anthropic-ai/sdk";
import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";
import {
  isGeverifieerd,
  stuurVerificatieCode,
  controleerCode,
  wachtOpCode,
} from "./verificatie.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Twilio client voor het sturen van berichten
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ─── HOOFDFUNCTIE ──────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // Twilio stuurt form-data
    const { From, Body, To } = req.body;
    const klantTelefoon = From; // bv. "whatsapp:+32477123456"
    const kapperNummer = To; // bv. "whatsapp:+32478654321"
    const bericht = Body?.trim();

    if (!bericht || !klantTelefoon) return res.status(400).end();

    // 1. Zoek de kapper op basis van WhatsApp-nummer
    const kapper = await getKapper(kapperNummer);
    if (!kapper) {
      await stuurBericht(
        klantTelefoon,
        kapperNummer,
        "Dit nummer is momenteel niet actief."
      );
      return res.status(200).end();
    }

    // 2. Haal of maak gesprek aan
    const gesprek = await getOfMaakGesprek(kapper.id, klantTelefoon);

    // 3. Voeg klantbericht toe aan geschiedenis
    const geschiedenis = gesprek.berichten || [];
    geschiedenis.push({ role: "user", content: bericht });

    // 4. Vraag AI om antwoord
    const antwoord = await getAIAntwoord(kapper, geschiedenis);

    // 5. Sla antwoord op
    geschiedenis.push({ role: "assistant", content: antwoord });
    await slaGesprekOp(gesprek.id, geschiedenis, klantTelefoon);

    // 6. Controleer of er een afspraak gemaakt moet worden
    const afspraakData = detecteerAfspraak(antwoord, geschiedenis);
    if (afspraakData) {
      await maakAfspraak(kapper.id, klantTelefoon, afspraakData);
    }

    // 7. Stuur antwoord via WhatsApp
    await stuurBericht(klantTelefoon, kapperNummer, antwoord);

    return res.status(200).end();
  } catch (err) {
    console.error("WhatsApp webhook fout:", err);
    return res.status(500).end();
  }
}

// ─── KAPPER OPHALEN ────────────────────────────────────────────────────────
async function getKapper(whatsappNummer) {
  const schoonNummer = whatsappNummer.replace("whatsapp:", "");
  const { data } = await supabase
    .from("kappers")
    .select("*")
    .eq("whatsapp_nummer", schoonNummer)
    .eq("actief", true)
    .single();
  return data;
}

// ─── GESPREK OPHALEN OF AANMAKEN ───────────────────────────────────────────
async function getOfMaakGesprek(kapperId, klantTelefoon) {
  const schoonNummer = klantTelefoon.replace("whatsapp:", "");

  // Kijk of er een recent gesprek is (laatste 24 uur)
  const gisteren = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: bestaand } = await supabase
    .from("gesprekken")
    .select("*")
    .eq("kapper_id", kapperId)
    .eq("klant_telefoon", schoonNummer)
    .gte("bijgewerkt_op", gisteren)
    .order("bijgewerkt_op", { ascending: false })
    .limit(1)
    .single();

  if (bestaand) return bestaand;

  // Maak nieuw gesprek aan
  const { data: nieuw } = await supabase
    .from("gesprekken")
    .insert({
      kapper_id: kapperId,
      klant_telefoon: schoonNummer,
      berichten: [],
      status: "actief",
    })
    .select()
    .single();

  return nieuw;
}

// ─── AI ANTWOORD GENEREREN ─────────────────────────────────────────────────
async function getAIAntwoord(kapper, geschiedenis) {
  const vandaag = new Date().toLocaleDateString("nl-BE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const systeemPrompt = `Je bent een vriendelijke AI-assistent voor ${kapper.salon_naam || kapper.naam}.
Je helpt klanten afspraken maken via WhatsApp.

Vandaag is het: ${vandaag}

Diensten en prijzen:
${kapper.diensten || defaultDiensten()}

Beschikbare tijdsloten: maandag t/m zaterdag 9:00-17:00
Gesloten op: zondag

Wanneer een klant een afspraak wil:
1. Vraag welke dienst
2. Geef 2-3 beschikbare tijdsloten voor deze of volgende week
3. Vraag naam ter bevestiging
4. Bevestig met: AFSPRAAK_BEVESTIGD: [dienst] op [dag datum] om [tijd] voor [naam]

Regels:
- Antwoord ALTIJD in het Nederlands
- Kort en vriendelijk, max 3 zinnen
- Geen opsommingstekens tenzij je een menu toont
- Spreek de klant aan met "je/jij"`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: systeemPrompt,
    messages: geschiedenis,
  });

  return response.content[0].text;
}

// ─── AFSPRAAK DETECTEREN IN ANTWOORD ──────────────────────────────────────
function detecteerAfspraak(antwoord, geschiedenis) {
  // Zoek naar bevestigingspatroon in het antwoord
  const match = antwoord.match(
    /AFSPRAAK_BEVESTIGD:\s*(.+?)\s+op\s+(\w+)\s+([\d\/]+)\s+om\s+([\d:]+)\s+voor\s+(.+)/i
  );
  if (!match) return null;

  return {
    dienst: match[1],
    dag: match[2],
    datum: match[3],
    tijd: match[4],
    naam: match[5],
  };
}

// ─── AFSPRAAK OPSLAAN ──────────────────────────────────────────────────────
async function maakAfspraak(kapperId, klantTelefoon, data) {
  const schoonNummer = klantTelefoon.replace("whatsapp:", "");

  // Zoek of maak klant aan
  let { data: klant } = await supabase
    .from("klanten")
    .select("id")
    .eq("kapper_id", kapperId)
    .eq("telefoon", schoonNummer)
    .single();

  if (!klant) {
    const { data: nieuwKlant } = await supabase
      .from("klanten")
      .insert({
        kapper_id: kapperId,
        naam: data.naam,
        telefoon: schoonNummer,
      })
      .select("id")
      .single();
    klant = nieuwKlant;
  }

  // Sla afspraak op
  await supabase.from("afspraken").insert({
    kapper_id: kapperId,
    klant_id: klant?.id,
    dienst: data.dienst,
    datum: parseDatum(data.datum),
    tijd: data.tijd,
    status: "bevestigd",
  });
}

// ─── GESPREK OPSLAAN ───────────────────────────────────────────────────────
async function slaGesprekOp(gesprekId, berichten, klantTelefoon) {
  await supabase
    .from("gesprekken")
    .update({
      berichten,
      bijgewerkt_op: new Date().toISOString(),
    })
    .eq("id", gesprekId);
}

// ─── BERICHT STUREN VIA TWILIO ─────────────────────────────────────────────
async function stuurBericht(aan, van, tekst) {
  await twilioClient.messages.create({
    from: van,
    to: aan,
    body: tekst,
  });
}

// ─── HELPERS ───────────────────────────────────────────────────────────────
function defaultDiensten() {
  return `- Herrenknippen: €18 (30 min)
- Dames knippen: €28 (45 min)
- Knippen + wassen + föhnen: €38 (60 min)
- Baard trimmen: €12 (20 min)
- Kleuren (volledig): €55 (90 min)`;
}

function parseDatum(datumStr) {
  // Zet "21/04" om naar "2026-04-21"
  const delen = datumStr.split("/");
  if (delen.length === 2) {
    const jaar = new Date().getFullYear();
    return `${jaar}-${delen[1].padStart(2, "0")}-${delen[0].padStart(2, "0")}`;
  }
  return datumStr;
}
