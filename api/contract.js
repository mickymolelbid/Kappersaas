<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KapperBot — Abonnementsovereenkomst</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --black: #0d0d0d; --white: #f5f2ed; --green: #25d366;
    --green-dark: #128c7e; --gray: #8a8a8a; --border: #2a2a2a;
    --card: #141414; --red: #e24b4a;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--black); color:var(--white); font-family:'DM Sans',sans-serif; font-size:15px; line-height:1.7; }

  /* NAV */
  nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1rem 2rem; border-bottom:1px solid var(--border); background:rgba(13,13,13,0.95); backdrop-filter:blur(12px); }
  .logo { font-family:'Syne',sans-serif; font-weight:800; font-size:1.3rem; display:flex; align-items:center; gap:8px; color:var(--white); text-decoration:none; }
  .logo-dot { width:9px; height:9px; background:var(--green); border-radius:50%; animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

  /* LAYOUT */
  .page { max-width:760px; margin:0 auto; padding:5.5rem 1.5rem 3rem; }

  /* STAPPEN INDICATOR */
  .steps { display:flex; align-items:center; gap:0; margin-bottom:2.5rem; }
  .step { display:flex; align-items:center; gap:8px; flex:1; }
  .step-num { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; font-family:'Syne',sans-serif; flex-shrink:0; transition:all .3s; }
  .step.done .step-num { background:var(--green); color:#000; }
  .step.active .step-num { background:var(--white); color:#000; }
  .step.todo .step-num { background:var(--border); color:var(--gray); }
  .step-label { font-size:12px; color:var(--gray); }
  .step.active .step-label { color:var(--white); font-weight:500; }
  .step.done .step-label { color:var(--green); }
  .step-line { flex:1; height:1px; background:var(--border); margin:0 8px; }
  .step-line.done { background:var(--green); }

  /* SECTIES */
  .section { display:none; animation:fadeIn .3s ease; }
  .section.active { display:block; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  h1 { font-family:'Syne',sans-serif; font-size:1.8rem; font-weight:800; margin-bottom:0.4rem; }
  .subtitle { color:var(--gray); font-size:0.9rem; margin-bottom:2rem; }

  /* PLAN KIEZEN */
  .plan-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:2rem; }
  .plan-card { background:var(--card); border:1.5px solid var(--border); border-radius:12px; padding:1.25rem; cursor:pointer; transition:all .2s; }
  .plan-card:hover { border-color:var(--gray); }
  .plan-card.selected { border-color:var(--green); background:rgba(37,211,102,0.05); }
  .plan-card .plan-name { font-family:'Syne',sans-serif; font-weight:700; font-size:0.95rem; margin-bottom:4px; }
  .plan-card .plan-price { font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:var(--green); }
  .plan-card .plan-price span { font-size:0.8rem; font-weight:400; color:var(--gray); }
  .plan-card .plan-feat { font-size:0.78rem; color:var(--gray); margin-top:8px; line-height:1.5; }
  .plan-badge { display:inline-block; background:var(--green); color:#000; font-size:0.65rem; font-weight:700; padding:2px 8px; border-radius:100px; margin-bottom:6px; }

  /* FORMULIER */
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:1.5rem; }
  .form-grid.full { grid-template-columns:1fr; }
  .form-group { display:flex; flex-direction:column; gap:6px; }
  .form-group.full { grid-column:1/-1; }
  label { font-size:12px; color:var(--gray); font-weight:500; letter-spacing:.3px; }
  input, select { background:#0d0d0d; border:1px solid var(--border); border-radius:8px; padding:0.65rem 0.9rem; color:var(--white); font-size:14px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s; width:100%; }
  input:focus, select:focus { border-color:var(--green); }
  input::placeholder { color:var(--gray); }
  select option { background:#1a1a1a; }

  /* CONTRACT TEKST */
  .contract-box { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:1.5rem; max-height:340px; overflow-y:auto; margin-bottom:1.5rem; font-size:13px; color:#b0aba3; line-height:1.8; }
  .contract-box h3 { font-family:'Syne',sans-serif; font-size:0.85rem; font-weight:700; color:var(--white); margin:1.2rem 0 0.4rem; }
  .contract-box h3:first-child { margin-top:0; }
  .contract-box::-webkit-scrollbar { width:4px; }
  .contract-box::-webkit-scrollbar-track { background:transparent; }
  .contract-box::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }

  /* HANDTEKENING */
  .signature-area { margin-bottom:1.5rem; }
  .sig-label { font-size:12px; color:var(--gray); margin-bottom:8px; display:block; }
  .sig-tabs { display:flex; gap:8px; margin-bottom:12px; }
  .sig-tab { padding:6px 14px; border-radius:6px; border:1px solid var(--border); background:none; color:var(--gray); font-size:12px; cursor:pointer; transition:all .2s; }
  .sig-tab.active { background:var(--white); color:#000; border-color:var(--white); font-weight:500; }
  #sig-canvas { width:100%; height:140px; background:#0a0a0a; border:1px solid var(--border); border-radius:10px; cursor:crosshair; touch-action:none; display:block; }
  #sig-type-input { display:none; }
  #sig-type-input input { font-size:1.6rem; font-family:'Syne',sans-serif; text-align:center; letter-spacing:2px; }
  .sig-clear { margin-top:8px; background:none; border:none; color:var(--gray); font-size:12px; cursor:pointer; padding:0; }
  .sig-clear:hover { color:var(--white); }

  /* CHECKBOX */
  .check-group { display:flex; gap:12px; align-items:flex-start; margin-bottom:1rem; }
  .check-group input[type=checkbox] { width:18px; height:18px; border:1px solid var(--border); background:#0d0d0d; border-radius:4px; cursor:pointer; flex-shrink:0; margin-top:2px; accent-color:var(--green); }
  .check-group label { font-size:13px; color:#b0aba3; cursor:pointer; }
  .check-group a { color:var(--green); text-decoration:none; }

  /* KNOPPEN */
  .btn-row { display:flex; gap:12px; margin-top:1.5rem; }
  .btn-primary { background:var(--green); color:#000; font-family:'Syne',sans-serif; font-weight:700; padding:0.8rem 2rem; border:none; border-radius:8px; cursor:pointer; font-size:0.95rem; transition:all .15s; flex:1; }
  .btn-primary:hover { background:#1db954; transform:translateY(-1px); }
  .btn-primary:disabled { background:var(--border); color:var(--gray); cursor:not-allowed; transform:none; }
  .btn-secondary { background:none; border:1px solid var(--border); color:var(--white); font-family:'Syne',sans-serif; font-weight:500; padding:0.8rem 1.5rem; border-radius:8px; cursor:pointer; font-size:0.9rem; transition:all .15s; }
  .btn-secondary:hover { border-color:var(--gray); }

  /* SUCCES */
  .success-icon { width:64px; height:64px; background:rgba(37,211,102,0.12); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; font-size:28px; }
  .success-box { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:1.25rem; margin:1.5rem 0; }
  .success-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border); font-size:13px; }
  .success-row:last-child { border-bottom:none; }
  .success-row span:first-child { color:var(--gray); }
  .success-row span:last-child { font-weight:500; }
  .download-btn { display:flex; align-items:center; justify-content:center; gap:8px; background:var(--card); border:1px solid var(--border); border-radius:8px; padding:0.75rem; color:var(--white); text-decoration:none; font-size:13px; transition:all .2s; cursor:pointer; width:100%; }
  .download-btn:hover { border-color:var(--green); color:var(--green); }

  /* FOUTMELDING */
  .error-msg { color:var(--red); font-size:12px; margin-top:4px; display:none; }
  .error-msg.show { display:block; }

  @media(max-width:600px) {
    .plan-grid { grid-template-columns:1fr; }
    .form-grid { grid-template-columns:1fr; }
    .form-group.full { grid-column:1; }
  }
</style>
</head>
<body>

<nav>
  <a href="/" class="logo"><span class="logo-dot"></span>KapperBot</a>
</nav>

<div class="page">

  <!-- STAPPEN -->
  <div class="steps">
    <div class="step active" id="step-1">
      <div class="step-num">1</div>
      <div class="step-label">Plan kiezen</div>
    </div>
    <div class="step-line" id="line-1"></div>
    <div class="step todo" id="step-2">
      <div class="step-num">2</div>
      <div class="step-label">Gegevens</div>
    </div>
    <div class="step-line" id="line-2"></div>
    <div class="step todo" id="step-3">
      <div class="step-num">3</div>
      <div class="step-label">Contract</div>
    </div>
    <div class="step-line" id="line-3"></div>
    <div class="step todo" id="step-4">
      <div class="step-num">4</div>
      <div class="step-label">Ondertekenen</div>
    </div>
  </div>

  <!-- SECTIE 1: PLAN KIEZEN -->
  <div class="section active" id="sec-1">
    <h1>Kies je plan</h1>
    <p class="subtitle">Eerste maand gratis — geen creditcard nodig om te starten</p>

    <div class="plan-grid">
      <div class="plan-card" onclick="kiesPlan('starter', 29, this)">
        <div class="plan-name">Starter</div>
        <div class="plan-price">€29<span>/maand</span></div>
        <div class="plan-feat">✓ WhatsApp chatbot<br>✓ 100 gesprekken/mnd<br>✓ Basisagenda<br>✓ Email support</div>
      </div>
      <div class="plan-card selected" onclick="kiesPlan('pro', 59, this)">
        <div class="plan-badge">POPULAIRSTE</div>
        <div class="plan-name">Pro</div>
        <div class="plan-price">€59<span>/maand</span></div>
        <div class="plan-feat">✓ Onbeperkte gesprekken<br>✓ Herinneringen<br>✓ Statistieken<br>✓ Prioriteit support</div>
      </div>
      <div class="plan-card" onclick="kiesPlan('salon', 149, this)">
        <div class="plan-name">Salon</div>
        <div class="plan-price">€149<span>/maand</span></div>
        <div class="plan-feat">✓ Tot 5 kappers<br>✓ Meerdere nummers<br>✓ Onboarding<br>✓ Maatwerk</div>
      </div>
    </div>

    <div class="btn-row">
      <button class="btn-primary" onclick="naarStap(2)">Verder →</button>
    </div>
  </div>

  <!-- SECTIE 2: GEGEVENS -->
  <div class="section" id="sec-2">
    <h1>Jouw gegevens</h1>
    <p class="subtitle">Deze gegevens verschijnen op het contract en de factuur</p>

    <div class="form-grid">
      <div class="form-group">
        <label>Naam salon *</label>
        <input type="text" id="salon-naam" placeholder="Kapper Tom">
        <span class="error-msg" id="err-salon">Verplicht veld</span>
      </div>
      <div class="form-group">
        <label>Contactpersoon *</label>
        <input type="text" id="contact-naam" placeholder="Tom Janssens">
        <span class="error-msg" id="err-contact">Verplicht veld</span>
      </div>
      <div class="form-group">
        <label>E-mailadres *</label>
        <input type="email" id="email" placeholder="tom@kapper.be">
        <span class="error-msg" id="err-email">Geldig e-mailadres verplicht</span>
      </div>
      <div class="form-group">
        <label>Telefoonnummer *</label>
        <input type="tel" id="telefoon" placeholder="+32 477 123 456">
        <span class="error-msg" id="err-tel">Verplicht veld</span>
      </div>
      <div class="form-group full">
        <label>Adres salon *</label>
        <input type="text" id="adres" placeholder="Kerkstraat 12, 2000 Antwerpen">
        <span class="error-msg" id="err-adres">Verplicht veld</span>
      </div>
      <div class="form-group">
        <label>BTW-nummer (optioneel)</label>
        <input type="text" id="btw" placeholder="BE0123.456.789">
      </div>
      <div class="form-group">
        <label>WhatsApp Business nummer *</label>
        <input type="tel" id="whatsapp" placeholder="+32 478 654 321">
        <span class="error-msg" id="err-wa">Verplicht veld</span>
      </div>
    </div>

    <div class="btn-row">
      <button class="btn-secondary" onclick="naarStap(1)">← Terug</button>
      <button class="btn-primary" onclick="valideerGegevens()">Verder →</button>
    </div>
  </div>

  <!-- SECTIE 3: CONTRACT LEZEN -->
  <div class="section" id="sec-3">
    <h1>Abonnementsovereenkomst</h1>
    <p class="subtitle">Lees het contract aandachtig voor je ondertekent</p>

    <div class="contract-box" id="contract-tekst">
      <!-- Wordt dynamisch ingevuld -->
    </div>

    <div class="check-group">
      <input type="checkbox" id="check-gelezen" onchange="checkVoorwaarden()">
      <label for="check-gelezen">Ik heb het contract gelezen en begrepen</label>
    </div>
    <div class="check-group">
      <input type="checkbox" id="check-voorwaarden" onchange="checkVoorwaarden()">
      <label for="check-voorwaarden">Ik ga akkoord met de <a href="/voorwaarden.html" target="_blank">algemene voorwaarden</a> en het <a href="/privacy.html" target="_blank">privacybeleid</a></label>
    </div>

    <div class="btn-row">
      <button class="btn-secondary" onclick="naarStap(2)">← Terug</button>
      <button class="btn-primary" id="btn-naar-handtekening" onclick="naarStap(4)" disabled>Ondertekenen →</button>
    </div>
  </div>

  <!-- SECTIE 4: HANDTEKENING -->
  <div class="section" id="sec-4">
    <h1>Handtekening plaatsen</h1>
    <p class="subtitle">Teken hieronder of typ je naam als digitale handtekening</p>

    <div class="signature-area">
      <span class="sig-label">Handtekening</span>
      <div class="sig-tabs">
        <button class="sig-tab active" onclick="sigTab('teken', this)">Tekenen</button>
        <button class="sig-tab" onclick="sigTab('typ', this)">Typen</button>
      </div>

      <canvas id="sig-canvas" width="700" height="140"></canvas>

      <div id="sig-type-input">
        <input type="text" id="sig-naam-input" placeholder="Typ je volledige naam" oninput="updateTypedSig(this.value)">
      </div>

      <button class="sig-clear" onclick="wisHandtekening()">✕ Wissen</button>
    </div>

    <div class="check-group">
      <input type="checkbox" id="check-akkoord">
      <label for="check-akkoord">Door te ondertekenen bevestig ik dat ik bevoegd ben namens <strong id="sig-salon-naam">de salon</strong> en ga ik akkoord met het contract</label>
    </div>

    <div class="btn-row">
      <button class="btn-secondary" onclick="naarStap(3)">← Terug</button>
      <button class="btn-primary" onclick="onderteken()">Contract ondertekenen ✓</button>
    </div>
  </div>

  <!-- SECTIE 5: SUCCES -->
  <div class="section" id="sec-5">
    <div style="text-align:center;padding:1rem 0">
      <div class="success-icon">✓</div>
      <h1>Contract ondertekend!</h1>
      <p class="subtitle">Gefeliciteerd — je KapperBot account is actief</p>
    </div>

    <div class="success-box">
      <div class="success-row"><span>Salon</span><span id="res-salon">—</span></div>
      <div class="success-row"><span>Plan</span><span id="res-plan">—</span></div>
      <div class="success-row"><span>Startdatum</span><span id="res-datum">—</span></div>
      <div class="success-row"><span>Eerste factuur</span><span id="res-factuur">—</span></div>
      <div class="success-row"><span>Contract ID</span><span id="res-id">—</span></div>
    </div>

    <button class="download-btn" onclick="downloadContract()">
      ↓ Download contract (PDF)
    </button>

    <div class="btn-row" style="margin-top:1rem">
      <button class="btn-primary" onclick="window.location.href='/dashboard.html'">Naar mijn dashboard →</button>
    </div>
  </div>

</div>

<script>
// ── STATE ──────────────────────────────────────────────────────────────────
const state = {
  plan: 'pro',
  prijs: 49,
  salon: '', contact: '', email: '', telefoon: '',
  adres: '', btw: '', whatsapp: '',
  handtekening: null,
  contractId: null,
  datum: new Date().toLocaleDateString('nl-BE', { day:'numeric', month:'long', year:'numeric' })
};

// ── PLAN KIEZEN ────────────────────────────────────────────────────────────
function kiesPlan(plan, prijs, el) {
  state.plan = plan;
  state.prijs = prijs;
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// ── NAVIGATIE ──────────────────────────────────────────────────────────────
function naarStap(stap) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + stap).classList.add('active');

  for(let i = 1; i <= 4; i++) {
    const s = document.getElementById('step-' + i);
    const l = document.getElementById('line-' + i);
    s.className = 'step ' + (i < stap ? 'done' : i === stap ? 'active' : 'todo');
    if(l) l.className = 'step-line ' + (i < stap ? 'done' : '');
  }

  if(stap === 3) vulContractIn();
  if(stap === 4) document.getElementById('sig-salon-naam').textContent = state.salon || 'de salon';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── VALIDATIE GEGEVENS ─────────────────────────────────────────────────────
function valideerGegevens() {
  let ok = true;
  const velden = [
    ['salon-naam', 'err-salon', v => v.length > 1],
    ['contact-naam', 'err-contact', v => v.length > 1],
    ['email', 'err-email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
    ['telefoon', 'err-tel', v => v.length > 7],
    ['adres', 'err-adres', v => v.length > 5],
    ['whatsapp', 'err-wa', v => v.length > 7],
  ];

  velden.forEach(([id, errId, check]) => {
    const val = document.getElementById(id).value.trim();
    const err = document.getElementById(errId);
    if(!check(val)) { err.classList.add('show'); ok = false; }
    else err.classList.remove('show');
  });

  if(ok) {
    state.salon = document.getElementById('salon-naam').value.trim();
    state.contact = document.getElementById('contact-naam').value.trim();
    state.email = document.getElementById('email').value.trim();
    state.telefoon = document.getElementById('telefoon').value.trim();
    state.adres = document.getElementById('adres').value.trim();
    state.btw = document.getElementById('btw').value.trim();
    state.whatsapp = document.getElementById('whatsapp').value.trim();
    naarStap(3);
  }
}

// ── CONTRACT TEKST INVULLEN ────────────────────────────────────────────────
function vulContractIn() {
  const planNamen = { starter:'Starter', pro:'Pro', salon:'Salon' };
  const startDatum = new Date();
  const gratisTot = new Date(startDatum);
  gratisTot.setDate(gratisTot.getDate() + 30);
  const eersteFactuur = gratisTot.toLocaleDateString('nl-BE', { day:'numeric', month:'long', year:'numeric' });

  document.getElementById('contract-tekst').innerHTML = `
    <h3>ABONNEMENTSOVEREENKOMST — KAPPERBOT</h3>
    <p>Tussen <strong>MBD Advies en Projecten BV</strong>, BTW BE1031104852, gevestigd te Antwerpen (hierna "KapperBot") en <strong>${state.salon}</strong>, vertegenwoordigd door ${state.contact}, gevestigd te ${state.adres}${state.btw ? ', BTW ' + state.btw : ''} (hierna "Klant").</p>

    <h3>Artikel 1 — Voorwerp</h3>
    <p>KapperBot verleent de Klant toegang tot het KapperBot SaaS-platform (AI-chatbot voor WhatsApp-afsprakenbeheer) conform het gekozen abonnement <strong>${planNamen[state.plan]} (€${state.prijs}/maand excl. BTW)</strong>.</p>

    <h3>Artikel 2 — Gratis proefperiode</h3>
    <p>De Klant geniet van een gratis proefperiode van 30 dagen, startend op ${state.datum}. De eerste factuur wordt verstuurd op ${eersteFactuur}. Tijdens de proefperiode kan de Klant het abonnement kosteloos opzeggen.</p>

    <h3>Artikel 3 — Looptijd en verlenging</h3>
    <p>Het abonnement wordt maandelijks automatisch verlengd. Opzegging kan op elk moment met een opzegtermijn van 30 dagen vóór de volgende factuurdatum.</p>

    <h3>Artikel 4 — Betaling</h3>
    <p>Facturen worden maandelijks automatisch verstuurd via e-mail (PDF) en via het Peppol-netwerk indien de Klant een BTW-nummer heeft. Betaling geschiedt automatisch via de opgegeven betaalmethode.</p>

    <h3>Artikel 5 — WhatsApp-nummer</h3>
    <p>De dienst wordt geactiveerd op het WhatsApp Business-nummer <strong>${state.whatsapp}</strong>. Wijzigingen van het nummer worden doorgegeven via info@kapperbot.be.</p>

    <h3>Artikel 6 — Verplichtingen Klant</h3>
    <p>De Klant gebruikt KapperBot uitsluitend voor wettige doeleinden, bewaart zijn inloggegevens veilig en informeert eindgebruikers over het gebruik van AI in de chatbot.</p>

    <h3>Artikel 7 — Beschikbaarheid</h3>
    <p>KapperBot streeft naar 99,5% uptime per maand. KapperBot is niet aansprakelijk voor onderbrekingen door derden (WhatsApp/Meta, Twilio).</p>

    <h3>Artikel 8 — Aansprakelijkheid</h3>
    <p>De aansprakelijkheid van KapperBot is beperkt tot de bedragen betaald in de laatste 3 maanden. KapperBot is niet aansprakelijk voor indirecte schade of gederfde winst.</p>

    <h3>Artikel 9 — Gegevensbescherming</h3>
    <p>KapperBot verwerkt persoonsgegevens conform de AVG/GDPR. Het volledige privacybeleid is beschikbaar op kapperbot.be/privacy.</p>

    <h3>Artikel 10 — Toepasselijk recht</h3>
    <p>Belgisch recht is van toepassing. Geschillen worden voorgelegd aan de rechtbank van het arrondissement Antwerpen.</p>

    <p style="margin-top:1.5rem;color:#666;font-size:12px">Opgemaakt te Antwerpen op ${state.datum} in twee digitale exemplaren, elk met gelijke rechtskracht. De digitale handtekening heeft dezelfde juridische waarde als een geschreven handtekening conform de eIDAS-verordening (EU) 910/2014.</p>
  `;
}

// ── CHECKBOXES ─────────────────────────────────────────────────────────────
function checkVoorwaarden() {
  const gelezen = document.getElementById('check-gelezen').checked;
  const voorw = document.getElementById('check-voorwaarden').checked;
  document.getElementById('btn-naar-handtekening').disabled = !(gelezen && voorw);
}

// ── HANDTEKENING CANVAS ────────────────────────────────────────────────────
let canvas, ctx, tekenen = false;

window.addEventListener('load', () => {
  canvas = document.getElementById('sig-canvas');
  ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#f5f2ed';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  canvas.addEventListener('mousedown', e => { tekenen = true; ctx.beginPath(); ctx.moveTo(...getPos(e)); });
  canvas.addEventListener('mousemove', e => { if(!tekenen) return; ctx.lineTo(...getPos(e)); ctx.stroke(); });
  canvas.addEventListener('mouseup', () => { tekenen = false; });
  canvas.addEventListener('touchstart', e => { e.preventDefault(); tekenen = true; ctx.beginPath(); ctx.moveTo(...getPos(e.touches[0])); }, {passive:false});
  canvas.addEventListener('touchmove', e => { e.preventDefault(); if(!tekenen) return; ctx.lineTo(...getPos(e.touches[0])); ctx.stroke(); }, {passive:false});
  canvas.addEventListener('touchend', () => { tekenen = false; });
});

function getPos(e) {
  const r = canvas.getBoundingClientRect();
  const scaleX = canvas.width / r.width;
  const scaleY = canvas.height / r.height;
  return [(e.clientX - r.left) * scaleX, (e.clientY - r.top) * scaleY];
}

function sigTab(type, btn) {
  document.querySelectorAll('.sig-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  if(type === 'teken') {
    canvas.style.display = 'block';
    document.getElementById('sig-type-input').style.display = 'none';
  } else {
    canvas.style.display = 'none';
    document.getElementById('sig-type-input').style.display = 'block';
  }
  wisHandtekening();
}

function updateTypedSig(val) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'italic 52px Georgia, serif';
  ctx.fillStyle = '#f5f2ed';
  ctx.textAlign = 'center';
  ctx.fillText(val, canvas.width / 2, canvas.height / 2 + 18);
}

function wisHandtekening() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('sig-naam-input') && (document.getElementById('sig-naam-input').value = '');
}

// ── ONDERTEKENEN ───────────────────────────────────────────────────────────
function onderteken() {
  if(!document.getElementById('check-akkoord').checked) {
    alert('Vink het akkoordvakje aan om te ondertekenen.');
    return;
  }

  const leeg = !ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(v => v !== 0);
  if(leeg) {
    alert('Plaats eerst je handtekening.');
    return;
  }

  state.handtekening = canvas.toDataURL('image/png');
  state.contractId = 'KB-' + Date.now().toString(36).toUpperCase();

  // Toon succespagina
  const eersteFactuur = new Date();
  eersteFactuur.setDate(eersteFactuur.getDate() + 30);

  document.getElementById('res-salon').textContent = state.salon;
  document.getElementById('res-plan').textContent = state.plan.charAt(0).toUpperCase() + state.plan.slice(1) + ' — €' + state.prijs + '/mnd';
  document.getElementById('res-datum').textContent = state.datum;
  document.getElementById('res-factuur').textContent = eersteFactuur.toLocaleDateString('nl-BE', { day:'numeric', month:'long', year:'numeric' });
  document.getElementById('res-id').textContent = state.contractId;

  naarStap(5);

  // Stuur data naar API (optioneel)
  fetch('/api/contract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...state,
      ondertekend_op: new Date().toISOString(),
    })
  }).catch(() => {});
}

// ── CONTRACT DOWNLOADEN ────────────────────────────────────────────────────
function downloadContract() {
  const planNamen = { starter:'Starter', pro:'Pro', salon:'Salon' };
  const inhoud = `
ABONNEMENTSOVEREENKOMST — KAPPERBOT
====================================
Contract ID: ${state.contractId}
Datum: ${state.datum}

PARTIJEN
--------
Leverancier: MBD Advies en Projecten BV
BTW: BE1031104852
Antwerpen, België
E-mail: info@kapperbot.be

Klant: ${state.salon}
Contactpersoon: ${state.contact}
E-mail: ${state.email}
Telefoon: ${state.telefoon}
Adres: ${state.adres}
${state.btw ? 'BTW: ' + state.btw : ''}
WhatsApp: ${state.whatsapp}

ABONNEMENT
----------
Plan: ${planNamen[state.plan]}
Prijs: €${state.prijs}/maand excl. BTW
Gratis proefperiode: 30 dagen

HANDTEKENING
------------
Digitaal ondertekend door ${state.contact}
Namens: ${state.salon}
Datum: ${state.datum}
Contract ID: ${state.contractId}

Dit contract is digitaal ondertekend conform eIDAS (EU) 910/2014.
De volledige voorwaarden zijn beschikbaar op kapperbot.be/voorwaarden
  `.trim();

  const blob = new Blob([inhoud], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'KapperBot-Contract-' + state.contractId + '.txt';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
</body>
</html>
