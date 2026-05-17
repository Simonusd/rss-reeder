import { NextRequest, NextResponse } from "next/server";
import { isSafeUrl } from "@/lib/validate-url";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Brak parametru url" }, { status: 400 });
  }

  if (!isSafeUrl(url)) {
    return NextResponse.json({ error: "Nieprawidłowy lub niedozwolony URL" }, { status: 400 });
  }

  let targetUrl: string;
  try {
    targetUrl = new URL(url).href;
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy URL" }, { status: 400 });
  }

  const cookieBlocker = `<style>
#onetrust-consent-sdk,#onetrust-banner-sdk,.onetrust-pc-dark-filter,
#CybotCookiebotDialog,#CybotCookiebotDialogBodyUnderlay,
.cc-window,.cc-banner,.cc-overlay,.cc-grower,
#qc-cmp2-ui,.qc-cmp2-persistent-link,
#gdpr-cookie-message,.gdpr-cookie-notice,
[id^="cookiefirst"],.cookiefirst-root,
#cmplz-cookiebanner-container,.cmplz-cookiebanner,
#cookie-script-dialog,
.iubenda-cs-container,#iubenda-cs-banner,
#ppms_cm_popup,.ppms_cm_popup_overlay,
#truste-consent-required,.truste-consent-track,
[id^="BorlabsCookie"],.borlabs-cookie,
#cookie-law-info-bar,.cli-cookie-popup,
.cookie-notice-container,#cn-notice,
[class*="cookie-banner"],[id*="cookie-banner"],
[class*="cookie-popup"],[id*="cookie-popup"],
[class*="cookie-notice"],[id*="cookie-notice"],
[class*="consent-banner"],[id*="consent-banner"],
[class*="gdpr-banner"],[id*="gdpr-banner"]
{display:none!important;visibility:hidden!important;pointer-events:none!important;}
body{overflow:auto!important;}
</style>
<script>
(function(){
var sel=[
'#onetrust-consent-sdk','#onetrust-banner-sdk','.onetrust-pc-dark-filter',
'#CybotCookiebotDialog','#CybotCookiebotDialogBodyUnderlay',
'.cc-window','.cc-banner','.cc-overlay',
'#qc-cmp2-ui','#gdpr-cookie-message',
'[id^="cookiefirst"]','#cmplz-cookiebanner-container','.cmplz-cookiebanner',
'#cookie-script-dialog','.iubenda-cs-container','#iubenda-cs-banner',
'#ppms_cm_popup','[id^="BorlabsCookie"]','.borlabs-cookie',
'#cookie-law-info-bar','.cookie-notice-container'
];
function hide(){
sel.forEach(function(s){
document.querySelectorAll(s).forEach(function(el){el.style.setProperty('display','none','important');});
});
if(document.body)document.body.style.setProperty('overflow','auto','important');
}
new MutationObserver(hide).observe(document.documentElement,{childList:true,subtree:true});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',hide):hide();
})();
</script>`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pl,en;q=0.9",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") ?? "text/html";

    if (contentType.includes("text/html")) {
      let html = await response.text();

      // Inject <base> so relative URLs resolve correctly, then cookie blocker
      const escapedTargetUrl = targetUrl.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
      const baseTag = `<base href="${escapedTargetUrl}">`;
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head[^>]*>/i, (m) => `${m}${baseTag}${cookieBlocker}`);
      } else {
        html = baseTag + cookieBlocker + html;
      }

      return new NextResponse(html, {
        status: response.status,
        headers: {
          "Content-Type": contentType,
          // X-Frame-Options and CSP frame-ancestors intentionally omitted
        },
      });
    }

    // Non-HTML resources: proxy as-is, strip frame-blocking headers
    const body = await response.arrayBuffer();
    const headers = new Headers();
    response.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k !== "x-frame-options" && k !== "content-security-policy") {
        headers.set(key, value);
      }
    });
    return new NextResponse(body, { status: response.status, headers });
  } catch {
    return NextResponse.json({ error: "Nie udało się pobrać strony" }, { status: 500 });
  }
}
