/* Zigarthanda — landing section: a greeting that follows the visitor's clock. */
(function () {
  var g = document.querySelector('[data-greeting]');
  if (!g) return;
  var h = new Date().getHours();
  g.textContent =
    h >= 2 && h < 6 ? 'Ted Mosby can be wrong at times. You being here is one good thing that happened after 2am.' :
    h >= 6 && h < 13 ? 'Good morning. The matinee show is a few hours away, and the verandah is quiet for now.' :
    h >= 13 && h < 17 ? 'Good afternoon. The matinee show is on. The evening lights will be warm as you come out.' :
    h >= 17 && h < 22 ? 'Good evening. It’s past five, and the verandah is set with tea.' :
                        'Still up? Both doors are open: a late show, or a book on the verandah.';
  
})();
