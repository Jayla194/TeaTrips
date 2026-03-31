const banner = document.getElementById('readBanner');
    const faqSection = document.querySelector('#faq') || document.querySelector('.faq-list');
 
    function dismissBanner() {
      banner.classList.add('hidden');
    }
 
    document.getElementById('readBannerDismiss').addEventListener('click', dismissBanner);
 
    if (faqSection) {
      const faqObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          // Hide once the bottom of the FAQ has passed the viewport
          if (e.boundingClientRect.bottom < window.innerHeight) {
            dismissBanner();
            faqObserver.disconnect();
          }
        });
      }, { threshold: 1.0 });
      faqObserver.observe(faqSection);
    }
 
    // FAQ accordion
    document.querySelectorAll('[data-faq]').forEach(list => {
      list.addEventListener('click', e => {
        const toggle = e.target.closest('.faq-toggle');
        if (!toggle) return;
        const item = toggle.closest('.faq-item');
        const panel = item.querySelector('.faq-panel');
        const isOpen = item.classList.contains('is-open');
        item.classList.toggle('is-open', !isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
      });
    });
 
    // Scroll reveal
    const revealEls = document.querySelectorAll(
      '.hero-inner, .card, .step, .panel, .faq-item, .cta-card, .launch-card, .section-header'
    );
    revealEls.forEach(el => el.classList.add('reveal'));
 
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
 
    revealEls.forEach(el => observer.observe(el));