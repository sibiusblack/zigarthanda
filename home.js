/* Zigarthanda — homepage extras.
   Tonight's double bill and Pick a seat read the pieces straight from matinee.html and
   verandah.html, so they update themselves whenever you add a piece there.
   Pick a seat shows the pieces a reader has already opened as darker seats (their browser only).
   The suggestion form sends to your email through Formspree. */
(function () {

  /* ---------- Gather pieces from the two vertical pages ---------- */
  function collect(doc, vertical, page) {
    var out = [];
    doc.querySelectorAll('a.featured, .piece-row a').forEach(function (a) {
      var isFeatured = a.classList.contains('featured');
      var t = a.querySelector('.featured-title, .row-title');
      if (!t) return;
      var href = a.getAttribute('href') || page;
      out.push({
        vertical: vertical,
        href: href,
        title: t.textContent.trim(),
        meta: ((a.querySelector('.meta') || {}).textContent || '').trim(),
        featured: isFeatured
      });
    });
    return out;
  }

  function load() {
    if (window.ZIG_PIECES) return Promise.resolve(window.ZIG_PIECES);
    var parse = function (html) { return new DOMParser().parseFromString(html, 'text/html'); };
    return Promise.all([
      fetch('/matinee/').then(function (r) { return r.text(); }),
      fetch('/verandah/').then(function (r) { return r.text(); })
    ]).then(function (pages) {
      return {
        matinee: collect(parse(pages[0]), 'Matinee', '/matinee/'),
        verandah: collect(parse(pages[1]), 'Verandah', '/verandah/')
      };
    });
  }

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function fill(card, piece) {
    card.href = piece.href;
    card.querySelector('[data-title]').textContent = piece.title;
    card.querySelector('[data-sub]').textContent = piece.meta;
    card.onclick = function () { markRead(piece.title); };
  }

  load().then(function (data) {
    var all = data.matinee.concat(data.verandah);

    /* Each door's "Latest": the newest piece, the top of that page's list */
    [['matinee', data.matinee], ['verandah', data.verandah]].forEach(function (pair) {
      var link = document.querySelector('[data-latest="' + pair[0] + '"]');
      var newest = pair[1].filter(function (p) { return !p.featured; })[0] || pair[1][0];
      if (!link || !newest) return;
      link.href = newest.href;
      link.querySelector('[data-title]').textContent = newest.title;
      link.onclick = function () { markRead(newest.title); };
      link.hidden = false;
    });

    /* Tonight's double bill */
    var bill = document.querySelector('[data-bill]');
    if (bill && data.matinee.length && data.verandah.length) {
      fill(bill.querySelector('[data-bill-m]'), pick(data.matinee));
      fill(bill.querySelector('[data-bill-v]'), pick(data.verandah));
      bill.hidden = false;
    }

    /* Pick a seat */
    var hall = document.querySelector('[data-hall]');
    if (hall && all.length) buildHall(hall, data);
  }).catch(function () { /* if the pages can't be read, these two sections simply stay hidden */ });

  /* ---------- Pick a seat ---------- */
  function readList() {
    try { return JSON.parse(localStorage.getItem('zig-read') || '[]'); } catch (e) { return []; }
  }
  function markRead(title) {
    try {
      var read = readList();
      if (read.indexOf(title) === -1) { read.push(title); localStorage.setItem('zig-read', JSON.stringify(read)); }
    } catch (e) {}
  }

  function buildHall(hall, data) {
    /* Mix the two verticals so both colours spread across the hall */
    var seen = {}, pieces = [], m = data.matinee, v = data.verandah;
    for (var k = 0; k < Math.max(m.length, v.length); k++) {
      [m[k], v[k]].forEach(function (p) {
        if (!p) return;
        var key = p.title + '|' + p.href;
        if (seen[key]) return;
        seen[key] = true; pieces.push(p);
      });
    }
    var total = Math.max(30, Math.ceil(pieces.length / 10) * 10);
    var spot = {};
    pieces.forEach(function (p, n) { spot[Math.floor(n * total / pieces.length)] = p; });

    var read = readList();
    var box = hall.querySelector('[data-seats]');
    var info = hall.querySelector('[data-seat-info]');
    var rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var current = null;

    for (var s = 0; s < total; s++) {
      var seat = document.createElement('button');
      seat.type = 'button';
      seat.className = 'seat';
      var p = spot[s];
      if (!p) { seat.disabled = true; seat.tabIndex = -1; seat.setAttribute('aria-hidden', 'true'); box.appendChild(seat); continue; }
      var isV = p.vertical === 'Verandah';
      seat.className += isV ? ' seat-v' : ' seat-m';
      if (read.indexOf(p.title) > -1) seat.className += ' is-read';
      var name = 'Row ' + rows.charAt(Math.floor(s / 10) % 26) + ', seat ' + (s % 10 + 1);
      seat.setAttribute('aria-label', name + ': ' + p.title);
      seat.setAttribute('aria-pressed', 'false');
      (function (seat, p, name, isV) {
        function show() {
          if (current) current.setAttribute('aria-pressed', 'false');
          current = seat; seat.setAttribute('aria-pressed', 'true');
          info.href = p.href;
          info.className = 'seat-info ' + (isV ? 'is-v' : 'is-m');
          info.innerHTML = '';
          [['seat-info-label', name + ' · ' + p.vertical],
           ['seat-info-title', p.title],
           ['seat-info-go', 'Take this seat →']].forEach(function (part) {
            var el = document.createElement('span'); el.className = part[0]; el.textContent = part[1]; info.appendChild(el);
          });
          info.onclick = function () { markRead(p.title); };
        }
        seat.addEventListener('mouseenter', show);
        seat.addEventListener('focus', show);
        seat.addEventListener('click', show);
      })(seat, p, name, isV);
      box.appendChild(seat);
    }
    hall.hidden = false;
  }

  /* ---------- Forms: send without leaving the page ---------- */
  document.querySelectorAll('[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var thanks = form.parentNode.querySelector('[data-thanks]');
      var done = function () { form.hidden = true; if (thanks) thanks.hidden = false; };
      if (form.action.indexOf('[') > -1 || form.action.indexOf('%5B') > -1) { done(); return; } /* not connected yet */
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (r.ok) done(); else form.submit(); })
        .catch(function () { form.submit(); });
    });
  });
})();
