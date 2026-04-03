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

  /* ---- Sticky nav on scroll ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile menu toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('open');
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

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = nav ? nav.offsetHeight + 20 : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Research tabs ---- */
  const tabs = document.querySelectorAll('.research-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.research-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
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
      window.location.href = `mailto:suranga@kiwrious.com?subject=${subject}&body=${body}`;

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