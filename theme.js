/* Zigarthanda — light and dark.
   Runs in the <head> before the page appears, so dark mode never flashes white.
   First visit: follows the reader's device setting. After they press the switch,
   their choice is remembered on their browser. */
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('zig-theme'); } catch (e) {}
  var system = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#17140F' : '#FAF8F3');
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      var dark = theme === 'dark';
      btn.innerHTML = dark ? SUN : MOON;
      btn.setAttribute('aria-label', dark ? 'Switch to light' : 'Switch to dark');
      btn.setAttribute('title', dark ? 'Light' : 'Dark');
    }
  }

  var SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';

  apply(saved || (system && system.matches ? 'dark' : 'light'));

  /* Follow the device if the reader hasn't chosen yet */
  if (system && system.addEventListener) {
    system.addEventListener('change', function (e) { if (!saved) apply(e.matches ? 'dark' : 'light'); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(root.getAttribute('data-theme'));
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      saved = next;
      try { localStorage.setItem('zig-theme', next); } catch (e) {}
      apply(next);
    });
  });
})();

/* Sticky menu: a hairline appears under it once the page scrolls */
(function () {
  function watch() {
    var h = document.querySelector('.site-header');
    if (!h) return;
    var update = function () { h.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();

/* Clean addresses: jumping to a section (About, Join in, Begin reading…) scrolls there
   without adding #about or similar to the address bar. Links from other pages to a
   homepage section open the homepage and then scroll, keeping the address as zigarthanda.in. */
(function () {
  function jump(id) {
    var el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin || !url.hash) return;
    var id = decodeURIComponent(url.hash.slice(1));
    if (url.pathname === location.pathname) {          /* same page: just scroll */
      if (jump(id)) e.preventDefault();
    } else {                                            /* another page: go there clean, then scroll */
      e.preventDefault();
      try { sessionStorage.setItem('zig-jump', id); } catch (err) {}
      location.href = url.pathname + url.search;
    }
  });
  function arrive() {
    var id = null;
    try { id = sessionStorage.getItem('zig-jump'); sessionStorage.removeItem('zig-jump'); } catch (err) {}
    if (!id && location.hash) id = decodeURIComponent(location.hash.slice(1));
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    if (id) setTimeout(function () { jump(id); }, 60);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrive); else arrive();
  window.addEventListener('hashchange', arrive);
})();

/* Outside links (Instagram, Substack, Letterboxd, Goodreads, links in pieces) open in a new tab;
   links to your own pages stay in the same tab. Works for every piece you publish, automatically. */
(function () {
  function mark(root) {
    (root || document).querySelectorAll('a[href^="http"]').forEach(function (a) {
      if (a.hostname && a.hostname !== location.hostname) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mark(); }); else mark();
})();
