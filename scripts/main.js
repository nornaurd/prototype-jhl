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
      if (valid) window.location.href = 'login.html';
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

/* === Log-in: перевірка Email + Password === */
(function initLoginRedirect() {
  const emailInput    = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const loginBtn      = document.getElementById('loginButton');
  if (!emailInput || !passwordInput || !loginBtn) return;   // запускається лише на login.html

  const domainList = (window.recognizedDomains || []).map(d => d.toLowerCase());

  /* — прибираємо invalid-клас під час введення — */
  [emailInput, passwordInput].forEach(el =>
    el.addEventListener('input', () => el.classList.remove('invalid'))
  );

  loginBtn.addEventListener('click', e => {
    e.preventDefault();
    let valid = true;

    const email    = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    /* — перевірка полів — */
    if (!email) {
      emailInput.classList.add('invalid');
      valid = false;
    }
    if (!password) {
      passwordInput.classList.add('invalid');
      valid = false;
    }
    if (!valid) return;                         // блокуємо перехід, якщо є помилки

    /* — далі логіка вибору сторінки залежно від домену — */
    const isKnown = domainList.some(d => email.endsWith('@' + d));
    window.location.href = isKnown ? 'checkout.html' : 'additional-email-info.html';
  });
})();


  /* === Перевірка полів на signup.html === */
(function initSignupValidation() {
  const signupBtn       = document.getElementById('signupButton');
  if (!signupBtn) return;                      // скрипт ігнорує інші сторінки

  const firstNameInput  = document.getElementById('firstNameInput');
  const lastNameInput   = document.getElementById('lastNameInput');
  const emailInput      = document.getElementById('emailInput');
  const passwordInput   = document.getElementById('passwordInput');
  const agreeCheckbox   = document.getElementById('agreeCheckbox');
  const checkboxWrapper = agreeCheckbox.closest('.checkbox-wrapper');

  /* допоміжні функції */
  const setValid   = el => el.classList.remove('invalid');
  const setInvalid = el => el.classList.add('invalid');

  /* очищаємо помилку під час введення */
  [firstNameInput, lastNameInput, emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => setValid(input));
  });
  agreeCheckbox.addEventListener('change', () => {
    setValid(agreeCheckbox);
    checkboxWrapper.classList.remove('invalid');
  });

  /* головна перевірка при натисканні */
  /* головна перевірка при натисканні */
signupBtn.addEventListener('click', e => {
  e.preventDefault();              // блокуємо стандартний submit
  let valid = true;

  /*–– базова перевірка полів ––*/
  [firstNameInput, lastNameInput, emailInput, passwordInput].forEach(input => {
    if (!input.value.trim()) {
      setInvalid(input);
      valid = false;
    }
  });

  /*–– чекбокс ––*/
  if (!agreeCheckbox.checked) {
    setInvalid(agreeCheckbox);
    checkboxWrapper.classList.add('invalid');
    valid = false;
  }

  if (!valid) return;              // якщо є помилки – зупиняємось

  /*–– логіка вибору сторінки ––*/
  const domainList = (window.recognizedDomains || []).map(d => d.toLowerCase());
  const email      = emailInput.value.trim().toLowerCase();
  const isKnown    = domainList.some(d => email.endsWith('@' + d));

  /*–– переходимо на потрібну сторінку ––*/
  window.location.href = isKnown ? 'confirm-email.html' : 'additional-info.html';
});

})();

/* === Additional-email-info: перевірка Business e-mail === */
(function initAdditionalEmailRedirect() {
  const emailInput  = document.getElementById('emailInput');      // поле Business email
  const continueBtn = document.getElementById('businessContinueButton');  // кнопка Continue
  if (!emailInput || !continueBtn) return;    // скрипт спрацює тільки на additional-email-info.html

  /* — список відомих доменів — */
  const domainList = (window.recognizedDomains || []).map(d => d.toLowerCase());

  /* прибираємо .invalid у процесі введення */
  emailInput.addEventListener('input', () => emailInput.classList.remove('invalid'));

  continueBtn.addEventListener('click', e => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();

    /* — базова перевірка, що поле не порожнє — */
    if (!email) {
      emailInput.classList.add('invalid');
      return;
    }

    /* — куди вести далі? — */
    const isKnown = domainList.some(d => email.endsWith('@' + d));
    window.location.href = isKnown ? 'confirm-email.html'  // ✅ домен зі списку
                                   : 'additional-info.html'; // ❌ інший домен
  });
})();

/* === Additional-info: перевірка текстового поля === */
(function initAdditionalInfoValidation() {
  const textarea    = document.getElementById('moreInfoTextArea');   // наше поле
  const continueBtn = document.getElementById('submitButton');       // кнопка Continue
  if (!textarea || !continueBtn) return;   // скрипт спрацює тільки на additional-info.html

  /* під час введення - забираємо червону рамку */
  textarea.addEventListener('input', () => textarea.classList.remove('invalid'));

  /* натискання на Continue */
  continueBtn.addEventListener('click', e => {
    e.preventDefault();                                 // блокуємо стандартний submit

    /* — поле порожнє? — */
    if (!textarea.value.trim()) {
      textarea.classList.add('invalid');                // додаємо червоний бордер
      return;                                           // зупиняємось
    }

    /* — усе гаразд, переходимо далі — */
    window.location.href = 'checkout.html';
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
    /* === показ / приховування кроку 3 === */
    const showStep3 = document.body.dataset.showStep3 === "true";   // true / false
    document.querySelectorAll('.conditional-step').forEach(el => {
      el.style.display = showStep3 ? '' : 'none';   // '' = за замовчуванням (видно)
    });

    // Ховати або показувати кроки
const stepsContainer = document.getElementById('stepsContainer');
const showSteps = document.body.dataset.showsteps !== "false";
if (stepsContainer) {
  stepsContainer.style.display = showSteps ? '' : 'none';
}

  
}
