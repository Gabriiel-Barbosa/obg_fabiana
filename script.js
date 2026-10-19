(function () {
  var envelope = document.getElementById('envelope');
  var seal = document.getElementById('open-letter');
  var carta = document.getElementById('carta');
  var bar = document.getElementById('progress-bar');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function openLetter() {
    if (envelope.classList.contains('open')) return;
    envelope.classList.add('open');
    setTimeout(function () {
      carta.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }, reduce ? 0 : 1500);
  }
  seal.addEventListener('click', openLetter);
  envelope.addEventListener('click', function (e) { if (e.target !== seal) openLetter(); });

  // reveal on scroll
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

  // reading progress
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
