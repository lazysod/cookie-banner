# Cookie Consent v0.1.0

Framework-agnostic, 4.5kb gzipped, actually blocks scripts before consent. MIT licensed.

GDPR and ePrivacy compliant. No dependencies.

**QUICK START**

1. Change your tracking scripts to type text/plain and add data-category:

<script type="text/plain" data-category="analytics" data-src="gtag.js"></script>
<script type="text/plain" data-category="marketing" data-src="fb-pixel.js"></script>

2. Add the consent script last before /body:

<script src="cookie-consent.js" data-config='{"lang":"auto"}'></script>

**CATEGORIES**

**necessary**
Always on. Site functionality. Examples: login, cart, CSRF.

**analytics**  
Opt-in. Measure usage. Examples: GA4, Hotjar, Matomo.

**marketing**
Opt-in. Ads and retargeting. Examples: FB Pixel, TikTok, Google Ads.

**preferences**
Opt-in. Remember settings. Examples: language, theme.

Only necessary runs by default. Others stay blocked until user opts in.

**HOW IT WORKS**

Trackers use type text/plain so browsers ignore them. User accepts categories in banner. Choice saved to localStorage.cc_consent. Script activates only allowed script tags. On reload, allowed scripts run immediately.

View Source will always show blocked tags. This is correct.

**TESTING**

Open index.html in incognito. DevTools Network tab must show 0 requests to googletagmanager.com or facebook.net. Click Accept all. Requests now fire.

**REAL STORAGE RESULTS**

Check DevTools Application Local Storage cc_consent

**Accept all:**

- categories analytics marketing preferences
- ts 1782461622277
- ver 2026-06-01
- Result: All scripts fire

**Analytics only:**

- categories analytics
- ts 1782461598608  
- ver 2026-06-01
- Result: Only GA runs

**Marketing only:**

- categories marketing preferences
- ts 1782461559263
- ver 2026-06-01
- Result: FB Pixel runs

**Preferences only:**

- categories preferences
- ts 1782461522665
- ver 2026-06-01
- Result: Only UX settings run

**Reject:**

- categories empty
- ts 1782461644652
- ver 2026-06-01
- Result: All trackers blocked

**JS API**

CookieConsent.hasConsent analytics returns true or false
CookieConsent.show reopens banner

window addEventListener cc:consent
e.detail.categories shows what user chose

**POLICY VERSIONING**

Update policy_version in data-config when your privacy policy changes. Banner will re-appear for all users.

<script src="cookie-consent.js" data-config='{"policy_version":"2026-07-01"}'></script>

**FAQ**

Q: View Source still shows my GA code. Is it broken?
A: No. type text/plain prevents execution. Use Inspect Element to see it convert after consent.

Q: I see ERR_BLOCKED_BY_CLIENT
A: That is your ad blocker. The script activated correctly. Disable uBlock to test.

Q: Can I put scripts in head?
A: Yes but body before cookie-consent.js is safer. Prevents preload leaks.

LICENSE
MIT