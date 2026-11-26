// Browser-local homepage history. No identifier, cookie, or network request.
(function () {
  'use strict';
  var key = 'avanek-home-last-visit-v1';
  function showPreviousVisit() {
    var output = document.getElementById('homepage-last-visit');
    if (!output) return;
    var now = new Date();
    try {
      var previous = localStorage.getItem(key);
      var date = previous ? new Date(previous) : null;
      if (date && Number.isFinite(date.getTime()) && date.getTime() <= now.getTime() && date.getTime() > 0) {
        output.textContent = 'You last visited the homepage on ';
        var time = document.createElement('time');
        time.dateTime = date.toISOString();
        time.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
        output.appendChild(time);
        output.appendChild(document.createTextNode(' · remembered in this browser'));
      } else {
        output.textContent = 'Your first recorded homepage visit in this browser. Welcome!';
      }
      localStorage.setItem(key, now.toISOString());
    } catch (error) {
      output.textContent = 'Homepage visit history is unavailable in this browser.';
    }
  }
  showPreviousVisit();
  window.addEventListener('pageshow', function (event) { if (event.persisted) showPreviousVisit(); });
})();
