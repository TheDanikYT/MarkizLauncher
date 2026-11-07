/* ============================================================
   Markiz Launcher — landing scripts
   ============================================================ */

(() => {
  'use strict';

  /* ---------- 1. Липкая навигация ---------- */
  const nav = document.getElementById('nav');

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-stuck', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 2. Мобильное меню ---------- */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  const closeMenu = () => {
    if (!burger || !navLinks) return;
    burger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
  };

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      navLinks.classList.toggle('is-open', !open);
    });

    navLinks.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 880) closeMenu();
    });
  }

  /* ---------- 3. Табы платформ ---------- */
  const tabs = Array.from(document.querySelectorAll('.tab'));

  const selectTab = (name) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      const panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) {
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      }
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => selectTab(tab.dataset.tab));
  });

  // Определяем ОС, чтобы сразу показать нужную вкладку
  const ua = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  if (/linux/i.test(ua) && !/android/i.test(ua)) {
    selectTab('linux');
  }

  /* ---------- 4. Копирование команд ---------- */
  document.querySelectorAll('.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const box = btn.closest('.code');
      const code = box && box.querySelector('code');
      if (!code) return;

      const text = code.innerText.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch { /* no-op */ }
        ta.remove();
      }

      const prev = btn.innerHTML;
      btn.classList.add('is-done');
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4.5 4.5L19 7"/></svg>';
      setTimeout(() => {
        btn.classList.remove('is-done');
        btn.innerHTML = prev;
      }, 1600);
    });
  });

  /* ---------- 5. Появление блоков при скролле ---------- */
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealItems.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          // небольшая задержка, чтобы карточки сетки выезжали лесенкой
          const delay = Math.min(i * 70, 280);
          setTimeout(() => el.classList.add('is-in'), delay);
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- 6. Подсветка карточек под курсором ---------- */
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- 7. Дублирование бегущей строки для бесшовности ---------- */
  const marquee = document.querySelector('.marquee');
  if (marquee) {
    const original = marquee.innerHTML;
    marquee.insertAdjacentHTML('beforeend', original);
  }

  /* ---------- 8. Год в футере ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- 9. FAQ: открыт только один вопрос ---------- */
  const questions = Array.from(document.querySelectorAll('.qa'));
  questions.forEach((qa) => {
    qa.addEventListener('toggle', () => {
      if (!qa.open) return;
      questions.forEach((other) => {
        if (other !== qa) other.open = false;
      });
    });
  });
})();
