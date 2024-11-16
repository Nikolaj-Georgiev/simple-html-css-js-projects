//////////////////////////////////////////////////////////////
// Smooth scrolling animation
const links = document.querySelectorAll('a[href^="#"]');
const offset = 5 * parseFloat(getComputedStyle(document.documentElement).fontSize); // 5rem

links.forEach(link => {
  link.addEventListener('click', function (event) {
    event.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    if (targetId === '') {
      // scroll to top if href="#"
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - offset,
          behavior: 'smooth'
        });
      }
    }
  });
});


////////////////////////////////////////////////////////////
// Sticky navigation
const sectionHeroEl = document.querySelector('.hero');
const navbar = document.getElementById('navbar');

const observer = new IntersectionObserver(function (entries) {
  const ent = entries[0];
  if (!ent.isIntersecting) {
    // console.log(ent);
    navbar.classList.add('sticky');
  }

  if (ent.isIntersecting) {
    navbar.classList.remove('sticky');
  }
}, {
  // In the viewport
  root: null,
  threshold: 0,
  rootMargin: '-80px',
});
observer.observe(sectionHeroEl);

//////////////////////////
// Burger menu
const checkbox = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.header-ul');
navLinks.addEventListener('click', (e) => {
  const navLinkClass = e.target.classList[0];
  if (navLinkClass === 'header-link') {
    checkbox.checked = false;
  }
})