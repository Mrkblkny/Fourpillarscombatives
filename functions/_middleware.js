/**
 * Four Pillars Combatives — Online Training Coming Soon integration.
 * Cloudflare Pages middleware: preserves all existing HTML/JS/forms/styles,
 * adds one navigation link to every HTML page, and a homepage teaser.
 *
 * This does not change the online portal, activate registration, or take payment.
 */
const ONLINE_URL = 'https://four-pillars-online-training.pages.dev/';

const NAV_LINK = `<a class="fpc-online-nav" href="${ONLINE_URL}">Online Training</a>`;
const STYLE_LINK = '<link rel="stylesheet" href="/assets/online-training.css">';
const HOME_SECTION = `
<section class="fpc-online-teaser" id="online-training" aria-labelledby="fpc-online-title">
  <div class="shell fpc-online-layout">
    <div class="fpc-online-copy">
      <span class="eyebrow">Online Training / Coming Soon</span>
      <h2 id="fpc-online-title">REAL-WORLD SKILLS.<br><span class="red">TRAIN ANYWHERE.</span></h2>
      <p>Our online program will bring the Four Pillars Combatives self-defense approach to you. Learn through structured lessons covering Situational Awareness, Empty-Hand Fighting, Weapons Fighting, and Fitness &amp; Attributes Training as content becomes available.</p>
      <p class="fpc-online-note">Online lessons supplement hands-on practice. Enrollment is not open yet, and the training library will grow throughout beta.</p>
      <p class="fpc-online-membership">Founding Membership &middot; Beta access</p>
      <a class="btn fpc-online-button" href="${ONLINE_URL}">Explore Online Training <span aria-hidden="true" class="arrow">↗</span></a>
    </div>
    <div class="fpc-online-feature" aria-hidden="true">
      <div class="fpc-online-feature-top">FOUR PILLARS COMBATIVES <span>ONLINE</span></div>
      <div class="fpc-online-feature-center"><span class="fpc-online-feature-number">4</span><strong>SECTIONS.<br>ONE PURPOSE.</strong></div>
      <div class="fpc-online-feature-bottom">AWARENESS <b>•</b> CONTACT MANAGEMENT <b>•</b> RESPOND <b>•</b> GET HOME SAFE</div>
    </div>
  </div>
</section>`;

export async function onRequest(context) {
  // Leave APIs, existing forms, redirects and non-HTML assets untouched.
  const response = await context.next();
  if (context.request.method !== 'GET' || !response.ok ||
      !response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
    return response;
  }

  const pathname = new URL(context.request.url).pathname;
  const isHome = pathname === '/' || pathname === '/index.html';
  let navInserted = false;
  let teaserInserted = false;

  return new HTMLRewriter()
    .on('head', {
      element(el) {
        el.append(STYLE_LINK, { html: true });
      },
    })
    .on('nav#navigation', {
      element(el) {
        // Fallback if the existing Get Started nav item has a different class.
        el.onEndTag((end) => {
          if (!navInserted) {
            end.before(NAV_LINK, { html: true });
            navInserted = true;
          }
        });
      },
    })
    .on('nav#navigation > a.nav-cta', {
      element(el) {
        if (!navInserted) {
          el.before(NAV_LINK, { html: true });
          navInserted = true;
        }
      },
    })
    .on('section.intro-invite', {
      element(el) {
        if (isHome && !teaserInserted) {
          // Place the announcement near the top, after the free intro invitation.
          el.after(HOME_SECTION, { html: true });
          teaserInserted = true;
        }
      },
    })
    .on('main', {
      element(el) {
        if (isHome) {
          // Always provide a homepage announcement, even if the section order changes.
          el.onEndTag((end) => {
            if (!teaserInserted) {
              end.before(HOME_SECTION, { html: true });
              teaserInserted = true;
            }
          });
        }
      },
    })
    .transform(response);
}
