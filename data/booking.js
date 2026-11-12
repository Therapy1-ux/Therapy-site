// THERAPY booking adapter: the single source of truth for service slug -> Momence booking URL.
// Classic script (sets window.BOOKING) and CommonJS module (for scripts/check-booking.js).
(function (root) {
  var BASE = 'https://momence.com/appointments/appointment-reservation/143784?boardId=103060&serviceId=';
  var BOARD = 'https://momence.com/appointments/appointment-reservation/143784';
  var STUDIO = 'https://momence.com/u/therapy-JtQjAN';
  var GIFT = 'https://momence.com/Therapy/gift-card-checkout/143784';
  var NEED_ID = null;

  // slug -> Momence serviceId (number) | full URL (string) | NEED_ID
  var IDS = {
    'nurse-consult': 377799,
    'exhaustion-assessment': NEED_ID,
    'level-one': NEED_ID,
    'psychology': 165740,
    'myotherapy': 309494,
    'physio': 309494,
    'gp-telehealth': NEED_ID,
    'gp-functional-medicine': NEED_ID,
    'hormone-consult': NEED_ID, // GP consult: perimenopause, menopause, HRT/TRT
    'iv-infusion': 364834,
    'iron-infusion': NEED_ID,
    'functional-pathology': NEED_ID,
    'oligoscan': NEED_ID,
    'vo2-max': NEED_ID,
    'body-composition': NEED_ID,
    'reoxy': 137444,
    'hbot': 143210,
    'hocatt': 137445,
    'infrared-sauna': 137122,
    'ice-bath': NEED_ID,
    'cryotherapy': 137119,
    'pbm-bed': 137120,
    'neurosuite': 137367,
    'braintap': 137367,
    'hydrogen-inhalation': 137367, // confirm: shared NeuroSuite ID
    'pemf': 137367,                // confirm: shared NeuroSuite ID
    'pulsetto': 137367,            // confirm: shared NeuroSuite ID
    'normatec': 137367,            // confirm: shared NeuroSuite ID
    'red-light-panels': 137367,    // confirm: shared NeuroSuite ID
    'vr-meditation': NEED_ID,
    'breathwork': STUDIO,
    'massage-regulate': 358560,
    'massage-aroma': NEED_ID,
    'massage-stone': NEED_ID,
    'facial-restore': NEED_ID,
    'facial-restore-plus': NEED_ID,
    'facial-skin-reset': NEED_ID,
    'facial-restore-pbm': NEED_ID,
    'regeneration-ritual': NEED_ID,
    'nervous-system-regulation': NEED_ID,
    'womens-sleep-program': NEED_ID,
    'studio-classes': STUDIO,
    'gift-voucher': GIFT,
    // Services on the site that were not in the 11 Nov table
    'exomind': NEED_ID,
    'technogym-assessment': NEED_ID,
    'cryo-localised': NEED_ID,
    'cryo-facial': NEED_ID,
    'exosome-therapy': NEED_ID
  };

  var FALLBACK_SLUG = 'nurse-consult';
  var toUrl = function (v) { return typeof v === 'number' ? BASE + v : v; };
  var BOOKING = {}, MISSING = [];
  Object.keys(IDS).forEach(function (slug) {
    var v = IDS[slug];
    if (v === NEED_ID) { MISSING.push(slug); v = IDS[FALLBACK_SLUG]; }
    BOOKING[slug] = toUrl(v);
  });

  var isDev = function () {
    try {
      var h = root.location && root.location.hostname;
      return !h || h === 'localhost' || h === '127.0.0.1' || /[?&]debug-booking\b/.test(root.location.search);
    } catch (e) { return false; }
  };
  var warned = {};
  function bookingUrl(slug) {
    if (!slug || !Object.prototype.hasOwnProperty.call(BOOKING, slug)) {
      if (root.console && !warned[slug]) { warned[slug] = 1; console.error('[booking] unknown slug "' + slug + '" — using nurse-consult'); }
      return BOOKING[FALLBACK_SLUG];
    }
    if (MISSING.indexOf(slug) > -1 && isDev() && root.console && !warned[slug]) {
      warned[slug] = 1; console.warn('[booking] ' + slug + ': NEED_ID — falling back to nurse-consult (377799)');
    }
    return BOOKING[slug];
  }

  // Render-time wiring: every <a data-booking="slug"> gets its href from BOOKING, including
  // elements added or re-rendered later (MutationObserver). Empty data-booking = not a booking link.
  function wire(el) {
    var slug = el.getAttribute('data-booking');
    if (!slug || el.tagName !== 'A') return;
    var url = bookingUrl(slug);
    if (el.getAttribute('href') !== url) el.setAttribute('href', url);
  }
  function wireAll(scope) {
    var list = (scope || root.document).querySelectorAll('a[data-booking]');
    for (var i = 0; i < list.length; i++) wire(list[i]);
  }
  if (root.document && root.MutationObserver) {
    var start = function () {
      wireAll();
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.type === 'attributes') wire(m.target);
          else for (var j = 0; j < m.addedNodes.length; j++) {
            var n = m.addedNodes[j];
            if (n.nodeType === 1) { wire(n); if (n.querySelectorAll) wireAll(n); }
          }
        }
      }).observe(root.document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['href', 'data-booking'] });
    };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start); else start();
  }

  var api = { BOOKING: BOOKING, BOOKING_MISSING: MISSING, BOARD_URL: BOARD, bookingUrl: bookingUrl, wireAll: wireAll };
  if (isDev() && root.console && MISSING.length) console.warn('[booking] ' + MISSING.length + ' slug(s) unmapped, using nurse-consult: ' + MISSING.join(', '));
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.BOOKING = BOOKING; root.THERAPY_BOOKING = api;
})(typeof window !== 'undefined' ? window : globalThis);
