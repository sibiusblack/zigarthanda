/* Zigarthanda — filters and search for the Matinee and Verandah pages.
   The type, language and year choices are built automatically from each
   piece's data-type, data-lang and data-year, so adding a piece is enough. */
(function () {
  var list = document.querySelector('[data-pieces]');
  if (!list) return;
  var items = Array.prototype.slice.call(list.querySelectorAll('.piece-row'));
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
