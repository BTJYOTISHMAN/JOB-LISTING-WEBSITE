const jobs = window.jobs || [];

document.addEventListener('DOMContentLoaded', () => {
  let filteredJobs = [...jobs];
  let savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
  let showSavedOnly = false;
  let currentPage = 1;
  const itemsPerPage = 6;

  const jobGrid = document.getElementById('job-grid');
  const titleSearch = document.getElementById('job-title-search');
  const navSearchInput = document.getElementById('nav-search-input');
  const locationFilter = document.getElementById('location-filter');
  const categoryFilter = document.getElementById('category-filter');
  const experienceFilter = document.getElementById('experience-filter');
  const sortOrder = document.getElementById('sort-order');
  const clearFiltersBtn = document.getElementById('clear-filters');
  const pagination = document.getElementById('pagination');
  const jobCount = document.getElementById('job-count');

  const modal = document.getElementById('job-modal');
  const modalBody = document.getElementById('modal-body');
  const closeModal = document.querySelector('#job-modal .close-modal');

  const loginModal = document.getElementById('login-modal');
  const closeLogin = document.querySelector('.close-login');
  const loginForm = document.getElementById('login-form');

  const infoModal = document.getElementById('info-modal');
  const infoBody = document.getElementById('info-modal-body');
  const closeInfo = document.querySelector('.close-info');

  const alertModal = document.getElementById('alert-modal');
  const closeAlert = document.querySelector('.close-alert');
  const alertForm = document.getElementById('alert-form');

  const savedJobsBtn = document.getElementById('saved-jobs-btn');
  const mobileSavedBtn = document.getElementById('mobile-saved-btn');
  const loginBtn = document.getElementById('login-btn');
  const mobileLoginBtn = document.getElementById('mobile-login-btn');
  const setAlertBtn = document.getElementById('set-alert-btn');

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  const navSearch = document.getElementById('nav-search');

  const showFiltersBtn = document.getElementById('show-filters');
  const closeFiltersBtn = document.getElementById('close-filters');
  const filtersSidebar = document.getElementById('filters-sidebar');

  const companiesLink = document.getElementById('companies-link');
  const salariesLink = document.getElementById('salaries-link');
  const footerLinks = document.querySelectorAll('.footer-links a');
  const alertCategory = document.getElementById('alert-category');

  init();

  function init() {
    populateFilters();
    bindEvents();
    applyFilters();
    refreshIcons();
  }

  function bindEvents() {
    titleSearch.addEventListener('input', onSearchInput);
    navSearchInput.addEventListener('input', onNavSearchInput);

    locationFilter.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    experienceFilter.addEventListener('change', applyFilters);
    sortOrder.addEventListener('change', applyFilters);

    clearFiltersBtn.addEventListener('click', clearFilters);

    if (savedJobsBtn) savedJobsBtn.addEventListener('click', toggleSavedView);
    if (mobileSavedBtn) mobileSavedBtn.addEventListener('click', toggleSavedView);

    if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', () => openModal(loginModal));

    if (closeModal) closeModal.addEventListener('click', () => closeAnyModal(modal));
    if (closeLogin) closeLogin.addEventListener('click', () => closeAnyModal(loginModal));
    if (closeInfo) closeInfo.addEventListener('click', () => closeAnyModal(infoModal));
    if (closeAlert) closeAlert.addEventListener('click', () => closeAnyModal(alertModal));

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Login successful!');
        closeAnyModal(loginModal);
      });
    }

    if (setAlertBtn) {
      setAlertBtn.addEventListener('click', () => openModal(alertModal));
    }

    if (alertForm) {
      alertForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('alert-email').value;
        const category = alertCategory.value || 'all categories';
        alert(`Job alerts for ${category} will be sent to ${email}.`);
        closeAnyModal(alertModal);
      });
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.setAttribute('data-lucide', navLinks.classList.contains('active') ? 'x' : 'menu');
        refreshIcons();
      });
    }

    if (showFiltersBtn) {
      showFiltersBtn.addEventListener('click', () => {
        filtersSidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeFiltersBtn) {
      closeFiltersBtn.addEventListener('click', () => {
        filtersSidebar.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    }

    if (companiesLink) {
      companiesLink.addEventListener('click', (e) => {
        e.preventDefault();
        showCompanies();
      });
    }

    if (salariesLink) {
      salariesLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSalaries();
      });
    }

    footerLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const type = link.textContent.trim();
        if (!type) return;
        e.preventDefault();
        showInfoModal(type);
      });
    });

    window.addEventListener('scroll', () => {
      const hero = document.querySelector('.hero-section');
      if (hero && window.scrollY > hero.offsetHeight - 100) {
        navSearch.classList.add('visible');
      } else {
        navSearch.classList.remove('visible');
      }
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) closeAnyModal(modal);
      if (e.target === loginModal) closeAnyModal(loginModal);
      if (e.target === infoModal) closeAnyModal(infoModal);
      if (e.target === alertModal) closeAnyModal(alertModal);
    });
  }

  function onSearchInput(e) {
    navSearchInput.value = e.target.value;
    applyFilters();
  }

  function onNavSearchInput(e) {
    titleSearch.value = e.target.value;
    applyFilters();
  }

  function populateFilters() {
    const locations = [...new Set(jobs.map((j) => j.location))].sort();
    const categories = [...new Set(jobs.map((j) => j.category))].sort();

    locations.forEach((location) => {
      locationFilter.insertAdjacentHTML('beforeend', `<option value="${location}">${location}</option>`);
    });

    categories.forEach((category) => {
      categoryFilter.insertAdjacentHTML('beforeend', `<option value="${category}">${category}</option>`);
      alertCategory.insertAdjacentHTML('beforeend', `<option value="${category}">${category}</option>`);
    });
  }

  function clearFilters() {
    titleSearch.value = '';
    navSearchInput.value = '';
    locationFilter.value = '';
    categoryFilter.value = '';
    experienceFilter.value = '';
    applyFilters();
  }

  function toggleSavedView() {
    showSavedOnly = !showSavedOnly;

    [savedJobsBtn, mobileSavedBtn].forEach((btn) => {
      if (!btn) return;
      btn.classList.toggle('active', showSavedOnly);
      const label = btn.querySelector('span');
      if (label) label.textContent = showSavedOnly ? 'Showing Saved' : 'Saved';
    });

    applyFilters();
  }

  function applyFilters() {
    const titleQuery = titleSearch.value.toLowerCase().trim();

    filteredJobs = jobs.filter((job) => {
      const matchesTitle = job.title.toLowerCase().includes(titleQuery) || job.company.toLowerCase().includes(titleQuery);
      const matchesLocation = !locationFilter.value || job.location === locationFilter.value;
      const matchesCategory = !categoryFilter.value || job.category === categoryFilter.value;
      const matchesExperience = !experienceFilter.value || job.experience === experienceFilter.value;
      const matchesSaved = !showSavedOnly || savedJobIds.includes(job.id);
      return matchesTitle && matchesLocation && matchesCategory && matchesExperience && matchesSaved;
    });

    if (sortOrder.value === 'salary-high') {
      filteredJobs.sort((a, b) => salaryNumber(b.salary) - salaryNumber(a.salary));
    } else {
      filteredJobs.sort((a, b) => b.id - a.id);
    }

    currentPage = 1;
    renderJobs();
  }

  function renderJobs() {
    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredJobs.slice(start, start + itemsPerPage);

    jobGrid.innerHTML = '';

    if (!pageItems.length) {
      jobGrid.innerHTML = `
        <div class="no-results">
          <i data-lucide="search-x"></i>
          <h3>${showSavedOnly ? 'No saved jobs' : 'No jobs found'}</h3>
          <p>${showSavedOnly ? 'Save jobs first to see them here.' : 'Try changing search or filters.'}</p>
        </div>
      `;
      jobCount.textContent = '0';
      pagination.innerHTML = '';
      refreshIcons();
      return;
    }

    pageItems.forEach((job) => {
      const isSaved = savedJobIds.includes(job.id);
      const card = document.createElement('div');
      card.className = 'job-card';
      card.innerHTML = `
        <div class="job-card-header">
          <div class="job-info">
            <span class="company-name">${job.company}</span>
            <h3>${job.title}</h3>
          </div>
          <button class="save-btn ${isSaved ? 'active' : ''}" data-id="${job.id}" aria-label="save-job">
            <i data-lucide="bookmark" fill="${isSaved ? 'currentColor' : 'none'}"></i>
          </button>
        </div>
        <div class="job-tags">
          <span class="tag"><i data-lucide="map-pin"></i>${job.location}</span>
          <span class="tag"><i data-lucide="briefcase"></i>${job.experience}</span>
          <span class="tag"><i data-lucide="layers"></i>${job.category}</span>
        </div>
        <p class="job-desc">${job.description}</p>
        <div class="job-card-footer">
          <span class="salary">${job.salary}</span>
          <button class="btn btn-outline btn-sm view-more" data-id="${job.id}">View Details</button>
        </div>
      `;
      jobGrid.appendChild(card);
    });

    jobCount.textContent = String(filteredJobs.length);
    renderPagination();
    attachCardListeners();
    refreshIcons();
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i += 1) {
      const btn = document.createElement('button');
      btn.className = `paginate-btn ${i === currentPage ? 'active' : ''}`;
      btn.textContent = String(i);
      btn.addEventListener('click', () => {
        currentPage = i;
        renderJobs();
        window.scrollTo({ top: 420, behavior: 'smooth' });
      });
      pagination.appendChild(btn);
    }
  }

  function attachCardListeners() {
    document.querySelectorAll('.view-more').forEach((btn) => {
      btn.addEventListener('click', () => showJobDetails(Number(btn.dataset.id)));
    });

    document.querySelectorAll('.save-btn').forEach((btn) => {
      btn.addEventListener('click', () => toggleSaveJob(btn));
    });
  }

  function showJobDetails(id) {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    modalBody.innerHTML = `
      <div class="modal-header">
        <span class="company-name">${job.company}</span>
        <h2>${job.title}</h2>
      </div>
      <div class="job-tags" style="margin: 10px 0 16px;">
        <span class="tag"><i data-lucide="map-pin"></i>${job.location}</span>
        <span class="tag"><i data-lucide="indian-rupee"></i>${job.salary}</span>
        <span class="tag"><i data-lucide="clock-3"></i>${job.type}</span>
      </div>
      <div>
        <h3>About Role</h3>
        <p style="margin-top: 8px; color: #334155;">${job.description}</p>
      </div>
      <div style="margin-top: 14px;">
        <h3>Requirements</h3>
        <ul style="margin-left: 18px; margin-top: 8px; color: #334155;">
          ${job.requirements.map((req) => `<li>${req}</li>`).join('')}
        </ul>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:18px;">
        <button class="btn btn-primary" id="apply-btn">Apply Now</button>
        <span style="color:#64748b; font-weight:700;">Posted ${job.posted}</span>
      </div>
    `;

    openModal(modal);
    refreshIcons();

    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        alert(`Application submitted for ${job.title} at ${job.company}.`);
        closeAnyModal(modal);
      });
    }
  }

  function toggleSaveJob(btn) {
    const id = Number(btn.dataset.id);
    const idx = savedJobIds.indexOf(id);

    if (idx >= 0) {
      savedJobIds.splice(idx, 1);
      btn.classList.remove('active');
      const icon = btn.querySelector('svg');
      if (icon) icon.setAttribute('fill', 'none');
    } else {
      savedJobIds.push(id);
      btn.classList.add('active');
      const icon = btn.querySelector('svg');
      if (icon) icon.setAttribute('fill', 'currentColor');
    }

    localStorage.setItem('savedJobs', JSON.stringify(savedJobIds));

    if (showSavedOnly) applyFilters();
  }

  function showInfoModal(type) {
    const content = {
      'About Us': {
        title: 'About EmployHub',
        html: '<p>EmployHub helps candidates discover high-quality opportunities with smarter filters and cleaner job insights.</p><p>We focus on verified listings, rich role details, and fast search experience.</p>'
      },
      Contact: {
        title: 'Contact Us',
        html: '<p>Email: support@employhub.com</p><p>Phone: +91 90000 00000</p><p>Location: Cuttack, Odisha</p>'
      },
      'Privacy Policy': {
        title: 'Privacy Policy',
        html: '<p>Your profile data is only used for matching and platform functionality.</p><p>We do not sell personal data to third parties.</p>'
      }
    };

    const selected = content[type];
    if (!selected) return;

    infoBody.innerHTML = `<h2>${selected.title}</h2>${selected.html}`;
    openModal(infoModal);
  }

  function showCompanies() {
    const companies = [...new Set(jobs.map((j) => j.company))].sort();
    infoBody.innerHTML = `
      <h2>Top Companies</h2>
      <p style="margin-bottom: 10px;">Click a company to filter jobs.</p>
      <div style="display:grid; gap:10px; margin-top: 10px;">
        ${companies
          .map((company) => `<button class="btn btn-outline company-filter" data-company="${company}" style="justify-content:space-between;"><span>${company}</span><span>${jobs.filter((j) => j.company === company).length} Jobs</span></button>`)
          .join('')}
      </div>
    `;

    openModal(infoModal);

    infoBody.querySelectorAll('.company-filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        titleSearch.value = btn.dataset.company;
        navSearchInput.value = btn.dataset.company;
        closeAnyModal(infoModal);
        applyFilters();
      });
    });
  }

  function showSalaries() {
    const categories = [...new Set(jobs.map((j) => j.category))];
    const rows = categories
      .map((category) => {
        const categoryJobs = jobs.filter((j) => j.category === category);
        const values = categoryJobs.map((j) => salaryNumber(j.salary)).filter(Boolean);
        const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
        return { category, avg, count: categoryJobs.length };
      })
      .sort((a, b) => b.avg - a.avg);

    infoBody.innerHTML = `
      <h2>Salary Guide</h2>
      <p style="margin-bottom: 10px;">Click a category to filter jobs.</p>
      <div style="display:grid; gap:10px; margin-top: 10px;">
        ${rows
          .map(
            (row) => `<button class="btn btn-outline salary-filter" data-category="${row.category}" style="justify-content:space-between;"><span>${row.category}</span><span>${formatMoney(row.avg)} avg</span></button>`
          )
          .join('')}
      </div>
    `;

    openModal(infoModal);

    infoBody.querySelectorAll('.salary-filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        categoryFilter.value = btn.dataset.category;
        closeAnyModal(infoModal);
        applyFilters();
      });
    });
  }

  function salaryNumber(value) {
    const nums = String(value).replace(/,/g, '').match(/\d+/g);
    if (!nums || !nums.length) return 0;
    const avg = nums.map(Number).reduce((a, b) => a + b, 0) / nums.length;
    return avg;
  }

  function formatMoney(num) {
    if (num >= 10000000) return `INR ${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `INR ${(num / 100000).toFixed(1)} LPA`;
    return `INR ${Math.round(num).toLocaleString('en-IN')}`;
  }

  function openModal(el) {
    el.style.display = 'block';
    document.body.style.overflow = 'hidden';
    refreshIcons();
  }

  function closeAnyModal(el) {
    el.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }
});
