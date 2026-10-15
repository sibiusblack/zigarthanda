/* Zigarthanda — landing section: a greeting that follows the visitor's clock. */
(function () {
  var g = document.querySelector('[data-greeting]');
  if (!g) return;
  var h = new Date().getHours();
  g.textContent =
    h >= 5 && h < 12 ? 'Good morning. The 2:30 show is a few hours away, and the verandah is quiet for now.' :
    h >= 12 && h < 17 ? 'Good afternoon. The 2:30 show is on; step into the Matinee.' :
    h >= 17 && h < 22 ? 'Good evening. It’s past five, and the verandah is set with tea.' :
                        'Still up? Both doors are open: a late show, or a book on the verandah.';
})();
