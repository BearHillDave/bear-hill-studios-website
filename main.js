/* ── Nav: scroll shadow ── */
window.addEventListener('scroll', function () {
  document.querySelector('.site-header').classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Mobile menu toggle ── */
var burger = document.getElementById('burger');
var mobileMenu = document.getElementById('mobile-menu');

burger.addEventListener('click', function () {
  var expanded = this.getAttribute('aria-expanded') === 'true';
  this.setAttribute('aria-expanded', String(!expanded));
  mobileMenu.setAttribute('aria-hidden', String(expanded));
});
