document.addEventListener('DOMContentLoaded', () => {
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    fetch('partials/header.html')
      .then(r => r.text())
      .then(html => (headerPlaceholder.innerHTML = html))
      .catch(err => console.error('Помилка завантаження хедера:', err));
  }

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
          el.innerHTML = text;
        }
      }
    }
  }

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

      if (!checkbox.checked) {
        e.preventDefault();
        checkbox.classList.add('invalid');
        checkboxWrapper.classList.add('invalid');
        valid = false;
      } else {
        checkbox.classList.remove('invalid');
        checkboxWrapper.classList.remove('invalid');
      }

      if (valid) window.location.href = 'login.html';
    });

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

  (function initLoginRedirect() {
    const emailInput    = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn      = document.getElementById('loginButton');
    if (!emailInput || !passwordInput || !loginBtn) return;

    const domainList = (window.recognizedDomains || []).map(d => d.toLowerCase());

    [emailInput, passwordInput].forEach(el =>
      el.addEventListener('input', () => el.classList.remove('invalid'))
    );

    loginBtn.addEventListener('click', e => {
      e.preventDefault();
      let valid = true;

      const email    = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value.trim();

      if (!email) {
        emailInput.classList.add('invalid');
        valid = false;
      }
      if (!password) {
        passwordInput.classList.add('invalid');
        valid = false;
      }
      if (!valid) return;

      const isKnown = domainList.some(d => email.endsWith('@' + d));
      window.location.href = isKnown ? 'checkout.html' : 'additional-email-info.html';
    });
  })();

  (function initSignupValidation() {
    const signupBtn = document.getElementById('signupButton');
    if (!signupBtn) return;

    const firstNameInput  = document.getElementById('firstNameInput');
    const lastNameInput   = document.getElementById('lastNameInput');
    const emailInput      = document.getElementById('emailInput');
    const passwordInput   = document.getElementById('passwordInput');
    const agreeCheckbox   = document.getElementById('agreeCheckbox');
    const checkboxWrapper = agreeCheckbox.closest('.checkbox-wrapper');

    const setValid   = el => el.classList.remove('invalid');
    const setInvalid = el => el.classList.add('invalid');

    [firstNameInput, lastNameInput, emailInput, passwordInput].forEach(input => {
      input.addEventListener('input', () => setValid(input));
    });
    agreeCheckbox.addEventListener('change', () => {
      setValid(agreeCheckbox);
      checkboxWrapper.classList.remove('invalid');
    });

    signupBtn.addEventListener('click', e => {
      e.preventDefault();
      let valid = true;

      [firstNameInput, lastNameInput, emailInput, passwordInput].forEach(input => {
        if (!input.value.trim()) {
          setInvalid(input);
          valid = false;
        }
      });

      if (!agreeCheckbox.checked) {
        setInvalid(agreeCheckbox);
        checkboxWrapper.classList.add('invalid');
        valid = false;
      }

      if (!valid) return;

      const domainList = (window.recognizedDomains || []).map(d => d.toLowerCase());
      const email      = emailInput.value.trim().toLowerCase();
      const isKnown    = domainList.some(d => email.endsWith('@' + d));

      window.location.href = isKnown ? 'confirm-email-s.html' : 'additional-info-s.html';
    });
  })();

  (function initAdditionalEmailRedirect() {
    const emailInput  = document.getElementById('emailInput');
    const continueBtn = document.getElementById('businessContinueButton');
    if (!emailInput || !continueBtn) return;

    const domainList = (window.recognizedDomains || []).map(d => d.toLowerCase());

    emailInput.addEventListener('input', () => emailInput.classList.remove('invalid'));

    continueBtn.addEventListener('click', e => {
      e.preventDefault();
      const email = emailInput.value.trim().toLowerCase();

      if (!email) {
        emailInput.classList.add('invalid');
        return;
      }

      const isKnown = domainList.some(d => email.endsWith('@' + d));
      window.location.href = isKnown ? 'confirm-email.html' : 'additional-info.html';
    });
  })();

  (function initAdditionalInfoValidation() {
    const page = document.body.dataset.page;
    const textarea    = document.getElementById('moreInfoTextArea');
    const continueBtn = document.getElementById('submitButton');
    if (!textarea || !continueBtn) return;

    textarea.addEventListener('input', () => textarea.classList.remove('invalid'));

    continueBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!textarea.value.trim()) {
        textarea.classList.add('invalid');
        return;
      }

      if (page === 'additionalInfoS') {
        window.location.href = 'confirm-email-s.html';
      } else {
        window.location.href = 'checkout.html';
      }
    });
  })();

  (function initConfirmEmailSPage() {
    if (document.body.dataset.page !== 'confirmEmailS') return;

    const prototypeHint = document.getElementById('prototypeHint');
    if (prototypeHint) {
      prototypeHint.setAttribute('href', 'mailbox-s.html');
      prototypeHint.setAttribute('target', '_blank');
    }
  })();
});

function setupSubHeader() {
  const currentStep = document.body.dataset.step;

  if (currentStep) {
    const activeStep = document.getElementById(`step-${currentStep}`);
    if (activeStep) {
      activeStep.classList.add('active');
    }
  }

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

  const showStep3 = document.body.dataset.showStep3 === "true";
  document.querySelectorAll('.conditional-step').forEach(el => {
    el.style.display = showStep3 ? '' : 'none';
  });

  const stepsContainer = document.getElementById('stepsContainer');
  const showSteps = document.body.dataset.showsteps !== "false";
  if (stepsContainer) {
    stepsContainer.style.display = showSteps ? '' : 'none';
  }
}
