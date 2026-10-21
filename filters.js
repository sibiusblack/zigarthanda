/* Zigarthanda — search for the Matinee and Verandah pages.
   The search box filters the list as you type, and opening a piece is remembered
   so the homepage seat map can show it as read. */
(function () {
  /* Remember which pieces this reader has opened (their browser only) */
  function markRead(title) {
    try {
      var read = JSON.parse(localStorage.getItem('zig-read') || '[]');
      if (read.indexOf(title) === -1) { read.push(title); localStorage.setItem('zig-read', JSON.stringify(read)); }
    } catch (e) {}
  }
  document.querySelectorAll('a.featured, .piece-row a').forEach(function (a) {
    var t = a.querySelector('.featured-title, .row-title');
    if (t) a.addEventListener('click', function () { markRead(t.textContent.trim()); });
  });

  var list = document.querySelector('[data-pieces]');
  if (!list) return;
  var items = Array.prototype.slice.call(list.querySelectorAll('.piece-row'));

  /* Search */
  var search = document.querySelector('[data-search]');
  var countEl = document.querySelector('[data-count]');
  var emptyEl = document.querySelector('[data-empty]');

  function apply() {
    var q = search ? search.value.trim().toLowerCase() : '';
    var n = 0;
    items.forEach(function (i) {
      var show = !q || i.textContent.toLowerCase().indexOf(q) > -1;
      i.hidden = !show;
      if (show) n++;
    });
    if (countEl) countEl.textContent = n;
    if (emptyEl) emptyEl.hidden = n !== 0;
  }
  if (search) search.addEventListener('input', apply);
  apply();
})();
