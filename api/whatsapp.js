// api/whatsapp.js
// Ontvangt WhatsApp berichten via Twilio en antwoordt via Claude AI

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body;
    const klantBericht = body.Body?.trim();
    const klantNummer = body.From;

    if (!klantBericht || !klantNummer) {
      return res.status(400).end();
    }

    // Vraag Claude AI om een antwoord
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: `Je bent een vriendelijke AI-assistent voor een kapperszaak in België.
Je helpt klanten afspraken maken via WhatsApp.

Beschikbare diensten:
- Herrenknippen: €18 (30 min)
- Dames knippen: €28 (45 min)
- Knippen + wassen + föhnen: €38 (60 min)
- Baard trimmen: €12 (20 min)
- Kleuren: €55 (90 min)

Beschikbare tijdsloten: maandag t/m zaterdag 9:00-17:00. Gesloten op zondag.

Wanneer een klant een afspraak wil:
1. Vraag welke dienst
2. Geef 2-3 beschikbare tijdsloten
3. Vraag naam ter bevestiging
4. Bevestig de afspraak

Antwoord ALTIJD kort en vriendelijk, max 3 zinnen. Schrijf in het Nederlands.`,
        messages: [
          { role: 'user', content: klantBericht }
        ]
      })
    });

    const aiData = await aiResponse.json();
    const antwoord = aiData.content?.[0]?.text || 'Sorry, er ging iets mis. Probeer opnieuw.';

    // Stuur antwoord via Twilio TwiML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${antwoord}</Message></Response>`;

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml);

  } catch (err) {
    console.error('WhatsApp fout:', err);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Sorry, technisch probleem. Probeer later opnieuw.</Message></Response>`;
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml);
  }
}
