
// Optional advertising tracking is disabled until the visitor explicitly consents.
(function () {
  'use strict';
  const key = 'legion_meta_consent_v1';
  const pixelId = '972477825931788';
  const banner = document.getElementById('cookieBanner');
  const settings = document.getElementById('cookieSettings');
  if (!banner || !settings) return;
  let choice = null;
  try { choice = localStorage.getItem(key); } catch (_) {}
  function loadMetaPixel() {
    if (window.fbq) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
    s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', pixelId);
    fbq('track', 'PageView');
  }
  function display() {
    banner.hidden = choice === 'accepted' || choice === 'rejected';
    settings.hidden = !banner.hidden;
  }
  function setChoice(value) {
    choice = value;
    try { localStorage.setItem(key, value); } catch (_) {}
    if (value === 'accepted') loadMetaPixel();
    // Revocation removes the saved consent and prevents loading on future page views.
    // Reload to stop the current page's already-loaded tracking script.
    if (value === 'rejected' && window.fbq) { window.location.reload(); return; }
    display();
  }
  document.getElementById('cookieAccept').addEventListener('click', () => setChoice('accepted'));
  document.getElementById('cookieDecline').addEventListener('click', () => setChoice('rejected'));
  settings.addEventListener('click', () => { banner.hidden = false; settings.hidden = true; });
  if (choice === 'accepted') loadMetaPixel();
  display();
})();
