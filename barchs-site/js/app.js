// Uttaranchal University BCA Portal Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initUnitNavigation();
  initTabs();
  initQuiz();
  initProgress();
});

// Theme Toggle
function initTheme() {
  const themeBtn = document.getElementById('theme-btn');
  const savedTheme = localStorage.getItem('bca_portal_theme') || 'light';
  
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.textContent = '☀️';
  }

  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('bca_portal_theme', 'light');
      themeBtn.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('bca_portal_theme', 'dark');
      themeBtn.textContent = '☀️';
    }
  });
}

// Unit Navigation (Sidebar switching)
function initUnitNavigation() {
  const unitButtons = document.querySelectorAll('.nav-unit-header');
  const unitSections = document.querySelectorAll('.unit-section');
  const unitGroups = document.querySelectorAll('.nav-unit-group');
  const breadcrumb = document.getElementById('active-breadcrumb');

  unitButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      
      // Update sidebar active classes
      unitButtons.forEach(b => b.classList.remove('active'));
      unitGroups.forEach(g => g.classList.remove('active'));
      btn.classList.add('active');
      btn.closest('.nav-unit-group').classList.add('active');

      // Update unit view
      unitSections.forEach(sec => sec.classList.remove('active'));
      const targetSec = document.getElementById(targetId);
      if (targetSec) {
        targetSec.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Update breadcrumb
      const unitName = btn.querySelector('.unit-title').textContent;
      if (breadcrumb) {
        breadcrumb.textContent = unitName;
      }

      // Track progress
      markUnitVisited(targetId);
    });
  });
}

// Tab Switching
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentUnitId = btn.getAttribute('data-unit');
      const targetTabId = btn.getAttribute('data-tab');
      const parentUnit = document.getElementById(parentUnitId);

      if (!parentUnit) return;

      // Deactivate siblings in this unit
      parentUnit.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      parentUnit.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      // Activate clicked
      btn.classList.add('active');
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// Interactive Quiz System
function initQuiz() {
  const quizItems = document.querySelectorAll('.quiz-item');

  quizItems.forEach(item => {
    const correctIdx = parseInt(item.getAttribute('data-correct'), 10);
    const options = item.querySelectorAll('.quiz-opt');
    const feedback = item.querySelector('.quiz-feedback');

    options.forEach((opt, idx) => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.style.pointerEvents = 'none');

        if (idx === correctIdx) {
          opt.classList.add('correct');
          feedback.className = 'quiz-feedback show-correct';
          feedback.innerHTML = '<strong>Excellent! Correct Answer.</strong><br>Well done! You have retained this concept accurately.';
        } else {
          opt.classList.add('wrong');
          options[correctIdx].classList.add('correct');
          feedback.className = 'quiz-feedback show-wrong';
          feedback.innerHTML = '<strong>Review Needed.</strong><br>The highlighted green option is correct for university exams.';
        }
      });
    });
  });
}

// Progress Tracker
function markUnitVisited(unitId) {
  let visited = JSON.parse(localStorage.getItem('uu_bca_visited_units') || '["unit-1"]');
  if (!visited.includes(unitId)) {
    visited.push(unitId);
    localStorage.setItem('uu_bca_visited_units', JSON.stringify(visited));
  }
  updateProgressBar(visited.length);
}

function initProgress() {
  let visited = JSON.parse(localStorage.getItem('uu_bca_visited_units') || '["unit-1"]');
  updateProgressBar(visited.length);
}

function updateProgressBar(count) {
  const totalUnits = 5;
  const percentage = Math.round((count / totalUnits) * 100);
  const progressBar = document.getElementById('overall-progress-bar');
  const progressText = document.getElementById('overall-progress-text');

  if (progressBar && progressText) {
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
  }
}
