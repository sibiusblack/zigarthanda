/* Zigarthanda — tickets, filters and search for the Matinee and Verandah pages.
   The type, language and year choices are built automatically from each
   piece's data-type, data-lang and data-year, so adding a piece is enough.
   Each piece also gets its ticket stub and seat number here (oldest piece is No. 1),
   and remembers when a reader opens it, so the homepage seat map can show it as read. */
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
  var state = { type: 'all', lang: 'all', year: 'all', q: '' };

  function unique(key) {
    var seen = {};
    items.forEach(function (i) { if (i.dataset[key]) seen[i.dataset[key]] = true; });
    return Object.keys(seen);
  }

  document.querySelectorAll('[data-filter]').forEach(function (group) {
    var key = group.dataset.filter;
    unique(key).sort().forEach(function (value) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.dataset.value = value;
      b.setAttribute('aria-pressed', 'false'); b.textContent = value;
      group.appendChild(b);
    });
    group.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      group.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      state[key] = b.dataset.value;
      apply();
    });
  });

  var yearSel = document.querySelector('[data-filter-year]');
  if (yearSel) {
    unique('year').sort().reverse().forEach(function (y) {
      var o = document.createElement('option'); o.value = y; o.textContent = y; yearSel.appendChild(o);
    });
    yearSel.addEventListener('change', function () { state.year = yearSel.value; apply(); });
  }

  var search = document.querySelector('[data-search]');
  if (search) search.addEventListener('input', function () { state.q = search.value.trim().toLowerCase(); apply(); });

  var countEl = document.querySelector('[data-count]');
  var emptyEl = document.querySelector('[data-empty]');

  function apply() {
    var n = 0;
    items.forEach(function (i) {
      var show = (state.type === 'all' || i.dataset.type === state.type) &&
                 (state.lang === 'all' || i.dataset.lang === state.lang) &&
                 (state.year === 'all' || i.dataset.year === state.year) &&
                 (!state.q || i.textContent.toLowerCase().indexOf(state.q) > -1);
      i.hidden = !show;
      if (show) n++;
    });
    if (countEl) countEl.textContent = n + (n === 1 ? ' piece' : ' pieces');
    if (emptyEl) emptyEl.hidden = n !== 0;
  }
  apply();
})();
