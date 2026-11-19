(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const LIKERT = [['😕', 'Nada'], ['🙁', 'Poco'], ['😐', 'Más o menos'], ['🙂', 'Bastante'], ['🤩', '¡Mucho!']];
  const STORE = 'vocacional-ficct-v2';
  const NI = INTERESTS.length, NR = RETOS.length, TOTAL = NI + NR;

  const state = { name: '', step: 0, int: Array(NI).fill(null), ret: Array(NR).fill(null), done: false, t0: 0 };
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* sin almacenamiento */ } };
  const clearSave = () => { try { localStorage.removeItem(STORE); } catch (e) { /* nada */ } };
  const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

  /* ---------- pantallas ---------- */
  function show(id) {
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    $('.topbar .btn-sm').classList.toggle('hidden', id !== 'home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'home') observeReveal();
  }
  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (!go) return;
    e.preventDefault();
    if (go.dataset.go === 'home' && $('#quiz').classList.contains('active') &&
        !confirm('¿Salir del test? Tu avance queda guardado en este navegador.')) return;
    show(go.dataset.go);
    if (go.dataset.go === 'register') setTimeout(() => $('#name').focus(), 400);
  });

  /* ---------- animación al hacer scroll ---------- */
  let io;
  function observeReveal() {
    const els = $$('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    io = io || new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: .12 });
    els.forEach(el => io.observe(el));
  }
  observeReveal();

  /* ---------- registro ---------- */
  $('#regForm').addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#name').value.trim();
    if (!n) return $('#name').focus();
    Object.assign(state, { name: n, step: 0, int: Array(NI).fill(null), ret: Array(NR).fill(null), done: false, t0: Date.now() });
    save();
    show('quiz'); render();
  });

  /* ---------- preguntas ---------- */
  const isInt = () => state.step < NI;
  const current = () => isInt() ? state.int[state.step] : state.ret[state.step - NI];

  function render() {
    const s = state.step;
    $('#progressBar').style.width = `${(s / TOTAL) * 100}%`;
    $('#phaseLabel').textContent = isInt() ? 'Parte 1 · Tus gustos' : 'Parte 2 · Mini retos';
    $('#countLabel').textContent = `${s + 1} / ${TOTAL}`;

    const card = $('#qcard');
    card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');

    if (isInt()) {
      const q = INTERESTS[s], val = state.int[s];
      card.innerHTML = `
        <div class="qsplit">
          <div class="qimg"><img src="${q.img}" alt="" /></div>
          <div>
            <div class="qcat">💡 Pregunta ${s + 1} de ${NI}</div>
            <h2 class="qtext">${q.q}</h2>
            <p class="hint">¿Qué tanto te identificas?</p>
          </div>
        </div>
        <div class="likert">${LIKERT.map(([e, t], k) =>
          `<button class="lk ${val === k ? 'sel' : ''}" data-k="${k}" style="animation-delay:${80 + k * 50}ms"><b>${e}</b><span>${t}</span></button>`).join('')}</div>`;
    } else {
      const i = s - NI, q = RETOS[i], val = state.ret[i];
      let html = `<div class="qcat">${q.icon} Reto ${i + 1} de ${NR} · ${q.cat}</div><h2 class="qtext">${q.q}</h2>`;
      if (q.serie) html += `<div class="serie">${q.serie.map((v, k) =>
        `<span class="${v === '?' ? 'q' : ''}" style="animation-delay:${k * 60}ms">${v}</span>`).join('')}</div>`;
      if (q.fig) html += `<div class="figs">${q.fig.map((v, k) =>
        `<div class="f ${v === '?' ? 'q' : ''}" style="animation-delay:${k * 70}ms">${v}</div>`).join('')}</div>`;
      const opts = q.of || q.o;
      html += `<div class="opts">${opts.map((o, k) =>
        `<button class="opt ${q.of ? 'fig' : ''} ${val === k ? 'sel' : ''}" data-k="${k}" style="animation-delay:${120 + k * 50}ms" aria-label="Opción ${'ABCD'[k]}">
          <span class="k">${'ABCD'[k]}</span>${o}</button>`).join('')}</div>`;
      card.innerHTML = html;
    }
    $$('[data-k]', card).forEach(b => b.addEventListener('click', () => pick(+b.dataset.k)));
    $('#prevBtn').style.visibility = s === 0 ? 'hidden' : 'visible';
    $('#nextBtn').disabled = current() === null;
    $('#nextBtn').innerHTML = s === TOTAL - 1 ? 'Ver mi resultado 🎉' : 'Siguiente →';
  }

  let autoNext;
  function pick(k) {
    if (isInt()) state.int[state.step] = k; else state.ret[state.step - NI] = k;
    $$('#qcard [data-k]').forEach(b => b.classList.toggle('sel', +b.dataset.k === k));
    $('#nextBtn').disabled = false;
    save();
    clearTimeout(autoNext);
    autoNext = setTimeout(next, 450);
  }

  function next() {
    clearTimeout(autoNext);
    if (current() === null) return;
    if (state.step === NI - 1) { state.step++; save(); show('interlude'); return; }
    if (state.step < TOTAL - 1) { state.step++; save(); render(); return; }
    finish();
  }
  function prev() {
    clearTimeout(autoNext);
    if (state.step > 0) { state.step--; save(); render(); }
  }
  $('#nextBtn').addEventListener('click', next);
  $('#prevBtn').addEventListener('click', prev);
  $('#startRetos').addEventListener('click', () => { show('quiz'); render(); });

  document.addEventListener('keydown', e => {
    if (!$('#quiz').classList.contains('active') || e.target.tagName === 'INPUT') return;
    const n = parseInt(e.key, 10), max = isInt() ? 5 : 4;
    if (n >= 1 && n <= max) pick(n - 1);
    else if (e.key === 'Enter' || e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  });

  /* ---------- resultados ---------- */
  function compute() {
    const sum = { dev: 0, datos: 0, infra: 0, gestion: 0 }, max = { dev: 0, datos: 0, infra: 0, gestion: 0 };
    INTERESTS.forEach((it, i) => { max[it.r] += 4; sum[it.r] += state.int[i] ?? 0; });
    const ramaPct = {};
    Object.keys(sum).forEach(k => ramaPct[k] = Math.round((sum[k] / max[k]) * 100));
    const interest = state.int.reduce((a, v) => a + (v ?? 0), 0) / (NI * 4);
    const ok = RETOS.reduce((a, q, i) => a + (state.ret[i] === q.a ? 1 : 0), 0);
    const compat = Math.round((interest * 0.75 + (ok / NR) * 0.25) * 100);
    const order = Object.keys(sum).sort((a, b) => ramaPct[b] - ramaPct[a]);
    return { ramaPct, ok, compat, order };
  }

  function verdict(p) {
    if (p >= 80) return ['¡Naciste para esto!', 'Tus gustos encajan muchísimo con Ingeniería en Sistemas. ¡Te va a encantar la carrera!'];
    if (p >= 60) return ['Muy compatible', 'Tienes muchos intereses en común con la carrera. Vale la pena que la consideres en serio.'];
    if (p >= 40) return ['Compatible', 'Hay cosas de la carrera que te pueden gustar. Investiga más y habla con estudiantes de la FICCT.'];
    return ['Poco compatible', 'Por ahora tus gustos van por otro lado, ¡y está bien! Explora otras carreras que se acerquen más a ti.'];
  }

  function radarSVG(vals) {
    const keys = ['dev', 'datos', 'infra', 'gestion'], labels = ['Desarrollo', 'Datos e IA', 'Redes y seguridad', 'Emprendimiento'];
    const C = 170, R = 120, pt = (k, v) => {
      const a = -Math.PI / 2 + k * Math.PI / 2;
      return [C + Math.cos(a) * R * v, C + Math.sin(a) * R * v];
    };
    let rings = '';
    [.25, .5, .75, 1].forEach(s => rings += `<polygon points="${keys.map((_, k) => pt(k, s).join(',')).join(' ')}" fill="none" stroke="#D3DDEA"/>`);
    const axes = keys.map((_, k) => `<line x1="${C}" y1="${C}" x2="${pt(k, 1)[0]}" y2="${pt(k, 1)[1]}" stroke="#D3DDEA"/>`).join('');
    const area = keys.map((key, k) => pt(k, Math.max(vals[key] / 100, .04)).join(',')).join(' ');
    const dots = keys.map((key, k) => { const [x, y] = pt(k, Math.max(vals[key] / 100, .04)); return `<circle cx="${x}" cy="${y}" r="5" fill="#5DB82E"/>`; }).join('');
    const pos = [[C, 14, 'middle'], [C + R + 10, C - 2, 'start'], [C, C + R + 30, 'middle'], [C - R - 10, C - 2, 'end']];
    const lbl = labels.map((l, k) => `<text x="${pos[k][0]}" y="${pos[k][1]}" text-anchor="${pos[k][2]}" font-size="16" font-weight="600" fill="#0A2558" font-family="IBM Plex Sans, Arial, sans-serif">${l}<tspan x="${pos[k][0]}" dy="19" fill="#2E7A12" font-weight="700">${vals[keys[k]]}%</tspan></text>`).join('');
    return `<svg class="radar" viewBox="-95 -12 530 380" role="img" aria-label="Perfil de intereses">${rings}${axes}
      <g class="area"><polygon points="${area}" fill="rgba(93,184,46,.28)" stroke="#5DB82E" stroke-width="3" stroke-linejoin="round"/>${dots}</g>${lbl}</svg>`;
  }

  function finish() {
    state.done = true; save();
    const res = compute();
    const [title, text] = verdict(res.compat);
    const top = RAMAS[res.order[0]], sec = RAMAS[res.order[1]];
    const circ = 2 * Math.PI * 70;
    const mins = Math.max(1, Math.round((Date.now() - (state.t0 || Date.now())) / 60000));

    $('#resultsBox').innerHTML = `
      <div class="res-hero">
        <div class="ring">
          <svg width="170" height="170"><circle cx="85" cy="85" r="70" stroke="rgba(255,255,255,.15)" stroke-width="14" fill="none"/>
            <circle id="ringArc" cx="85" cy="85" r="70" stroke="#5DB82E" stroke-width="14" fill="none" stroke-linecap="round"
              stroke-dasharray="${circ}" stroke-dashoffset="${circ}" style="transition:stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)"/></svg>
          <div class="val"><div><b id="pctNum">0%</b><small>compatibilidad</small></div></div>
        </div>
        <div>
          <p class="kicker">${esc(state.name)}, tu resultado con Ingeniería en Sistemas</p>
          <h2>${title}</h2>
          <p>${text}</p>
          <div class="badges"><span>🧩 ${res.ok}/${NR} retos correctos</span><span>⏱ ${mins} min</span><span>${top.emoji} ${top.name}</span></div>
        </div>
      </div>

      <div class="box match">
        <img src="${top.img}" alt="Ilustración de ${top.name}" />
        <div>
          <span class="tag" style="background:${top.color}">Tu rama ideal</span>
          <h3>${top.emoji} ${top.name}</h3>
          <p class="muted">${top.desc}</p>
          <div class="lists">
            <div><h4>📚 Materias que te van a gustar</h4><ul>${top.materias.map(m => `<li>${m}</li>`).join('')}</ul></div>
            <div><h4>💼 Podrías trabajar como</h4><ul>${top.puestos.map(m => `<li>${m}</li>`).join('')}</ul></div>
          </div>
        </div>
      </div>

      <div class="res-grid">
        <div class="box"><h3>🧭 Tu perfil</h3>${radarSVG(res.ramaPct)}</div>
        <div class="box"><h3>🏅 Tus ramas, de mayor a menor</h3>
          ${res.order.map((k, i) => `<div class="catrow"><div class="lbl"><span>${i + 1}. ${RAMAS[k].emoji} ${RAMAS[k].name}</span><span>${res.ramaPct[k]}%</span></div>
            <div class="track"><div class="fill" data-w="${res.ramaPct[k]}" style="background:${RAMAS[k].color}"></div></div></div>`).join('')}
          <div class="second"><img src="${sec.img}" alt="" /><div><strong>También va contigo:</strong> ${sec.name}<br><span class="muted">${sec.desc}</span></div></div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-dark" id="revBtn">🧩 Ver mis retos</button>
        <button class="btn btn-ghost" id="shareBtn">🔗 Compartir</button>
        <button class="btn btn-ghost" id="printBtn">🖨️ Guardar en PDF</button>
        <button class="btn btn-primary" id="againBtn">↻ Repetir test</button>
      </div>
      <div class="box review hidden" id="reviewBox"><h3>Revisión de los mini retos</h3>
        ${RETOS.map((q, i) => {
          const good = state.ret[i] === q.a, opts = q.of ? null : q.o;
          const yours = state.ret[i] === null ? 'Sin responder' : (opts ? opts[state.ret[i]] : 'Opción ' + 'ABCD'[state.ret[i]]);
          const right = opts ? opts[q.a] : 'Opción ' + 'ABCD'[q.a];
          return `<div class="rv"><div class="h"><span class="${good ? 'ok' : 'bad'}">${good ? '✔' : '✘'}</span>
            <span>${i + 1}. ${q.q}${q.serie ? ' ' + q.serie.join(', ') : ''}</span></div>
            <p>Tu respuesta: <b>${yours}</b>${good ? '' : ` · Correcta: <b>${right}</b>`}</p><p>${q.why}</p></div>`;
        }).join('')}
      </div>

      <div class="box cta-final">
        <img src="img/graduacion.png" alt="" />
        <div><h3>¿Te animas a ser ingeniero en sistemas?</h3>
        <p class="muted">Puedes ingresar a la FICCT – UAGRM por la PSA (examen de admisión) o por el CUP (curso preuniversitario). Prepárate en matemática, computación, física e inglés.</p></div>
      </div>`;
    show('results');

    requestAnimationFrame(() => setTimeout(() => {
      $('#ringArc').style.strokeDashoffset = circ * (1 - res.compat / 100);
      $$('.fill').forEach(f => f.style.width = f.dataset.w + '%');
      countUp($('#pctNum'), res.compat);
    }, 250));
    if (res.compat >= 40) confetti();

    $('#revBtn').onclick = () => { $('#reviewBox').classList.toggle('hidden'); $('#reviewBox').scrollIntoView({ behavior: 'smooth' }); };
    $('#printBtn').onclick = () => { $('#reviewBox').classList.remove('hidden'); window.print(); };
    $('#againBtn').onclick = () => { clearSave(); $('#name').value = state.name; show('register'); };
    $('#shareBtn').onclick = async () => {
      const t = `Hice el test vocacional de Ingeniería en Sistemas (FICCT – UAGRM): ${res.compat}% de compatibilidad y mi rama ideal es ${top.name}. ¡Hazlo tú también!`;
      const data = { title: 'Test vocacional · Ingeniería en Sistemas', text: t, url: location.href.split('#')[0] };
      try {
        if (navigator.share) await navigator.share(data);
        else { await navigator.clipboard.writeText(`${t} ${data.url}`); toast('📋 Copiado, ¡pégalo donde quieras!'); }
      } catch (e) { /* cancelado */ }
    };
  }

  function countUp(el, to) {
    const t0 = performance.now(), d = 1500;
    const step = t => { const p = Math.min((t - t0) / d, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + '%'; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = $('#confetti'), x = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const colors = ['#5DB82E', '#0A2558', '#9BDA72', '#2F80ED', '#F2C94C'];
    const P = Array.from({ length: 160 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * .5,
      w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, vy: 2 + Math.random() * 3.5, vx: -1.5 + Math.random() * 3,
      r: Math.random() * 6, vr: -.15 + Math.random() * .3, col: colors[(Math.random() * colors.length) | 0] }));
    const t0 = performance.now();
    (function loop(t) {
      x.clearRect(0, 0, c.width, c.height);
      P.forEach(p => { p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.col; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); });
      if (t - t0 < 4200) requestAnimationFrame(loop); else x.clearRect(0, 0, c.width, c.height);
    })(t0);
  }

  /* ---------- retomar avance ---------- */
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && saved.name && !saved.done && saved.int?.length === NI && saved.ret?.length === NR &&
        confirm(`Hola ${saved.name}, dejaste el test a medias. ¿Quieres continuarlo?`)) {
      Object.assign(state, saved);
      show('quiz'); render();
    }
  } catch (e) { /* nada guardado */ }
})();
