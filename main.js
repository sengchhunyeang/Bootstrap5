// Auto year
const yearSpan = document.getElementById('current-year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // Close mobile menu when clicking on a link
  const mobileMenuLinks = mobileMenu.querySelectorAll('a');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

// Dark/Light Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

if (themeToggle && themeIcon) {
  // Check for saved theme preference - default to dark mode on first visit
  if (localStorage.getItem('color-theme') === 'dark') {
    // User previously chose light mode
    document.documentElement.classList.add('dark');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  } else {
    // Default to dark mode (first visit or user chose dark)
    document.documentElement.classList.remove('dark');
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
  }

  themeToggle.addEventListener('click', () => {
    // Toggle dark mode
    document.documentElement.classList.toggle('dark');

    // Update icon
    if (document.documentElement.classList.contains('dark')) {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
      localStorage.setItem('color-theme', 'dark');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
      localStorage.setItem('color-theme', 'light');
    }
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();

    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// Telegram send handler - opens Telegram (web or app) with pre-filled text
const telegramBtn = document.getElementById('send-telegram');
if (telegramBtn) {
  telegramBtn.addEventListener('click', () => {
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    if (!name || !email || !message) {
      alert('Please fill in Name, Email, and Message before sending to Telegram.');
      return;
    }

    const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
    const url = `https://t.me/chhunyeang?text=${encodeURIComponent(text)}`;

    // Open Telegram (web or app). User must press send in Telegram.
    window.open(url, '_blank');
  });
}

// ============================================
// Animated Counter - counts from 0 to target
// ============================================
// Usage: <span data-target="5000" data-duration="2000"></span>
// - data-target: target number to count to (required)
// - data-duration: animation duration in ms (optional, default: 2000)
// - data-easing: easing type - "easeOut", "easeIn", "easeInOut", "linear" (optional, default: "easeOut")

const easingFunctions = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

const animateCounter = (element) => {
  const target = parseInt(element.dataset.target, 10) || 0;
  const duration = parseInt(element.dataset.duration, 10) || 2000;
  const easingName = element.dataset.easing || 'easeOut';
  const easing = easingFunctions[easingName] || easingFunctions.easeOut;

  let startTime = null;

  const updateCounter = (currentTime) => {
    if (!startTime) startTime = currentTime;

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);

    const currentValue = Math.floor(easedProgress * target);
    element.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target.toLocaleString();
    }
  };

  requestAnimationFrame(updateCounter);
};

// Initialize counters when they come into view (Intersection Observer)
const initCounters = () => {
  const counters = document.querySelectorAll('[data-target]');

  if (counters.length === 0) return;

  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px',
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        animateCounter(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach((counter) => {
    counter.textContent = '0';
    counterObserver.observe(counter);
  });
};

// Initialize counters on DOM ready
initCounters();
