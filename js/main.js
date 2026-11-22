/* ==========================================================================
   Kiwrious — 2026 Refresh
   Vanilla JS — zero dependencies
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Preloader ---- */
  window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
      setTimeout(() => preloader.classList.add('hidden'), 600);
    }
  });

  /* The page scrolls inside <body> (no overscroll bounce), not the window. */
  const scroller = document.body;
  const nav = document.querySelector('.nav');
  const barH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 64;

  /* ---- Sticky nav on scroll ---- */
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', scroller.scrollTop > 60);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile menu toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Typewriter effect (pure JS) ---- */
  const typewriterEl = document.querySelector('.typewriter-text');
  if (typewriterEl) {
    const phrases = [
      'Inspire Curiosity',
      'Discover Together',
      'Make Science Visible'
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let pauseTimer = null;

    function type() {
      const current = phrases[phraseIdx];

      if (!deleting) {
        typewriterEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
          pauseTimer = setTimeout(() => { deleting = true; type(); }, 2200);
          return;
        }
        setTimeout(type, 55);
      } else {
        typewriterEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(type, 400);
          return;
        }
        setTimeout(type, 30);
      }
    }
    type();
  }

  /* ---- Scroll reveal (IntersectionObserver) ---- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ---- Screen-fit layout + screen-by-screen paging ----
     Consecutive sections pack into one screen while their natural heights fit
     under the app bar; leftover height is shared out evenly so each screen
     fills the view. A section taller than the view gets its own screen and
     ↑/↓ page through it one screen height at a time. The hero ([data-solo])
     always fills the whole first screen; the footer ([data-pin]) never grows,
     so it sits on the bottom edge of the last screen. */
  const groups = [...document.querySelectorAll('.group')];

  function layout() {
    const full = scroller.clientHeight;
    const avail = full - barH();
    groups.forEach(g => { g.style.minHeight = ''; });
    const heights = groups.map(g => g.getBoundingClientRect().height);
    const screens = [];
    let cur = null;
    groups.forEach((g, i) => {
      const solo = g.hasAttribute('data-solo');
      if (cur && !solo && !cur.solo && cur.sum + heights[i] <= avail + 1) {
        cur.items.push(i);
        cur.sum += heights[i];
      } else {
        cur = { items: [i], sum: heights[i], solo };
        screens.push(cur);
      }
    });
    screens.forEach(sc => {
      const room = (sc.solo ? full : avail) - sc.sum;
      const growers = sc.items.filter(i => !groups[i].hasAttribute('data-pin'));
      const extra = Math.max(0, room) / Math.max(1, growers.length);
      sc.items.forEach((i, k) => {
        const grow = growers.includes(i) ? extra : 0;
        groups[i].style.minHeight = `${heights[i] + grow}px`;
        groups[i].classList.toggle('screen', k === 0);
      });
    });
    markCurrent();
  }

  let raf = 0;
  const relayout = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); };
  new ResizeObserver(relayout).observe(scroller);
  document.fonts?.ready.then(relayout);
  window.addEventListener('load', relayout);
  // Lazy images change section heights as they arrive.
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (!img.complete) img.addEventListener('load', relayout, { once: true });
  });

  const topOf = el => Math.max(0, Math.round(el.getBoundingClientRect().top + scroller.scrollTop - barH()));
  const stops = () => [...document.querySelectorAll('.screen')].map(topOf);

  let target = null; // where an in-flight smooth scroll is heading
  scroller.addEventListener('scrollend', () => { target = null; });
  let targetTimer = 0; // fallback for browsers without scrollend
  const goTo = top => {
    target = top;
    clearTimeout(targetTimer);
    targetTimer = setTimeout(() => { target = null; }, 900);
    scroller.scrollTo({ top, behavior: 'smooth' });
  };

  function pageBy(dir) {
    const pos = target ?? scroller.scrollTop;
    const step = scroller.clientHeight - barH();
    const max = scroller.scrollHeight - scroller.clientHeight;
    const s = stops();
    let dest;
    if (dir > 0) {
      const next = s.find(t => t > pos + 4) ?? max;
      // Snap to the next screen when one step would stop just short of it.
      dest = next - (pos + step) < step * 0.15 ? next : pos + step;
    } else {
      const prev = s.filter(t => t < pos - 4).pop() ?? 0;
      dest = (pos - step) - prev < step * 0.15 ? prev : pos - step;
    }
    dest = Math.min(Math.max(Math.round(dest), 0), max);
    if (dest === Math.round(pos)) return;
    goTo(dest);
  }

  const NO_KEYS = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="radiogroup"]';
  const PAGE_KEYS = { ArrowDown: 1, ArrowUp: -1, PageDown: 1, PageUp: -1, ' ': 1 };
  document.addEventListener('keydown', (e) => {
    if (!(e.key in PAGE_KEYS)) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.shiftKey && e.key !== ' ') return;
    if (mobileMenu?.classList.contains('open')) return;
    const t = e.target instanceof Element ? e.target : null;
    if (t?.closest(NO_KEYS)) return;
    // Space activates a focused button or link; leave it alone there.
    if (e.key === ' ' && t?.closest('button, a, summary, [role="button"], [role="tab"]')) return;
    e.preventDefault();
    pageBy(e.key === ' ' && e.shiftKey ? -1 : PAGE_KEYS[e.key]);
  });

  /* ---- Anchor links land the section just under the app bar ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      e.preventDefault();
      if (target) goTo(topOf(target));
      else if (!id) goTo(0);
    });
  });

  /* ---- App bar marks the topic on screen ---- */
  const topicLinks = [...document.querySelectorAll('.nav-links a[href^="#"]:not(.btn-demo)')]
    .map(a => ({ a, el: document.getElementById(a.getAttribute('href').slice(1)) }))
    .filter(t => t.el);
  function markCurrent() {
    const line = scroller.scrollTop + barH() + scroller.clientHeight * 0.35;
    let current = null;
    topicLinks.forEach(t => {
      if (t.el.getBoundingClientRect().top + scroller.scrollTop <= line) current = t;
    });
    topicLinks.forEach(t => {
      if (t === current) t.a.setAttribute('aria-current', 'true');
      else t.a.removeAttribute('aria-current');
    });
  }
  scroller.addEventListener('scroll', markCurrent, { passive: true });

  /* ---- Research tabs ---- */
  const tabs = document.querySelectorAll('.research-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.research-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) {
        panel.classList.add('active');
        panel.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      }
      relayout();
    });
  });

  /* ---- Contact form interest select styling ---- */
  const interestSelect = document.getElementById('interest');
  if (interestSelect) {
    interestSelect.addEventListener('change', function() {
      this.classList.toggle('selected', this.value !== '');
    });
  }

  /* ---- Contact form submission ---- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Build mailto link as fallback
      const subject = encodeURIComponent(`Kiwrious Inquiry: ${data.interest || 'General'}`);
      const body = encodeURIComponent(
        `Name: ${data.name}\nOrganisation: ${data.organisation}\nEmail: ${data.email}\nInterest: ${data.interest}\n\nMessage:\n${data.message}`
      );
      window.location.href = `mailto:suranga@ahlab.org?subject=${subject}&body=${body}`;

      // Visual feedback
      const btn = contactForm.querySelector('.form-submit');
      const original = btn.textContent;
      btn.textContent = 'Opening email client...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 3000);
    });
  }

});