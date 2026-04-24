// api/auth.js
// Vercel serverless function voor registratie en login
// POST /api/auth?actie=registreer  → nieuw account aanmaken
// POST /api/auth?actie=login       → inloggen

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // gebruik service key voor auth
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { actie } = req.query;
  const { email, wachtwoord, naam, salon_naam } = req.body;

  // ── REGISTREREN ────────────────────────────────────────────────────────
  if (actie === "registreer") {
    if (!email || !wachtwoord || !naam) {
      return res.status(400).json({ fout: "Vul alle velden in." });
    }

    // Maak Supabase auth gebruiker aan
    const { data: authData, error: authFout } =
      await supabase.auth.admin.createUser({
        email,
        password: wachtwoord,
        email_confirm: true,
      });

    if (authFout) {
      return res
        .status(400)
        .json({ fout: authFout.message || "Registratie mislukt." });
    }

    // Sla kapper op in eigen tabel
    const { error: dbFout } = await supabase.from("kappers").insert({
      id: authData.user.id,
      email,
      naam,
      salon_naam: salon_naam || naam,
      plan: "starter",
      actief: true,
    });

    if (dbFout) {
      return res.status(500).json({ fout: "Account aanmaken mislukt." });
    }

    return res.status(200).json({
      succes: true,
      bericht: "Account aangemaakt! Ga naar je dashboard.",
      redirect: "/dashboard.html",
    });
  }

  // ── INLOGGEN ───────────────────────────────────────────────────────────
  if (actie === "login") {
    if (!email || !wachtwoord) {
      return res.status(400).json({ fout: "Vul email en wachtwoord in." });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: wachtwoord,
    });

    if (error) {
      return res
        .status(401)
        .json({ fout: "Ongeldig e-mailadres of wachtwoord." });
    }

    return res.status(200).json({
      succes: true,
      token: data.session.access_token,
      gebruiker: {
        id: data.user.id,
        email: data.user.email,
      },
      redirect: "/dashboard.html",
    });
  }

  return res.status(400).json({ fout: "Onbekende actie." });
}
