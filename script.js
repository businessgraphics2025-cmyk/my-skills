// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Burger menu
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Fade-in on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });

document.querySelectorAll('.service-card, .gallery-item, .testi-card, .why-item, .contact-detail').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Gallery filters
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      const match = filter === 'all' || item.dataset.cat === filter;
      item.style.opacity = match ? '1' : '0.2';
      item.style.pointerEvents = match ? 'auto' : 'none';
    });
  });
});

// Contact form
const form = document.getElementById('contactForm');
const successMsg = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if (!name || !phone) {
    [document.getElementById('name'), document.getElementById('phone')].forEach(input => {
      if (!input.value.trim()) input.style.borderColor = 'rgba(255,80,80,.6)';
    });
    return;
  }
  submitBtn.textContent = 'שולח...';
  submitBtn.disabled = true;
  setTimeout(() => {
    successMsg.classList.add('show');
    form.reset();
    submitBtn.textContent = 'שלח הצעת מחיר';
    submitBtn.disabled = false;
    setTimeout(() => successMsg.classList.remove('show'), 5000);
  }, 1200);
});

// Reset input error styles on type
document.querySelectorAll('.contact-form input').forEach(input => {
  input.addEventListener('input', () => input.style.borderColor = '');
});
