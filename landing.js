/* Zigarthanda — landing section: a greeting that follows the visitor's clock,
   and quotes from films and books that rotate gently under your name. */
(function () {

  /* ---------- Your quotes ----------
     Add, remove or reorder freely. kind: "film" shows in Matinee blue, "book" in Verandah plum.
     Keep each line short: one or two sentences reads best. */
  var QUOTES = [
    { text: "[A line from a film you love.]", source: "[Film], [Year]", kind: "film" },
    { text: "[A line from a book you love.]", source: "[Author], [Book]", kind: "book" },
    { text: "[Another line from a film.]",    source: "[Film], [Year]", kind: "film" },
    { text: "[Another line from a book.]",    source: "[Author], [Book]", kind: "book" }
  ];

  /* ---------- Greeting by time of day ---------- */
  var g = document.querySelector('[data-greeting]');
  if (g) {
    var h = new Date().getHours();
    g.textContent =
      h >= 5 && h < 12 ? 'Good morning. The 2:30 show is a few hours away, and the verandah is quiet for now.' :
      h >= 12 && h < 17 ? 'Good afternoon. The 2:30 show is on; step into the Matinee.' :
      h >= 17 && h < 22 ? 'Good evening. It’s past five, and the verandah is set with tea.' :
                          'Still up? Both doors are open: a late show, or a book on the verandah.';
  }

  /* ---------- Rotating quotes ---------- */
  var box = document.querySelector('[data-quote]');
  if (!box || !QUOTES.length) return;
  var textEl = box.querySelector('[data-quote-text]');
  var srcEl = box.querySelector('[data-quote-source]');
  var i = Math.floor(Math.random() * QUOTES.length);

  function show(q) {
    textEl.textContent = '“' + q.text.replace(/^["“]|["”]$/g, '') + '”';
    srcEl.textContent = '— ' + q.source;
    box.className = 'quote quote-' + (q.kind === 'book' ? 'book' : 'film');
  }
  show(QUOTES[i]);

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || QUOTES.length < 2) return;

  var paused = false;
  box.addEventListener('mouseenter', function () { paused = true; });
  box.addEventListener('mouseleave', function () { paused = false; });

  setInterval(function () {
    if (paused || document.hidden) return;
    box.classList.add('is-fading');
    setTimeout(function () {
      i = (i + 1) % QUOTES.length;
      show(QUOTES[i]);
    }, 600);
  }, 7000);
})();
