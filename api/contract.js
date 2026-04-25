// api/contract.js
// Stuurt professionele contractbevestiging per mail na ondertekening

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { salon, contact, email, telefoon, adres, btw, whatsapp, plan, prijs, contractId, datum } = req.body;

    if (!email || !salon || !contractId) {
      return res.status(400).json({ fout: 'Verplichte velden ontbreken.' });
    }

    const planNamen = { starter: 'Starter', pro: 'Pro', salon: 'Salon' };
    const planNaam = planNamen[plan] || plan;

    const eersteFactuur = new Date();
    eersteFactuur.setDate(eersteFactuur.getDate() + 14);
    const eersteFactuurDatum = eersteFactuur.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });

    const contractHTML = `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#1a1a1a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;padding:32px 0;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:8px;overflow:hidden;border:1px solid #2a2a2a;">

  <!-- BRIEFHOOFD -->
  <tr><td style="background:#0d0d0d;padding:24px 32px;border-bottom:1px solid #222;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;padding-right:8px;"><div style="width:10px;height:10px;background:#25d366;border-radius:50%;"></div></td>
          <td style="vertical-align:middle;">
            <div style="font-size:18px;font-weight:bold;color:#f5f2ed;letter-spacing:-0.5px;">KapperBot</div>
            <div style="font-size:10px;color:#666;letter-spacing:1.5px;text-transform:uppercase;margin-top:1px;">Belgisch product &middot; kapperbot.be</div>
          </td>
        </tr></table>
      </td>
      <td align="right" style="vertical-align:top;font-size:11px;color:#666;line-height:1.9;">
        MBD Advies en Projecten BV<br>
        BTW: BE1031104852<br>
        Antwerpen, Belgi&euml;<br>
        info@kapperbot.be
      </td>
    </tr></table>
  </td></tr>

  <!-- GROENE BALK -->
  <tr><td style="background:#25d366;padding:16px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <div style="font-size:9px;font-weight:bold;color:rgba(0,0,0,0.5);letter-spacing:2px;text-transform:uppercase;">Abonnementsovereenkomst</div>
        <div style="font-size:16px;font-weight:bold;color:#000;margin-top:3px;">KapperBot ${planNaam} Plan</div>
      </td>
      <td align="right">
        <div style="font-size:9px;color:rgba(0,0,0,0.5);text-transform:uppercase;letter-spacing:1px;">Contract ID</div>
        <div style="font-size:12px;color:#000;font-weight:bold;font-family:monospace;">${contractId}</div>
        <div style="font-size:10px;color:rgba(0,0,0,0.5);margin-top:2px;">${datum}</div>
      </td>
    </tr></table>
  </td></tr>

  <!-- BODY -->
  <tr><td style="padding:24px 32px;">

    <p style="font-size:13px;color:#f5f2ed;margin:0 0 6px;font-weight:bold;">Beste ${contact},</p>
    <p style="font-size:12px;color:#888;line-height:1.7;margin:0 0 20px;">Bedankt voor het ondertekenen van uw abonnementsovereenkomst met KapperBot. Bewaar dit document als bewijs van uw overeenkomst. Uw account wordt binnen 24u geactiveerd.</p>

    <!-- PARTIJEN -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td width="48%" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:14px;vertical-align:top;">
          <div style="font-size:9px;font-weight:bold;color:#25d366;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Leverancier</div>
          <div style="font-size:11px;color:#ccc;line-height:1.9;"><strong style="color:#f5f2ed;">MBD Advies en Projecten BV</strong><br>BTW: BE1031104852<br>Antwerpen, Belgi&euml;</div>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:14px;vertical-align:top;">
          <div style="font-size:9px;font-weight:bold;color:#25d366;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Klant</div>
          <div style="font-size:11px;color:#ccc;line-height:1.9;"><strong style="color:#f5f2ed;">${salon}</strong><br>${contact}<br>${adres}${btw ? '<br>BTW: ' + btw : ''}</div>
        </td>
      </tr>
    </table>

    <!-- DETAILS -->
    <div style="font-size:9px;font-weight:bold;color:#25d366;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Abonnementsdetails</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2a2a;border-radius:6px;overflow:hidden;margin-bottom:16px;">
      <tr style="background:#1a1a1a;"><td style="padding:10px 14px;font-size:11px;color:#666;width:40%;border-bottom:1px solid #2a2a2a;">Plan</td><td style="padding:10px 14px;font-size:11px;font-weight:bold;color:#f5f2ed;border-bottom:1px solid #2a2a2a;">${planNaam} &mdash; &euro;${prijs}/maand excl. BTW</td></tr>
      <tr style="background:#141414;"><td style="padding:10px 14px;font-size:11px;color:#666;border-bottom:1px solid #2a2a2a;">WhatsApp</td><td style="padding:10px 14px;font-size:11px;font-weight:bold;color:#f5f2ed;border-bottom:1px solid #2a2a2a;">${whatsapp}</td></tr>
      <tr style="background:#1a1a1a;"><td style="padding:10px 14px;font-size:11px;color:#666;border-bottom:1px solid #2a2a2a;">Proefperiode</td><td style="padding:10px 14px;font-size:11px;font-weight:bold;color:#25d366;border-bottom:1px solid #2a2a2a;">14 dagen gratis &mdash; niets wordt afgehouden</td></tr>
      <tr style="background:#141414;"><td style="padding:10px 14px;font-size:11px;color:#666;border-bottom:1px solid #2a2a2a;">Eerste betaling</td><td style="padding:10px 14px;font-size:11px;font-weight:bold;color:#f5f2ed;border-bottom:1px solid #2a2a2a;">${eersteFactuurDatum}</td></tr>
      <tr style="background:#1a1a1a;"><td style="padding:10px 14px;font-size:11px;color:#666;">Opzegging</td><td style="padding:10px 14px;font-size:11px;font-weight:bold;color:#f5f2ed;">Maandelijks opzegbaar, zonder reden</td></tr>
    </table>

    <!-- ARTIKELEN -->
    <div style="font-size:9px;font-weight:bold;color:#25d366;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Overeenkomst</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2a2a;border-radius:6px;overflow:hidden;margin-bottom:16px;">
      <tr style="background:#141414;"><td style="padding:10px 14px;font-size:11px;font-weight:bold;color:#25d366;width:80px;border-bottom:1px solid #2a2a2a;vertical-align:top;">Art. 1</td><td style="padding:10px 14px;font-size:11px;color:#999;line-height:1.5;border-bottom:1px solid #2a2a2a;">KapperBot verleent de Klant toegang tot het SaaS-platform (${planNaam}, &euro;${prijs}/mnd excl. BTW) op WhatsApp-nummer ${whatsapp}.</td></tr>
      <tr style="background:#1a1a1a;"><td style="padding:10px 14px;font-size:11px;font-weight:bold;color:#25d366;border-bottom:1px solid #2a2a2a;vertical-align:top;">Art. 2</td><td style="padding:10px 14px;font-size:11px;color:#999;line-height:1.5;border-bottom:1px solid #2a2a2a;">14 dagen gratis proefperiode. Niets wordt afgehouden tijdens de proefperiode. Eerste betaling op ${eersteFactuurDatum}.</td></tr>
      <tr style="background:#141414;"><td style="padding:10px 14px;font-size:11px;font-weight:bold;color:#25d366;border-bottom:1px solid #2a2a2a;vertical-align:top;">Art. 3</td><td style="padding:10px 14px;font-size:11px;color:#999;line-height:1.5;border-bottom:1px solid #2a2a2a;">Maandelijks automatisch verlengd. Opzegging met 30 dagen opzegtermijn, zonder opgave van reden.</td></tr>
      <tr style="background:#1a1a1a;"><td style="padding:10px 14px;font-size:11px;font-weight:bold;color:#25d366;border-bottom:1px solid #2a2a2a;vertical-align:top;">Art. 4</td><td style="padding:10px 14px;font-size:11px;color:#999;line-height:1.5;border-bottom:1px solid #2a2a2a;">Aansprakelijkheid beperkt tot bedragen betaald in de laatste 3 maanden.</td></tr>
      <tr style="background:#141414;"><td style="padding:10px 14px;font-size:11px;font-weight:bold;color:#25d366;vertical-align:top;">Art. 5</td><td style="padding:10px 14px;font-size:11px;color:#999;line-height:1.5;">Belgisch recht. Geschillen: rechtbank arrondissement Antwerpen.</td></tr>
    </table>

    <!-- HANDTEKENING -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2a2a;border-radius:6px;overflow:hidden;margin-bottom:16px;">
      <tr>
        <td width="50%" style="padding:14px;background:#1a1a1a;border-right:1px solid #2a2a2a;vertical-align:top;">
          <div style="font-size:9px;font-weight:bold;color:#25d366;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Namens KapperBot</div>
          <div style="font-size:13px;color:#f5f2ed;font-style:italic;margin-bottom:4px;">Digitaal ondertekend</div>
          <div style="font-size:11px;color:#666;">${datum}</div>
        </td>
        <td width="50%" style="padding:14px;background:#1a1a1a;vertical-align:top;">
          <div style="font-size:9px;font-weight:bold;color:#25d366;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Namens ${salon}</div>
          <div style="font-size:13px;color:#f5f2ed;font-style:italic;margin-bottom:4px;">Digitaal ondertekend</div>
          <div style="font-size:11px;color:#666;">${datum}</div>
        </td>
      </tr>
    </table>

    <p style="font-size:10px;color:#555;text-align:center;margin:0 0 20px;">Digitale handtekening geldig conform eIDAS (EU) 910/2014 &middot; Contract ID: ${contractId}</p>

    <!-- VOLGENDE STAPPEN -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(37,211,102,0.08);border:1px solid rgba(37,211,102,0.2);border-radius:6px;margin-bottom:16px;">
      <tr><td style="padding:16px;">
        <div style="font-size:9px;font-weight:bold;color:#25d366;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">Volgende stappen</div>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="padding:4px 0;vertical-align:top;"><div style="background:#25d366;color:#000;font-size:10px;font-weight:bold;width:18px;height:18px;border-radius:50%;text-align:center;line-height:18px;margin-right:10px;">1</div></td><td style="padding:4px 0;font-size:12px;color:#ccc;line-height:1.5;">Wij nemen binnen 24u contact op om uw WhatsApp chatbot te activeren</td></tr>
          <tr><td style="padding:4px 0;vertical-align:top;"><div style="background:#25d366;color:#000;font-size:10px;font-weight:bold;width:18px;height:18px;border-radius:50%;text-align:center;line-height:18px;margin-right:10px;">2</div></td><td style="padding:4px 0;font-size:12px;color:#ccc;line-height:1.5;">U ontvangt toegang tot uw persoonlijk dashboard</td></tr>
          <tr><td style="padding:4px 0;vertical-align:top;"><div style="background:#25d366;color:#000;font-size:10px;font-weight:bold;width:18px;height:18px;border-radius:50%;text-align:center;line-height:18px;margin-right:10px;">3</div></td><td style="padding:4px 0;font-size:12px;color:#ccc;line-height:1.5;">Uw bot is actief en beantwoordt automatisch WhatsApp berichten</td></tr>
        </table>
        <div style="text-align:center;margin-top:14px;">
          <a href="https://kapperbot.be/dashboard" style="display:inline-block;background:#25d366;color:#000;font-size:12px;font-weight:bold;padding:10px 24px;border-radius:8px;text-decoration:none;">Naar mijn dashboard &rarr;</a>
        </div>
      </td></tr>
    </table>

  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#0d0d0d;padding:16px 32px;text-align:center;border-top:1px solid #222;">
    <p style="font-size:11px;color:#555;margin:0;line-height:1.9;">
      KapperBot &middot; MBD Advies en Projecten BV &middot; BTW: BE1031104852 &middot; Antwerpen<br>
      <a href="https://kapperbot.be/voorwaarden" style="color:#444;text-decoration:none;">Voorwaarden</a> &nbsp;&middot;&nbsp;
      <a href="https://kapperbot.be/privacy" style="color:#444;text-decoration:none;">Privacy</a> &nbsp;&middot;&nbsp;
      <a href="mailto:info@kapperbot.be" style="color:#444;text-decoration:none;">info@kapperbot.be</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    // ── MAIL NAAR KAPPER ─────────────────────────────────────────────────
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'KapperBot <noreply@kapperbot.be>',
        to: email,
        subject: `Uw abonnementsovereenkomst KapperBot — ${contractId}`,
        html: contractHTML,
      }),
    });

    // ── KOPIE NAAR INFO@KAPPERBOT.BE ─────────────────────────────────────
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'KapperBot System <noreply@kapperbot.be>',
        to: 'info@kapperbot.be',
        subject: `Nieuw contract — ${salon} (${contractId})`,
        html: `<h2>Nieuw contract ondertekend!</h2>
          <p><strong>Contract ID:</strong> ${contractId}</p>
          <p><strong>Salon:</strong> ${salon}</p>
          <p><strong>Contact:</strong> ${contact}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefoon:</strong> ${telefoon}</p>
          <p><strong>Adres:</strong> ${adres}</p>
          ${btw ? `<p><strong>BTW:</strong> ${btw}</p>` : ''}
          <p><strong>WhatsApp:</strong> ${whatsapp}</p>
          <p><strong>Plan:</strong> ${planNaam} — €${prijs}/mnd</p>
          <p><strong>Datum:</strong> ${datum}</p>`,
      }),
    });

    return res.status(200).json({ succes: true });

  } catch (err) {
    console.error('Contract mail fout:', err);
    return res.status(500).json({ fout: 'Mail versturen mislukt.' });
  }
}
