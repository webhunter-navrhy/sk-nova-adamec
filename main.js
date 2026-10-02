(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // hero – slová postupne
  const h1 = $('[data-words]');
  if (h1) {
    let i = 0;
    const wrap = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = t; s.style.animationDelay = (.45 + i++ * 0.08) + 's';
          w.append(s); frag.append(w);
        });
        n.replaceWith(frag);
      } else wrap(n);
    });
    wrap(h1);
  }

  // navigácia
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = $('#burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('is-open'); document.body.style.overflow = ''; }));

  // reveal
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.rv, .clip:not(.hero__img)').forEach(el => {
    const sib = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('rv')) : [];
    const idx = sib.indexOf(el); if (idx > 0) el.style.transitionDelay = Math.min(idx % 6, 5) * 0.08 + 's';
    io.observe(el);
  });

  // počítadlá
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), d = 1600;
    const step = t => { const p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => { el.textContent = '0'; cio.observe(el); });

  // magnetické tlačidlá
  if (matchMedia('(hover:hover)').matches) $$('.mag').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });

  // služby – náhľad fotky pri kurzore
  const pv = $('#ppv'), pvi = pv && $('img', pv);
  if (pv && matchMedia('(hover:hover) and (min-width:961px)').matches) {
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0, on = false;
    const loop = () => { cx += (x - cx) * .16; cy += (y - cy) * .16; pv.style.transform = `translate(${cx}px,${cy}px)`;
      raf = (on || Math.abs(x - cx) > .5 || Math.abs(y - cy) > .5) ? requestAnimationFrame(loop) : 0; };
    $$('.row').forEach(r => {
      r.addEventListener('mouseenter', e => { pvi.src = r.dataset.img; on = true; pv.classList.add('is-on'); x = e.clientX + 200; y = e.clientY; if (!cx) { cx = x; cy = y; } if (!raf) raf = requestAnimationFrame(loop); });
      r.addEventListener('mousemove', e => { if (e.target.closest('.row__a')) { pv.classList.remove('is-on'); return; } pv.classList.add('is-on'); x = e.clientX + 200; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
      r.addEventListener('mouseleave', () => { on = false; pv.classList.remove('is-on'); });
    });
  }

  // postup – výkres sa dokresľuje podľa kroku v strede obrazovky
  const bp = $('#bp'), bpStep = $('#bpStep'), steps = $$('.step');
  if (bp) {
    const sio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const k = +e.target.dataset.step;
      steps.forEach(s => s.classList.toggle('is-on', +s.dataset.step === k));
      bp.dataset.k = k; bpStep.textContent = String(k).padStart(2, '0') + ' / ' + String(steps.length).padStart(2, '0');
    }), { rootMargin: matchMedia('(max-width:960px)').matches ? '-58% 0px -32% 0px' : '-45% 0px -45% 0px' });
    steps.forEach(s => sio.observe(s));
    // ak sekcia ešte nebola dosiahnutá, výkres ukáže aspoň kóty
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting && bp.dataset.k === '0') { bp.dataset.k = 1; steps[0].classList.add('is-on'); o.disconnect(); } }), { threshold: .3 }).observe(bp);
  }

  // galéria – lightbox
  const items = $$('.gi'), lb = $('#lb'), lbimg = $('#lbimg'), lbcap = $('#lbcap'); let cur = 0;
  const show = n => { cur = (n + items.length) % items.length; const g = items[cur]; lbimg.src = g.dataset.full; lbimg.alt = $('img', g).alt; lbcap.textContent = 'Stavba ' + (cur + 1) + ' / ' + items.length; };
  items.forEach((g, n) => g.addEventListener('click', () => { show(n); lb.hidden = false; document.body.style.overflow = 'hidden'; }));
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
  $('#lbx').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  $('#lbp').addEventListener('click', () => show(cur - 1));
  $('#lbn').addEventListener('click', () => show(cur + 1));
  addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });

  // dopyt – predvyplnenie typu stavby z odkazov
  $$('[data-typ]').forEach(a => a.addEventListener('click', () => {
    const inp = $(`#typ input[value="${a.dataset.typ}"]`); if (inp) inp.checked = true;
  }));
  $('#dopyt').addEventListener('submit', e => { e.preventDefault(); $('#formok').hidden = false; });
})();
