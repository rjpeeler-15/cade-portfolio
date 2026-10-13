// Footer year
document.querySelectorAll('.current-year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// Header height, used to position the pinned photo reel just below the header
const header = document.querySelector('.site-header');
function setHeaderHeight() {
  if (header) document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
}
setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);

// Photo reel: on desktop, scrolling down the page moves the photos sideways.
// On small screens or with reduced motion, it's a normal swipeable strip.
const reel = document.querySelector('.reel');
if (reel) {
  const viewport = reel.querySelector('.reel-viewport');
  const track = reel.querySelector('.reel-track');
  const pinQuery = window.matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
  let distance = 0;
  let ticking = false;

  const gridPhoto = document.querySelector('.photo-grid .photo');

  const layout = () => {
    setHeaderHeight();
    if (gridPhoto) reel.style.setProperty('--grid-photo-w', gridPhoto.offsetWidth + 'px');
    track.style.transform = '';
    if (pinQuery.matches) {
      reel.classList.add('reel--pinned');
      distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      // Section is tall enough that scrolling through it covers the full sideways distance
      reel.style.height = (reel.querySelector('.reel-pin').offsetHeight + distance) + 'px';
    } else {
      reel.classList.remove('reel--pinned');
      reel.style.height = '';
      distance = 0;
    }
    update();
  };

  const update = () => {
    ticking = false;
    let progress;
    if (reel.classList.contains('reel--pinned')) {
      const pinTop = header ? header.offsetHeight : 0;
      const scrollable = reel.offsetHeight - (window.innerHeight - pinTop);
      progress = scrollable > 0 ? Math.min(1, Math.max(0, (pinTop - reel.getBoundingClientRect().top) / scrollable)) : 0;
      track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
    } else {
      const max = viewport.scrollWidth - viewport.clientWidth;
      progress = max > 0 ? viewport.scrollLeft / max : 0;
    }
    reel.style.setProperty('--reel-progress', progress.toFixed(4));
  };

  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  viewport.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  pinQuery.addEventListener('change', layout);
  layout();
}

// Photo lightbox: click a photo to view it full screen
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lightboxImg = lightbox.querySelector('img');

  document.querySelectorAll('.photo').forEach(button => {
    const img = button.querySelector('img');
    if (!img) return; // placeholder, nothing to open
    button.setAttribute('aria-label', 'View photo: ' + (img.alt || 'photo'));
    button.addEventListener('click', () => {
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      lightbox.showModal();
    });
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });
}
