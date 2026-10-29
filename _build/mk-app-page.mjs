// Builds bh-site/<app>/index.html from app-pages/<app>.json and the shots in bh-site/<app>/shots/.
// Run from the site root: node _build/mk-app-page.mjs <app>. Folders starting with _ are not published by Pages.
// Same sky, fonts and tokens as the home page, so the site reads as one thing.
import fs from 'fs';
const app = process.argv[2];
const cfg = JSON.parse(fs.readFileSync(`_build/${app}.json`, 'utf8'));
const home = fs.readFileSync('index.html', 'utf8');
const logo = home.match(/<img src="data:image\/png;base64,[^"]+"[^>]*>/)[0];
const stars = home.slice(home.indexOf('<script>'), home.indexOf('</script>') + 9);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shotDir = `${app}/shots`;
const shots = fs.existsSync(shotDir) ? fs.readdirSync(shotDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort((a, b) => parseInt(a) - parseInt(b)) : [];
const label = f => (cfg.shotLabels && cfg.shotLabels[f]) || f.replace(/^\d+-?/, '').replace(/\.\w+$/, '').replace(/[-_]/g, ' ');
const legal = cfg.legal
  ? `<p><a href="privacy.html">Privacy policy</a> · <a href="terms.html">Terms of use</a></p>`
  : `<p class="muted">The privacy policy and terms of use go up here when ${esc(cfg.name)} is released.</p>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(cfg.name)} · Blue Hour</title>
<link rel="icon" href="icon.png">
<meta name="description" content="${esc(cfg.name)}: ${esc(cfg.pitch)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Figtree:wght@400;500;600&display=swap">
<style>
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; }
img { max-width: 100%; height: auto; }
/* Layout: the home page's dusk sky, then the app's own colour carries the screenshots and features. */
:root {
  --sky-top: #0b1a33; --sky-mid: #1c3a6b; --sky-low: #4a74b4; --horizon: #b9cdea;
  --bg: #f4f7fb; --surface: #ffffff; --ink: #142036; --muted: #55627a; --line: #dbe3ee;
  --accent: #2c5b9e; --app: ${cfg.color}; --app-soft: ${cfg.color}1f;
  --f-display: "Bricolage Grotesque", "Segoe UI", system-ui, sans-serif;
  --f-body: "Figtree", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
@media all { :root:not([data-theme="light"]) {
  --bg: #0a1424; --surface: #111e33; --ink: #e6edf7; --muted: #9aabc4; --line: #22324d;
  --accent: #8db4f0; --app-soft: ${cfg.color}33; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #0a1424; --surface: #111e33; --ink: #e6edf7; --muted: #9aabc4; --line: #22324d;
  --accent: #8db4f0; --app-soft: ${cfg.color}33; color-scheme: dark }

body { background: var(--bg); color: var(--ink); font: 17px/1.65 var(--f-body); }
.wrap { max-width: 880px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.narrow > * { max-width: 680px; }

.sky { position: relative; color: #eef4ff; overflow: hidden;
  background: linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 55%, var(--sky-low) 88%, var(--horizon) 100%); }
.sky canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.sky .wrap { position: relative; padding-block: 40px 64px; }
.sky nav { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 44px; flex-wrap: wrap; }
.foxtile { background: #fff; border-radius: 11px; box-shadow: 0 2px 10px rgba(5,12,30,.35); }
.mark { display: flex; align-items: center; gap: 10px; font: 700 1.05rem var(--f-display); letter-spacing: .01em; color: inherit; text-decoration: none; }
.sky nav ul { list-style: none; display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 0; padding: 0; font-size: .9rem; }
.sky nav a { color: #d5e3fa; text-decoration: none; }
.sky nav ul a:hover, .sky nav ul a:focus-visible { color: #fff; text-decoration: underline; }
.hero { display: grid; grid-template-columns: auto 1fr; gap: 20px; align-items: center; }
.ico { display: block; width: 84px; height: 84px; border-radius: 22px; outline: 1px solid rgba(255,255,255,.18); box-shadow: 0 10px 30px rgba(3,8,22,.45), inset 0 1px 0 rgba(255,255,255,.25); }
.hero > div { min-width: 0; }
.eyebrow { font-size: .78rem; letter-spacing: .14em; text-transform: uppercase; color: #a9c2e8; margin: 0 0 6px; }
h1 { font: 700 clamp(2.4rem, 8vw, 3.8rem)/1 var(--f-display); margin: 0; letter-spacing: -.015em; }
.lead { font-size: 1.15rem; color: #d9e5f8; max-width: 36em; margin: 20px 0 22px; text-wrap: pretty; }
.play { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.12); color: #e7efff; border: 1px solid rgba(255,255,255,.25); border-radius: 10px; padding: 7px 14px 7px 12px; font-size: .82rem; line-height: 1.1; cursor: default; }
.play small { display: block; font-size: .62rem; opacity: .8; text-transform: uppercase; letter-spacing: .05em; }
.horizon { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: rgba(255,255,255,.55); }

main section { padding-block: 48px 8px; }
h2 { font: 700 1.7rem/1.15 var(--f-display); margin: 0 0 18px; text-wrap: balance; letter-spacing: -.005em; }
h3 { font: 600 1.08rem/1.3 var(--f-body); margin: 0 0 4px; }
p { margin: 0 0 14px; }
.muted { color: var(--muted); }
a { color: var(--accent); }

/* screenshots: a swipeable strip of phones */
.shots { display: flex; gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 6px 2px 14px; scrollbar-width: none; scroll-behavior: smooth; }
.shots::-webkit-scrollbar { display: none; }
.shotbox { position: relative; }
.nav { position: absolute; top: calc(50% - 30px); width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font: 600 1.5rem/1 var(--f-body); cursor: pointer; box-shadow: 0 6px 18px rgba(10,20,40,.18); z-index: 1; }
.nav.prev { left: -6px; } .nav.next { right: -6px; }
.nav:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.dots { display: flex; justify-content: center; gap: 7px; margin-top: 2px; }
.dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--line); transition: background .2s, width .2s; }
.dots i.on { background: var(--app); width: 18px; border-radius: 4px; }
@media (hover: none) { .nav { display: none; } }
.shots figure { flex: 0 0 auto; width: min(230px, 62vw); margin: 0; scroll-snap-align: start; }
.phone { border-radius: 26px; padding: 7px; background: #0b1220; box-shadow: 0 14px 34px rgba(10,20,40,.22), 0 0 0 1px var(--line); }
.phone img { display: block; width: 100%; border-radius: 20px; aspect-ratio: 1220 / 2712; object-fit: cover; background: #111; }
.shots figcaption { font-size: .86rem; color: var(--muted); text-align: center; margin-top: 10px; }
.shots figcaption::first-letter { text-transform: uppercase; }

/* features */
.features { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.features li { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px 18px 16px; position: relative; overflow: hidden; }
.features li::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--app); }
.features .n { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 9px; background: var(--app-soft); color: var(--ink); font: 700 .85rem var(--f-display); margin-bottom: 10px; }
.features p { color: var(--muted); font-size: .97rem; margin: 0; }

.card { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px; }
.card p:last-child { margin-bottom: 0; }
.plans { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.plans li { display: grid; gap: 2px; }
.plans b { font-weight: 600; }
.plans span { color: var(--muted); font-size: .96rem; }
.plans .pts { margin: 4px 0 0; padding-left: 1.2em; display: grid; gap: 4px; color: var(--muted); font-size: .96rem; }
.plans .pts li { display: list-item; }
.plans .pts b { color: var(--ink, inherit); }
footer { padding-block: 48px 56px; color: var(--muted); font-size: .88rem; }
footer a { color: var(--muted); }
a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
@media (max-width: 460px) { .hero { grid-template-columns: 1fr; gap: 14px; } .ico { width: 68px; height: 68px; border-radius: 18px; } }
</style>
</head>
<body>

<header class="sky">
  <canvas id="stars" aria-hidden="true"></canvas>
  <div class="wrap">
    <nav aria-label="Site">
      <a class="mark" href="../">${logo}
        Blue Hour
      </a>
      <ul>${shots.length ? '<li><a href="#app">The App</a></li>' : ''}<li><a href="#features">Features</a></li>${cfg.plans ? '<li><a href="#plans">Plans</a></li>' : ''}<li><a href="#data">Your data</a></li><li><a href="../#apps">All apps</a></li></ul>
    </nav>
    <div class="hero">
      <img class="ico" src="icon.png" alt="" width="84" height="84">
      <div>
        <p class="eyebrow">${esc(cfg.eyebrow)}</p>
        <h1>${esc(cfg.name)}</h1>
      </div>
    </div>
    <p class="lead">${esc(cfg.lead)}</p>
    <span class="play" aria-disabled="true"><span aria-hidden="true">▶</span><span><small>Coming soon to</small>Google Play</span></span>
  </div>
  <div class="horizon"></div>
</header>

<main>
${shots.length ? `  <section id="app" aria-label="Screenshots">
    <div class="wrap">
      <div class="shotbox">
        <button class="nav prev" type="button" aria-label="Previous screenshot" hidden>‹</button>
        <div class="shots" tabindex="0" aria-label="Screenshots, swipe for more">
${shots.map(f => `        <figure><div class="phone"><img src="shots/${f}" alt="${esc(cfg.name)}: ${esc(label(f))}" loading="lazy" width="1220" height="2712"></div><figcaption>${esc(label(f))}</figcaption></figure>`).join('\n')}
        </div>
        <button class="nav next" type="button" aria-label="Next screenshot" hidden>›</button>
      </div>
      <div class="dots" aria-hidden="true">${shots.map(() => '<i></i>').join('')}</div>
    </div>
  </section>
` : ''}
  <section id="features">
    <div class="wrap">
      <h2>${esc(cfg.featuresTitle || 'What it does')}</h2>
      <ul class="features">
${cfg.features.map((f, i) => `        <li><span class="n">${i + 1}</span><h3>${esc(f[0])}</h3><p>${esc(f[1])}</p></li>`).join('\n')}
      </ul>
    </div>
  </section>

${cfg.plans ? `  <section id="plans">
    <div class="wrap narrow">
      <h2>Free, with a couple of extras</h2>
      <div class="card"><ul class="plans">
${cfg.plans.map(p => `        <li><b>${esc(p[0])}</b>${Array.isArray(p[1]) ? `<ul class="pts">${p[1].map(([k, v]) => `<li><b>${esc(k)}:</b> ${esc(v)}</li>`).join('')}</ul>` : `<span>${esc(p[1])}</span>`}</li>`).join('\n')}
      </ul></div>
    </div>
  </section>
` : ''}
  <section id="data">
    <div class="wrap narrow">
      <h2>Your data</h2>
      <div class="card">
${cfg.data.map(p => Array.isArray(p) ? `        <h3>${esc(p[0])}</h3><p>${esc(p[1])}</p>` : `        <p>${esc(p)}</p>`).join('\n')}
        ${legal}
      </div>
    </div>
  </section>
</main>

<footer><div class="wrap">${esc(cfg.name)} is part of <a href="../">Blue Hour</a> · one person, two cats, no ads · Questions: contact@bluehourapps.dev</div></footer>

${stars}
${shots.length ? `<script>
(() => {
  const s = document.querySelector('.shots'); if (!s) return;
  const figs = [...s.children], dots = [...document.querySelectorAll('.dots i')];
  const prev = document.querySelector('.nav.prev'), next = document.querySelector('.nav.next');
  const step = () => figs[0].getBoundingClientRect().width + 18;
  function update() {
    const max = s.scrollWidth - s.clientWidth;
    const fits = max < 4;
    document.querySelector('.dots').hidden = fits;
    prev.hidden = fits || s.scrollLeft < 4;
    next.hidden = fits || s.scrollLeft > max - 4;
    const i = Math.round(s.scrollLeft / step());
    dots.forEach((d, k) => d.classList.toggle('on', k === Math.min(i, dots.length - 1)));
  }
  prev.onclick = () => s.scrollBy({ left: -step() });
  next.onclick = () => s.scrollBy({ left: step() });
  s.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();
</script>` : ''}
</body>
</html>
`;
fs.mkdirSync(`${app}`, { recursive: true });
fs.writeFileSync(`${app}/index.html`, html);
for (const bad of ['LemonVanilla', 'lemonvanilla', 'Shay', 'grizzo', 'gmail.com']) if (html.includes(bad)) console.log('WARN', app, 'has', bad);
console.log(app, 'ok', shots.length, 'shots');
