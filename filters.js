/* Zigarthanda — tickets and search for the Matinee and Verandah pages.
   Each piece in the list gets its ticket stub and seat number here (oldest piece is No. 1),
   the search box filters the list as you type, and opening a piece is remembered
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

  /* Ticket stubs with seat numbers */
  items.forEach(function (li, i) {
    var a = li.querySelector('a');
    if (!a || a.querySelector('.stub')) return;
    var stub = document.createElement('span');
    stub.className = 'stub';
    stub.setAttribute('aria-hidden', 'true');
    stub.innerHTML = '<span class="stub-label">Seat</span><span class="stub-no">No. ' + (items.length - i) + '</span>';
    a.appendChild(stub);
  });

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
    if (countEl) countEl.textContent = n + (n === 1 ? ' piece' : ' pieces');
    if (emptyEl) emptyEl.hidden = n !== 0;
  }
  if (search) search.addEventListener('input', apply);
  apply();
})();
