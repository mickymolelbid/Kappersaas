// api/afspraken.js
// GET  /api/afspraken        → alle afspraken van de kapper ophalen
// POST /api/afspraken        → nieuwe afspraak toevoegen
// PUT  /api/afspraken?id=... → afspraak bijwerken (status, tijd)

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  // Haal kapper-ID op uit JWT token
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ fout: "Niet ingelogd." });

  const {
    data: { user },
    error: authFout,
  } = await supabase.auth.getUser(token);
  if (authFout || !user)
    return res.status(401).json({ fout: "Ongeldige sessie." });

  const kapperId = user.id;

  // ── AFSPRAKEN OPHALEN ──────────────────────────────────────────────────
  if (req.method === "GET") {
    const { datum, van, tot } = req.query;

    let query = supabase
      .from("afspraken")
      .select(
        `
        *,
        klanten (naam, telefoon, email)
      `
      )
      .eq("kapper_id", kapperId)
      .order("datum", { ascending: true })
      .order("tijd", { ascending: true });

    // Filter op datum als opgegeven
    if (datum) {
      query = query.eq("datum", datum);
    } else if (van && tot) {
      query = query.gte("datum", van).lte("datum", tot);
    } else {
      // Standaard: afspraken vanaf vandaag
      const vandaag = new Date().toISOString().split("T")[0];
      query = query.gte("datum", vandaag);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ fout: error.message });

    return res.status(200).json({ afspraken: data });
  }

  // ── NIEUWE AFSPRAAK ────────────────────────────────────────────────────
  if (req.method === "POST") {
    const { klant_naam, klant_telefoon, dienst, datum, tijd, prijs } = req.body;

    if (!dienst || !datum || !tijd) {
      return res.status(400).json({ fout: "Dienst, datum en tijd zijn verplicht." });
    }

    // Controleer dubbele boeking
    const { data: bestaand } = await supabase
      .from("afspraken")
      .select("id")
      .eq("kapper_id", kapperId)
      .eq("datum", datum)
      .eq("tijd", tijd)
      .neq("status", "geannuleerd")
      .single();

    if (bestaand) {
      return res.status(409).json({ fout: "Dit tijdslot is al bezet." });
    }

    // Zoek of maak klant aan
    let klantId = null;
    if (klant_telefoon) {
      const { data: klant } = await supabase
        .from("klanten")
        .select("id")
        .eq("kapper_id", kapperId)
        .eq("telefoon", klant_telefoon)
        .single();

      if (klant) {
        klantId = klant.id;
      } else if (klant_naam) {
        const { data: nieuw } = await supabase
          .from("klanten")
          .insert({ kapper_id: kapperId, naam: klant_naam, telefoon: klant_telefoon })
          .select("id")
          .single();
        klantId = nieuw?.id;
      }
    }

    const { data, error } = await supabase
      .from("afspraken")
      .insert({
        kapper_id: kapperId,
        klant_id: klantId,
        dienst,
        datum,
        tijd,
        prijs: prijs || null,
        status: "bevestigd",
      })
      .select()
      .single();

    if (error) return res.status(500).json({ fout: error.message });
    return res.status(201).json({ afspraak: data });
  }

  // ── AFSPRAAK BIJWERKEN ─────────────────────────────────────────────────
  if (req.method === "PUT") {
    const { id } = req.query;
    const updates = req.body;

    // Verwijder velden die niet bijgewerkt mogen worden
    delete updates.kapper_id;
    delete updates.id;

    const { data, error } = await supabase
      .from("afspraken")
      .update(updates)
      .eq("id", id)
      .eq("kapper_id", kapperId) // beveiliging: alleen eigen afspraken
      .select()
      .single();

    if (error) return res.status(500).json({ fout: error.message });
    return res.status(200).json({ afspraak: data });
  }

  return res.status(405).end();
}
