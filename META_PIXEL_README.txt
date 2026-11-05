LEGION: Meta Pixel ID 972477825931788

Added consent banner to all HTML pages. Pixel loads only after Accept. Reject does not load it. Preference stored in localStorage. Settings button allows changing choice.

IMPORTANT: Lead event NOT enabled. Current form sends to Google Apps Script using fetch(mode="no-cors"). A resolved opaque fetch response does NOT confirm that Google Sheets stored the lead. To track actual Lead, implement a verifiable backend response or verified thank-you redirect, then fire fbq("track", "Lead") only after confirmed success and only with tracking consent.

Test: incognito -> Reject -> Meta Pixel Helper should see no Pixel; Accept -> PageView appears in Events Manager Test Events. Test revocation and reload.

Review policy text and cross-border privacy compliance with qualified counsel before launching ads. Check consent behavior on all pages and on mobile.

Other fix: removed duplicate js/script.js include and extra closing body in index.html.
