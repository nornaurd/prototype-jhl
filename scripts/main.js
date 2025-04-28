/* ---------- main.js ---------- */
document.addEventListener('DOMContentLoaded', () => {
  /* === Header === */
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    fetch('partials/header.html')
      .then(r => r.text())
      .then(html => (headerPlaceholder.innerHTML = html))
      .catch(err => console.error('Помилка завантаження хедера:', err));
  }

  /* === Sub-header === */
  const subHeaderPlaceholder = document.getElementById('sub-header-placeholder');
  if (subHeaderPlaceholder) {
    fetch('partials/sub-header.html')
      .then(r => r.text())
      .then(html => {
        subHeaderPlaceholder.innerHTML = html;
        setupSubHeader();
      })
      .catch(err => console.error('Помилка завантаження субхедера:', err));
  }

  /* === Тексти (дозволяємо HTML) === */
  if (typeof pageTexts !== 'undefined') {
    const page = document.body.dataset.page;
    if (page && pageTexts[page]) {
      const texts = pageTexts[page];
      for (const [id, text] of Object.entries(texts)) {
        const el = document.getElementById(id);
        if (!el) continue;

        if (el.matches('input, textarea')) {
          el.placeholder = text;
        } else {
          el.innerHTML = text;           // дає можливість вставити <a> у signupPrompt
        }
      }
    }
  }

  /* === Дропдаун журналу — твоя логіка без змін === */
  (function initJournalDropdown() {
    const searchInput       = document.getElementById('searchPlaceholder');
    const dropdown          = document.getElementById('dropdown');
    const searchErrorText   = document.getElementById('searchErrorText');
    const continueBtn       = document.getElementById('continueButton');
    const checkbox          = document.getElementById('confirmationCheckbox');
    const checkboxWrapper   = document.querySelector('.checkbox-wrapper');

    if (!continueBtn || !searchInput || !searchErrorText || !dropdown || !checkbox || !checkboxWrapper) return;

    const journalTitle = 'BMC Biology';
    const journalISSN  = '1741-7007';

    continueBtn.addEventListener('click', e => {
      let valid = true;

      /* — перевірка інпуту — */
      if (!searchInput.value.trim()) {
        e.preventDefault();
        searchInput.classList.add('invalid');
        searchErrorText.textContent =
          (pageTexts?.[document.body.dataset.page]?.searchError) || 'Field is required';
        searchErrorText.style.display = 'block';
        valid = false;
      } else {
        searchInput.classList.remove('invalid');
        searchErrorText.style.display = 'none';
      }

      /* — перевірка чекбоксу — */
      if (!checkbox.checked) {
        e.preventDefault();
        checkbox.classList.add('invalid');
        checkboxWrapper.classList.add('invalid');
        valid = false;
      } else {
        checkbox.classList.remove('invalid');
        checkboxWrapper.classList.remove('invalid');
      }

      /* — успішний перехід — */
      if (valid) window.location.href = 'preview.html';
    });

    /* події input / blur / вибір із дропдауну — залишив як було */
    searchInput.addEventListener('input', () => {
      if (searchInput.value.trim()) {
        searchInput.classList.remove('invalid');
        searchErrorText.style.display = 'none';
      }
      dropdown.style.display = searchInput.value.trim() ? 'block' : 'none';
      if (dropdown.style.display === 'block') {
        dropdown.innerHTML = `
          <div class="dropdown-item" tabindex="0">
            <div class="dropdown-title">${journalTitle}</div>
            <div class="dropdown-issn">${journalISSN}</div>
          </div>`;
      }
    });

    checkbox.addEventListener('change', () => {
      checkbox.classList.remove('invalid');
      checkboxWrapper.classList.remove('invalid');
    });

    dropdown.addEventListener('click', e => {
      const item = e.target.closest('.dropdown-item');
      if (item) {
        searchInput.value = `${journalISSN}, ${journalTitle}`;
        dropdown.style.display = 'none';
      }
    });

    searchInput.addEventListener('blur', () => setTimeout(() => (dropdown.style.display = 'none'), 150));
  })();

  /* === Нова логіка: перевірка e-mail → редирект === */
  (function initLoginRedirect() {
    const emailInput = document.getElementById('emailInput');
    const loginBtn   = document.getElementById('loginButton');
    if (!emailInput || !loginBtn) return;          // скрипт працює і на сторінках без логіну

    const domainList = (window.recognizedDomains || []).map(d => d.toLowerCase());

    loginBtn.addEventListener('click', e => {
      e.preventDefault();
      const email = emailInput.value.trim().toLowerCase();

      if (!email) {
        emailInput.classList.add('invalid');
        return;
      }

      // чи закінчується e-mail на @... з whitelist
      const isKnown = domainList.some(domain => email.endsWith('@' + domain));

      window.location.href = isKnown ? 'checkout.html' : 'additional-info.html';
    });
  })();
});


// Функція для налаштування субхедера
function setupSubHeader() {
  const currentStep = document.body.dataset.step; // Наприклад, '2'

  if (currentStep) {
    const activeStep = document.getElementById(`step-${currentStep}`);
    if (activeStep) {
      activeStep.classList.add('active');
    }
  }

  // Показати або приховати кнопки
  const showBack = document.body.dataset.showBack === "true";
  const showContinue = document.body.dataset.showContinue === "true";

  const backButton = document.getElementById('backButton');
  const continueButton = document.getElementById('continueButton');

  if (backButton) {
    backButton.style.display = showBack ? 'inline-block' : 'none';
    backButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.history.back();
    });
  }
  if (continueButton) {
    continueButton.style.display = showContinue ? 'inline-block' : 'none';
    continueButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'login.html';
    });
  }
}
