/**
 * Barchs Navigation Header & Luxury Hamburger Menu Controller
 * Handles active link state, mobile menu drawer, 3-line hamburger morphing,
 * accordion expansions, scroll elevation, and accessibility.
 */
(function () {
  'use strict';

  function initHeader() {
    var header = document.getElementById('site-header');
    var navToggle = document.getElementById('nav-toggle-btn');
    var navToggleLabel = navToggle ? navToggle.querySelector('.nav-toggle-label') : null;
    var drawer = document.getElementById('mobile-nav-drawer');
    var overlay = document.getElementById('drawer-overlay');
    var drawerClose = document.getElementById('drawer-close-btn');

    if (!header) return;

    // 1. Scroll elevation listener
    function onScroll() {
      if (window.scrollY > 15) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 2. Mobile drawer open / close controller
    function toggleDrawer(open) {
      if (!drawer) return;
      var isOpen = typeof open === 'boolean' ? open : !drawer.classList.contains('open');

      if (navToggle) {
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (navToggleLabel) {
          navToggleLabel.textContent = isOpen ? 'Close' : 'Menu';
        }
      }

      drawer.classList.toggle('open', isOpen);
      drawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

      if (overlay) {
        overlay.classList.toggle('open', isOpen);
        overlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      }

      // Prevent background body scroll when drawer is open
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Accessibility focus management
      if (isOpen && drawerClose) {
        setTimeout(function () {
          drawerClose.focus();
        }, 100);
      } else if (!isOpen && navToggle) {
        navToggle.focus();
      }
    }

    if (navToggle) {
      navToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDrawer();
      });
    }

    if (drawerClose) {
      drawerClose.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDrawer(false);
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDrawer(false);
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
        toggleDrawer(false);
      }
    });

    // Close drawer when any direct navigation destination is clicked
    var destinationLinks = document.querySelectorAll('.drawer-link, .sub-link, .drawer-cta-btn');
    destinationLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        toggleDrawer(false);
      });
    });

    // 3. Mobile accordion toggles (Services & Industries)
    var accordionBtns = document.querySelectorAll('.drawer-accordion-btn');
    accordionBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var parent = btn.closest('.drawer-accordion');
        if (parent) {
          var willOpen = !parent.classList.contains('open');
          parent.classList.toggle('open', willOpen);
          btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        }
      });
    });

    // 4. Active Navigation State Detection
    var path = window.location.pathname.replace(/\/$/, ''); // strip trailing slash
    var navLinks = document.querySelectorAll('.nav-link, .drawer-link');

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var cleanHref = href.replace(/\/$/, '').replace(/^\.\//, '').replace(/^\.\.\//, '');

      // Check home
      if ((path === '' || path === '/' || path.endsWith('index.html')) &&
          (link.getAttribute('data-nav') === 'home' || cleanHref === '.' || cleanHref === '')) {
        link.classList.add('active');
      } else if (cleanHref && path.includes(cleanHref)) {
        link.classList.add('active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
})();
