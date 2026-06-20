
const EMAILJS_PUBLIC_KEY  = 'sXkhns3itTau190no';

// ✏️ Put your EmailJS Service ID here (e.g. "service_abc123")
const EMAILJS_SERVICE_ID  = 'service_g3hw08k';

// ✏️ Put your EmailJS Template ID here (e.g. "template_xyz789")
const EMAILJS_TEMPLATE_ID = 'template_oagjnge';

// Initialize EmailJS — this runs automatically when the page loads
(function initEmailJS() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
})();


/* ============================================================
   2. TYPING EFFECT — Hero animated titles
   ─────────────────────────────────────────────────────────────
   ✏️ Edit the strings array below to change what gets typed
   ============================================================ */
const typedStrings = [
  'Programming Student',
  'Software Developer',
  'Web Developer',
  'Problem Solver',
];

let typedIndex   = 0;   // which string we're on
let charIndex    = 0;   // which character we're on
let isDeleting   = false;
const typedEl    = document.getElementById('typed-text');
const TYPE_SPEED = 90;   // ms per character (typing)
const DEL_SPEED  = 50;   // ms per character (deleting)
const PAUSE_END  = 1800; // ms to pause at the end of a word
const PAUSE_START= 400;  // ms to pause before typing next word

function runTyping() {
  if (!typedEl) return;
  const current = typedStrings[typedIndex];

  if (isDeleting) {
    typedEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typedEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }

  let delay = isDeleting ? DEL_SPEED : TYPE_SPEED;

  if (!isDeleting && charIndex === current.length) {
    // Finished typing — pause then delete
    delay = PAUSE_END;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    // Finished deleting — move to next word
    isDeleting = false;
    typedIndex = (typedIndex + 1) % typedStrings.length;
    delay = PAUSE_START;
  }

  setTimeout(runTyping, delay);
}

// Start the typing effect after a short delay
setTimeout(runTyping, 600);


/* ============================================================
   3. NAVBAR — scroll behaviour + active link highlighting
   ============================================================ */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks   = document.querySelectorAll('.nav-link');

// Add .scrolled class to navbar after scrolling 60px
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  updateActiveLink();
  toggleScrollTopBtn();
});

// Hamburger menu toggle
hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// Highlight the correct nav link based on scroll position
function updateActiveLink() {
  const sections    = document.querySelectorAll('section[id]');
  const scrollPos   = window.scrollY + 120;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}


/* ============================================================
   4. SCROLL-TO-TOP BUTTON
   ============================================================ */
const scrollTopBtn = document.getElementById('scroll-top');

function toggleScrollTopBtn() {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ============================================================
   5. SCROLL ANIMATIONS — fade-in on scroll
   ============================================================ */
const fadeEls = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once visible, no need to keep observing
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

fadeEls.forEach(el => observer.observe(el));


/* ============================================================
   6. SKILL BAR ANIMATIONS
   Bars animate when the skills section scrolls into view
   ============================================================ */
const skillFills   = document.querySelectorAll('.skill-fill');
let skillsAnimated = false;

const skillObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !skillsAnimated) {
      skillsAnimated = true;
      skillFills.forEach(fill => {
        const level = fill.getAttribute('data-level');
        // Small timeout so CSS transition is visible
        setTimeout(() => {
          fill.style.width = `${level}%`;
        }, 150);
      });
      skillObserver.disconnect();
    }
  },
  { threshold: 0.1 }
);

const skillsSection = document.getElementById('skills');
if (skillsSection) skillObserver.observe(skillsSection);


/* ============================================================
   7. CONTACT FORM — EmailJS submission
   ============================================================ */
const contactForm  = document.getElementById('contact-form');
const submitBtn    = document.getElementById('submit-btn');
const formFeedback = document.getElementById('form-feedback');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic client-side validation
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !message) {
      showFeedback('Please fill in all fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showFeedback('Please enter a valid email address.', 'error');
      return;
    }

    // Show loading state
    setSubmitting(true);
    clearFeedback();

    const templateParams = { name, email, subject, message };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      showFeedback('✓ Your message has been sent successfully! I\'ll get back to you soon.', 'success');
      contactForm.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      showFeedback(
        'Oops — something went wrong. Please try again or email me directly.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  });
}

function setSubmitting(loading) {
  const btnText    = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  submitBtn.disabled = loading;

  if (loading) {
    btnText.style.display    = 'none';
    btnLoading.style.display = 'inline-flex';
  } else {
    btnText.style.display    = 'inline-flex';
    btnLoading.style.display = 'none';
  }
}

function showFeedback(msg, type) {
  formFeedback.textContent = msg;
  formFeedback.className   = `form-feedback ${type}`;
}

function clearFeedback() {
  formFeedback.textContent = '';
  formFeedback.className   = 'form-feedback';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* ============================================================
   8. FOOTER — auto-update copyright year
   ============================================================ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ============================================================
   9. SMOOTH SCROLL for anchor links (older browser fallback)
   Modern browsers handle this via CSS scroll-behavior: smooth,
   but this adds extra safety for anchor links with offsets.
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navHeight = navbar.offsetHeight;
    const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top: targetPos, behavior: 'smooth' });
  });
});