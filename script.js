/**
 * ankitiqcode — Portfolio interactions
 * Modular, event-delegated, rAF-throttled, reduced-motion aware.
 */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
   * Typing role effect
   * ------------------------------------------------------------------- */
  function initTypingRole() {
    const el = document.getElementById('typedRole');
    if (!el) return;

    const roles = ['Data Analyst', 'Python Developer', 'ML Engineer', 'Problem Solver'];
    const textNode = document.createElement('span');
    el.prepend(textNode);

    if (prefersReducedMotion) {
      textNode.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const word = roles[roleIndex];
      textNode.textContent = deleting ? word.slice(0, charIndex - 1) : word.slice(0, charIndex + 1);
      charIndex += deleting ? -1 : 1;

      let delay = deleting ? 55 : 95;

      if (!deleting && charIndex === word.length) {
        deleting = true;
        delay = 1700;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 300;
      }
      window.setTimeout(tick, delay);
    }

    window.setTimeout(tick, 900);
  }

  /* ---------------------------------------------------------------------
   * Navbar: scroll state, active-link highlight, back-to-top
   * Single rAF-throttled scroll listener drives everything.
   * ------------------------------------------------------------------- */
  function initScrollUI() {
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    if (!navbar && !backToTop && !sections.length) return;

    let ticking = false;

    function update() {
      const y = window.scrollY;

      if (navbar) navbar.classList.toggle('is-scrolled', y > 40);
      if (backToTop) backToTop.classList.toggle('is-visible', y > 400);

      let currentId = '';
      for (const section of sections) {
        if (y >= section.offsetTop - 200) currentId = section.id;
      }
      navAnchors.forEach((a) => {
        const match = a.getAttribute('href') === `#${currentId}`;
        a.toggleAttribute('aria-current', match);
        if (match) a.setAttribute('aria-current', 'page');
      });

      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }
  }

  /* ---------------------------------------------------------------------
   * Mobile navigation drawer
   * ------------------------------------------------------------------- */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Accessible tabs (About: Skills / Experience / Education)
   * ------------------------------------------------------------------- */
  function initTabs() {
    const tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return;

    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));

    function activate(tab) {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
      tab.focus();
    }

    tabList.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) activate(tab);
    });

    tabList.addEventListener('keydown', (e) => {
      const currentIndex = tabs.indexOf(document.activeElement);
      if (currentIndex === -1) return;
      let nextIndex = null;
      if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
      if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      if (nextIndex !== null) {
        e.preventDefault();
        activate(tabs[nextIndex]);
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Project filter
   * ------------------------------------------------------------------- */
  function initProjectFilter() {
    const filterBar = document.querySelector('.filter-bar');
    const cards = Array.from(document.querySelectorAll('.project-card'));
    if (!filterBar || !cards.length) return;

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterBar.querySelectorAll('.filter-btn').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');

      const category = btn.dataset.filter;
      cards.forEach((card) => {
        const match = category === 'all' || card.dataset.category === category;
        card.classList.toggle('is-hidden', !match);
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Posts & Memories disclosure
   * ------------------------------------------------------------------- */
  function initMemoriesToggle() {
    const toggle = document.getElementById('memoriesToggle');
    const feed = document.getElementById('postFeed');
    if (!toggle || !feed) return;

    toggle.addEventListener('click', () => {
      const isOpen = feed.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ---------------------------------------------------------------------
   * Scroll reveal (IntersectionObserver, unobserves once triggered)
   * ------------------------------------------------------------------- */
  function initRevealAnimations() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------------------
   * Animated skill proficiency bars
   * ------------------------------------------------------------------- */
  function initSkillBars() {
    const container = document.getElementById('skillBars');
    if (!container || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll('.skill-bar-fill').forEach((bar) => {
            bar.style.width = `${bar.dataset.width}%`;
          });
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
  }

  /* ---------------------------------------------------------------------
   * Contact form submission (Google Apps Script endpoint)
   * ------------------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const scriptURL = form.dataset.endpoint;
    const submitBtn = document.getElementById('submitBtn');
    const formMsg = document.getElementById('formMsg');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot: if filled, silently drop (bot submission)
      const honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) return;

      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending…';
      submitBtn.disabled = true;

      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 12000);

        await fetch(scriptURL, {
          method: 'POST',
          body: new FormData(form),
          signal: controller.signal,
        });

        window.clearTimeout(timeout);

        formMsg.textContent = "Message sent — I'll get back to you soon.";
        formMsg.className = 'form-msg form-msg--success';
        form.reset();
        submitBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Sent';
      } catch (error) {
        formMsg.textContent = 'Something went wrong. Please email me directly instead.';
        formMsg.className = 'form-msg form-msg--error';
        submitBtn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Send message';
      } finally {
        submitBtn.disabled = false;
        window.setTimeout(() => {
          formMsg.textContent = '';
          if (!submitBtn.disabled) {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Send message';
          }
        }, 5000);
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Bootstrap
   * ------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initTypingRole();
    initScrollUI();
    initMobileNav();
    initTabs();
    initProjectFilter();
    initMemoriesToggle();
    initRevealAnimations();
    initSkillBars();
    initContactForm();
  });
})();