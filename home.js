/* Zigarthanda — homepage extras.
   Tonight's double bill and Pull a ticket read the pieces straight from matinee.html and
   verandah.html, so they update themselves whenever you add a piece there.
   The two forms (suggestions and the club) send to your email through Formspree. */
(function () {

  /* ---------- Gather pieces from the two vertical pages ---------- */
  function collect(doc, vertical, page) {
    var out = [];
    doc.querySelectorAll('a.featured, .piece-row a').forEach(function (a) {
      var t = a.querySelector('.featured-title, .row-title');
      if (!t) return;
      var href = a.getAttribute('href') || page;
      out.push({
        vertical: vertical,
        href: href,
        title: t.textContent.trim(),
        meta: ((a.querySelector('.meta') || {}).textContent || '').trim(),
        subject: ((a.querySelector('.subject') || {}).textContent || '').trim()
      });
    });
    return out;
  }

  function load() {
    if (window.ZIG_PIECES) return Promise.resolve(window.ZIG_PIECES);
    var parse = function (html) { return new DOMParser().parseFromString(html, 'text/html'); };
    return Promise.all([
      fetch('matinee.html').then(function (r) { return r.text(); }),
      fetch('verandah.html').then(function (r) { return r.text(); })
    ]).then(function (pages) {
      return {
        matinee: collect(parse(pages[0]), 'Matinee', 'matinee.html'),
        verandah: collect(parse(pages[1]), 'Verandah', 'verandah.html')
      };
    });
  }

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function fill(card, piece) {
    card.href = piece.href;
    card.querySelector('[data-title]').textContent = piece.title;
    card.querySelector('[data-sub]').textContent = piece.subject || piece.meta;
  }

  load().then(function (data) {
    var all = data.matinee.concat(data.verandah);

    /* Tonight's double bill */
    var bill = document.querySelector('[data-bill]');
    if (bill && data.matinee.length && data.verandah.length) {
      fill(bill.querySelector('[data-bill-m]'), pick(data.matinee));
      fill(bill.querySelector('[data-bill-v]'), pick(data.verandah));
      bill.hidden = false;
    }

    /* Pull a ticket */
    var pull = document.querySelector('[data-pull]');
    if (pull && all.length) {
      var btn = pull.querySelector('[data-pull-btn]');
      var out = pull.querySelector('[data-pulled]');
      var last = null;
      btn.addEventListener('click', function () {
        var p = pick(all);
        if (all.length > 1) { while (p === last) p = pick(all); }
        last = p;
        out.href = p.href;
        out.className = 'pulled pulled-' + p.vertical.toLowerCase();
        out.querySelector('[data-label]').textContent = p.vertical + (p.meta ? ' · ' + p.meta.split('·')[0].trim() : '');
        out.querySelector('[data-title]').textContent = p.title + ' →';
        out.hidden = false;
      });
      pull.hidden = false;
    }
  }).catch(function () { /* if the pages can't be read, these two sections simply stay hidden */ });

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
