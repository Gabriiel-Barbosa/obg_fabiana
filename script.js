(function () {
  var root = document.documentElement;
  var cover = document.getElementById('cover');
  var envelope = document.getElementById('envelope');
  var envLetter = document.getElementById('env-letter');
  var seal = document.getElementById('open-letter');
  var letter = document.querySelector('.letter');
  var carta = document.getElementById('carta');
  var bar = document.getElementById('progress-bar');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }

  // ---- prepara o texto de abertura (some até a carta abrir) ----
  function prepIntro() {
    var head = document.getElementById('intro-head');
    var body = document.getElementById('intro-body');
    var h1 = head.querySelector('h1');
    var t = 0;

    function item(el, d) { el.classList.add('intro-item'); el.style.setProperty('--d', d + 's'); }

    item(head.querySelector('.dateline'), t); t += .25;

    // título palavra por palavra
    var words = h1.textContent.trim().split(/\s+/);
    h1.setAttribute('aria-label', h1.textContent.trim());
    h1.innerHTML = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'intro-word';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = w;
      s.style.setProperty('--d', (t + i * .09).toFixed(2) + 's');
      h1.appendChild(s);
      if (i < words.length - 1) h1.appendChild(document.createTextNode(' '));
    });
    t += words.length * .09 + .2;

    item(head.querySelector('.subtitle'), t); t += .35;
    item(head.querySelector('.ornament'), t); t += .35;

    var ps = body.querySelectorAll('p');
    item(ps[0], t); t += 1.1;           // saudação escrita à mão
    for (var i = 1; i < ps.length; i++) {
      item(ps[i], Math.min(t, 3));
      t += .1;
    }
  }

  // ---- sequência de abertura ----
  var opening = false;
  async function openLetter() {
    if (opening) return;
    opening = true;

    if (reduce) { finish(); return; }

    cover.classList.add('s-start');
    envelope.classList.add('s-seal');
    await wait(450);
    envelope.classList.add('s-flap');
    await wait(650);
    envelope.classList.add('s-rise');
    await wait(1350);

    // a folha sai do envelope e se transforma na carta
    var from = envLetter.getBoundingClientRect();
    window.scrollTo(0, 0);
    var to = letter.getBoundingClientRect();
    var toH = Math.min(to.height, window.innerHeight - to.top + 40);

    var sheet = document.createElement('div');
    sheet.className = 'sheet-fly';
    sheet.innerHTML = '<span class="hand">Fabanes,</span>';
    sheet.style.left = from.left + 'px';
    sheet.style.top = from.top + 'px';
    sheet.style.width = from.width + 'px';
    sheet.style.height = from.height + 'px';
    document.body.appendChild(sheet);

    envelope.classList.add('s-drop');
    requestAnimationFrame(function () { sheet.classList.add('morph'); });

    var fly = sheet.animate([
      { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px', transform: 'rotate(0deg)' },
      { left: from.left + 'px', top: (from.top - 30) + 'px', width: from.width + 'px', height: from.height + 'px', transform: 'rotate(-2.5deg)', offset: .25 },
      { left: to.left + 'px', top: to.top + 'px', width: to.width + 'px', height: toH + 'px', transform: 'rotate(0deg)' }
    ], { duration: 1300, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' });

    await fly.finished;
    cover.classList.add('gone');
    root.classList.add('opened');
    root.classList.add('played');
    sheet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: 'ease', fill: 'forwards' })
      .finished.then(function () { sheet.remove(); });
    await wait(800);
    cover.style.display = 'none';
  }

  function finish() {
    cover.style.display = 'none';
    root.classList.add('opened', 'played');
    window.scrollTo(0, 0);
  }

  prepIntro();
  seal.addEventListener('click', openLetter);
  envelope.addEventListener('click', function (e) { if (e.target !== seal) openLetter(); });

  // ---- revelar capítulos ao rolar ----
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // ---- progresso de leitura ----
  function progress() {
    var start = carta.offsetTop;
    var end = carta.offsetTop + carta.offsetHeight - window.innerHeight;
    var p = (window.scrollY - start) / Math.max(1, end - start);
    bar.style.width = (Math.min(1, Math.max(0, p)) * 100) + '%';
  }
  window.addEventListener('scroll', progress, { passive: true });
  window.addEventListener('resize', progress);
  progress();
})();
