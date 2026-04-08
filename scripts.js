
function isLocalStorageAvailable() {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
}

function setScrollState(state) {
  if (isLocalStorageAvailable()) {
    localStorage.setItem("scroll-enabled", state);
  }
}

const masonryLayoutState = new WeakMap();

const PRELOADER_FRAMES = [
  'assets/Preloaders/Tavola disegno 17gel.svg',
  'assets/Preloaders/Tavola disegno 18gel.svg',
  'assets/Preloaders/Tavola disegno 19gel.svg',
  'assets/Preloaders/Tavola disegno 20gel.svg',
  'assets/Preloaders/Tavola disegno 21gel.svg',
  'assets/Preloaders/Tavola disegno 22gel.svg',
  'assets/Preloaders/Tavola disegno 23gel.svg',
  'assets/Preloaders/Tavola disegno 24gel.svg',
  'assets/Preloaders/Tavola disegno 25gel.svg',
  'assets/Preloaders/Tavola disegno 26gel.svg',
  'assets/Preloaders/Tavola disegno 27gel.svg',
  'assets/Preloaders/Tavola disegno 28gel.svg',
  'assets/Preloaders/Tavola disegno 29gel.svg',
  'assets/Preloaders/Tavola disegno 30gel.svg'
];

let preloaderAssetsWarmed = false;
const preloaderImageCache = [];
let preloaderAssetsReadyPromise = null;

function whenImageReady(image) {
  if (!image) return Promise.resolve();

  if (typeof image.decode === 'function') {
    return image.decode().catch(() => {});
  }

  if (image.complete) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
  });
}

function warmPreloaderAssets() {
  if (preloaderAssetsWarmed) return preloaderAssetsReadyPromise;
  preloaderAssetsWarmed = true;

  PRELOADER_FRAMES.forEach((frameSrc) => {
    const frameImage = new Image();
    frameImage.loading = 'eager';
    frameImage.decoding = 'sync';
    frameImage.fetchPriority = 'high';
    frameImage.src = frameSrc;
    preloaderImageCache.push(frameImage);
  });

  preloaderAssetsReadyPromise = Promise.allSettled(
    preloaderImageCache.map((frameImage) => whenImageReady(frameImage))
  );

  return preloaderAssetsReadyPromise;
}

// Start downloading preloader frames as early as possible.
warmPreloaderAssets();

function initializeScroll() {
  document.body.classList.add('no-scroll');
  document.body.style.overflowY = 'hidden';
  setScrollState('hidden');
}

function prepareGalleryImages() {
  const galleryImages = document.querySelectorAll('img');

  galleryImages.forEach((img) => {
    const isPreloaderImage = Boolean(img.closest('#preloader'));

    if (isPreloaderImage) {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'eager');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'sync');
      if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'high');
      return;
    }

    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
  });
}

function updateOpenAccordionHeight(item) {
  if (!item || !item.classList.contains('active')) return;

  const content = item.querySelector('.accordion-content, .content, .contentps');
  if (!content) return;

  content.style.maxHeight = content.scrollHeight + 'px';
}

function scheduleMasonryLayout(masonry, item) {
  if (!masonry) return;

  const existingState = masonryLayoutState.get(masonry);
  if (existingState) {
    existingState.item = item;
    return;
  }

  const state = { item };
  masonryLayoutState.set(masonry, state);

  requestAnimationFrame(() => {
    const latestState = masonryLayoutState.get(masonry) || state;
    masonryLayoutState.delete(masonry);

    masonry.reloadItems();
    masonry.layout();
    updateOpenAccordionHeight(latestState.item);

    requestAnimationFrame(() => {
      masonry.layout();
      updateOpenAccordionHeight(latestState.item);
    });
  });
}

function setAccordionA11yState(button, content, isOpen) {
  if (button) {
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  if (content) {
    content.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }
}

function getMasonryDataFromItem(item) {
  const button = item.querySelector('button[data-masonry-selector]');
  if (!button) return null;

  const masonrySelector = button.dataset.masonrySelector;
  if (!masonrySelector) return null;

  const masonryContainer = item.querySelector(masonrySelector);
  if (!masonryContainer) return null;

  const masonryConfig =
    window.masonrySettings || null;
  const masonryOptions = masonryConfig && masonryConfig[masonrySelector];
  if (!masonryOptions) return null;

  return { button, masonryContainer, masonrySettings: masonryOptions };
}

function bindMasonryImageEvents(masonryContainer, masonry, item) {
  if (masonryContainer.dataset.masonryImageEventsBound === 'true') return;

  const relayout = (event) => {
    if (event.target && event.target.tagName === 'IMG') {
      scheduleMasonryLayout(masonry, item);
    }
  };

  masonryContainer.addEventListener('load', relayout, true);
  masonryContainer.addEventListener('error', relayout, true);

  if (typeof imagesLoaded === 'function') {
    imagesLoaded(masonryContainer).on('progress', () => {
      scheduleMasonryLayout(masonry, item);
    });
    imagesLoaded(masonryContainer).on('always', () => {
      scheduleMasonryLayout(masonry, item);
    });
  }

  masonryContainer.dataset.masonryImageEventsBound = 'true';
}

function ensureMasonryForItem(item) {
  if (typeof Masonry === 'undefined') {
    return null;
  }

  const data = getMasonryDataFromItem(item);
  if (!data) return null;

  const { button, masonryContainer, masonrySettings } = data;
  let masonry = Masonry.data(masonryContainer);

  if (!masonry) {
    masonry = new Masonry(masonryContainer, masonrySettings);
  }

  bindMasonryImageEvents(masonryContainer, masonry, item);
  button.dataset.masonryInit = 'true';

  scheduleMasonryLayout(masonry, item);

  return masonry;
}

function openAccordionItem(item) {
  const content = item.querySelector('.accordion-content, .content, .contentps');
  if (!content) return;

  const masonry = ensureMasonryForItem(item);

  content.addEventListener('transitionend', function handleTransition(e) {
    if (e.propertyName === 'max-height') {
      if (masonry) {
        scheduleMasonryLayout(masonry, item);
      }
      content.removeEventListener('transitionend', handleTransition);
    }
  });

  content.style.maxHeight = content.scrollHeight + 'px';
}

const setupAccordion = () => {
  const accordion = document.querySelector(".accordion");
  if (!accordion) return;

  const buttons = accordion.querySelectorAll("button");
  const contents = accordion.querySelectorAll(".content, .contentps, .accordion-content");
  let currentButton = null;

  buttons.forEach((button, index) => {
    const item = button.parentElement;
    const content = item ? item.querySelector(".content, .contentps, .accordion-content") : null;
    if (!content) return;

    if (!content.id) {
      const itemId = item && item.id ? item.id : `accordion-item-${index + 1}`;
      content.id = `${itemId}-panel`;
    }

    button.setAttribute('aria-controls', content.id);
    content.setAttribute('role', 'region');
    setAccordionA11yState(button, content, false);
  });

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      document.body.style.overflowY = "auto";
      document.body.classList.remove("no-scroll");
      setScrollState("auto");
      
      buttons.forEach((btn) => {
        btn.parentElement.classList.remove("active");
        const btnContent = btn.parentElement.querySelector(".content, .contentps, .accordion-content");
        setAccordionA11yState(btn, btnContent, false);
      });
      contents.forEach((content) => (content.style.maxHeight = "0"));

      if (currentButton === button) {
        currentButton = null;
        return;
      }

      const item = button.parentElement;
      const content = item.querySelector(".content, .contentps, .accordion-content");
      item.classList.add("active");
      setAccordionA11yState(button, content, true);
      openAccordionItem(item);
      currentButton = button;

      setTimeout(() => {
        const elementTop = button.getBoundingClientRect().top + window.scrollY;
        const extraOffset = window.innerHeight * 0.08;
        window.scrollTo({
          top: elementTop - extraOffset,
          behavior: "smooth",
        });
      }, 600);
    });
  });
};

const setupMenu = () => {
  const heroEntry = document.querySelector('#hero-entry');
  const heroEntryImage = document.querySelector('#alb');
  const heroBgName = document.querySelector('#hero-bg-name');
  const goBackWrap = document.querySelector('#go-back-wrap');
  const goBackButton = document.querySelector('#go-back-button');
  const menuItems = document.querySelectorAll("#menu .item");
  if (!heroEntry || !heroEntryImage || !heroBgName || !goBackWrap || !goBackButton) return;
  let menuIsOpen = false;

  const resetAccordionPanels = () => {
    const buttons = document.querySelectorAll('.accordion button');
    const contents = document.querySelectorAll('.accordion .content, .accordion .contentps, .accordion .accordion-content');

    buttons.forEach((btn) => {
      if (!btn.parentElement) return;
      btn.parentElement.classList.remove('active');
      const panel = btn.parentElement.querySelector('.content, .contentps, .accordion-content');
      setAccordionA11yState(btn, panel, false);
    });

    contents.forEach((content) => {
      content.style.maxHeight = '0';
    });
  };

  const setMenuOpenState = (isOpen) => {
    menuIsOpen = isOpen;
    heroEntry.classList.toggle('is-hidden', isOpen);
    goBackWrap.classList.toggle('active', isOpen);
    goBackWrap.style.pointerEvents = 'none';
    goBackWrap.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    goBackButton.style.pointerEvents = isOpen ? 'auto' : 'none';
  };

  if (typeof gsap === 'undefined') {
    heroEntry.style.transform = 'translateY(0)';
    heroBgName.style.opacity = '1';
    document.getElementById('menu').style.top = '110vh';
    menuItems.forEach((item) => {
      item.style.opacity = '0';
    });
    resetAccordionPanels();
    document.body.classList.add('no-scroll');
    document.body.style.overflowY = 'hidden';
    setScrollState('hidden');
    setMenuOpenState(false);

    const openMenuFallback = () => {
      heroEntry.style.transform = 'translateY(-110%)';
      heroBgName.style.opacity = '0';
      document.getElementById('menu').style.top = '15vh';
      menuItems.forEach((item) => {
        item.style.opacity = '1';
      });
      document.body.style.overflowY = 'auto';
      document.body.classList.remove('no-scroll');
      setScrollState('auto');
      setMenuOpenState(true);
    };

    const closeMenuFallback = () => {
      heroEntry.style.transform = 'translateY(0)';
      heroBgName.style.opacity = '1';
      document.getElementById('menu').style.top = '110vh';
      menuItems.forEach((item) => {
        item.style.opacity = '0';
      });
      document.body.classList.add('no-scroll');
      document.body.style.overflowY = 'hidden';
      setScrollState('hidden');
      resetAccordionPanels();
      setMenuOpenState(false);
    };

    heroEntryImage.addEventListener('click', openMenuFallback);

    goBackButton.addEventListener('click', closeMenuFallback);
    return;
  }

  gsap.set(heroEntry, { y: '0%' });
  gsap.set(heroBgName, { opacity: 1 });
  gsap.set(goBackWrap, { y: '-130%', opacity: 0 });
  gsap.set(goBackButton, { pointerEvents: 'none' });
  gsap.set('#menu', { top: '110vh' });
  gsap.set(menuItems, { opacity: 0 });

  const speed = 0.5;
  const tl = gsap.timeline({ paused: true });

  tl.to(heroEntry, { y: '-110%', duration: speed, ease: 'power1.inOut' }, 0);
  tl.to(heroBgName, { opacity: 0, duration: speed * 0.7, ease: 'power1.out' }, 0);
  tl.to('#menu', { top: '15vh', duration: speed, ease: 'power1.inOut' }, 0);
  tl.to(goBackWrap, { y: '0%', opacity: 1, duration: speed, ease: 'power1.inOut' }, speed * 0.4);
  tl.to(menuItems, { opacity: 1, stagger: 0.1 }, `-=${speed / 2}`);

  const openMenu = () => {
    if (tl.isActive() || menuIsOpen) return;
    tl.play();
    document.body.classList.remove('no-scroll');
    document.body.style.overflowY = 'auto';
    setScrollState('auto');
    setMenuOpenState(true);
  };

  const closeTl = gsap.timeline({ paused: true });
  closeTl.to(heroEntry, { y: '0%', duration: speed, ease: 'power1.inOut' }, 0);
  closeTl.to(heroBgName, { opacity: 1, duration: speed * 0.7, ease: 'power1.in' }, 0);
  closeTl.to('#menu', { top: '110vh', duration: speed, ease: 'power1.inOut' }, 0);
  closeTl.to(goBackWrap, { y: '-130%', opacity: 0, duration: speed, ease: 'power1.inOut' }, 0);
  closeTl.to(menuItems, { opacity: 0, duration: speed, ease: 'power1.inOut' }, 0);
  closeTl.eventCallback('onComplete', () => {
    tl.progress(0).pause();
    document.body.classList.add('no-scroll');
    document.body.style.overflowY = 'hidden';
    setScrollState('hidden');
    resetAccordionPanels();
    setMenuOpenState(false);
  });

  const closeMenu = () => {
    if (tl.isActive() || closeTl.isActive()) return;
    closeTl.play(0);
  };

  heroEntryImage.addEventListener('click', openMenu);

  goBackButton.addEventListener('click', closeMenu);

  window.addEventListener('resize', () => {
    if (tl.isActive()) return;
    gsap.set(heroEntry, { y: menuIsOpen ? '-110%' : '0%' });
    gsap.set(heroBgName, { opacity: menuIsOpen ? 0 : 1 });
  });

  resetAccordionPanels();
  document.body.classList.add('no-scroll');
  document.body.style.overflowY = 'hidden';
  setScrollState('hidden');
  setMenuOpenState(false);
};

function setupCustomCursor() {
  const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!supportsFinePointer) return;

  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  document.body.appendChild(cursor);

  const systemCursorZoneSelector = [
    '#preloader'
  ].join(',');

  const clickableSelector = [
    'a',
    'button',
    '[role="button"]',
    'input[type="submit"]',
    'input[type="button"]'
  ].join(',');

  const hasPointerCursor = (element) => {
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      if (getComputedStyle(current).cursor === 'pointer') {
        return true;
      }
      current = current.parentElement;
    }

    return false;
  };

  const isClickableElement = (element) => {
    if (!element || !(element instanceof Element)) return false;
    if (element.closest(clickableSelector)) return true;
    return hasPointerCursor(element);
  };

  const isSystemCursorZone = (element) => {
    if (!element || !(element instanceof Element)) return false;
    return Boolean(element.closest(systemCursorZoneSelector));
  };

  const deactivateCustomCursor = () => {
    document.body.classList.remove('cursor-custom-active');
    cursor.classList.remove('cursor--visible');
    cursor.classList.remove('cursor--active');
  };

  const activateCustomCursor = () => {
    document.body.classList.add('cursor-custom-active');
  };

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let animationFrameId = null;
  let cursorHasPosition = false;

  const renderCursor = () => {
    currentX += (targetX - currentX) * 0.26;
    currentY += (targetY - currentY) * 0.26;

    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

    const isSettled = Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1;
    if (isSettled) {
      animationFrameId = null;
      return;
    }

    animationFrameId = window.requestAnimationFrame(renderCursor);
  };

  const ensureRenderLoop = () => {
    if (animationFrameId !== null) return;
    animationFrameId = window.requestAnimationFrame(renderCursor);
  };

  const moveCursor = (event) => {
    const isOutOfViewport =
      event.clientX < 0 ||
      event.clientY < 0 ||
      event.clientX >= window.innerWidth ||
      event.clientY >= window.innerHeight;

    if (isOutOfViewport) {
      deactivateCustomCursor();
      return;
    }

    if (isSystemCursorZone(event.target)) {
      deactivateCustomCursor();
      return;
    }

    activateCustomCursor();

    targetX = event.clientX;
    targetY = event.clientY;

    if (!cursorHasPosition) {
      currentX = targetX;
      currentY = targetY;
      cursorHasPosition = true;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    } else {
      ensureRenderLoop();
    }

    cursor.classList.add('cursor--visible');
  };

  document.addEventListener('pointermove', moveCursor, { passive: true });
  document.addEventListener('mousemove', moveCursor, { passive: true });

  document.addEventListener('pointerover', (event) => {
    if (isSystemCursorZone(event.target)) {
      deactivateCustomCursor();
      return;
    }

    activateCustomCursor();

    if (isClickableElement(event.target)) {
      cursor.classList.add('cursor--active');
    }
  });

  document.addEventListener('mouseover', (event) => {
    if (isSystemCursorZone(event.target)) {
      deactivateCustomCursor();
      return;
    }

    activateCustomCursor();

    if (isClickableElement(event.target)) {
      cursor.classList.add('cursor--active');
    }
  });

  document.addEventListener('pointerout', (event) => {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget && isClickableElement(relatedTarget)) return;

    if (!isClickableElement(event.target)) return;
    cursor.classList.remove('cursor--active');
  });

  document.addEventListener('mouseout', (event) => {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget && isClickableElement(relatedTarget)) return;

    if (!isClickableElement(event.target)) return;
    cursor.classList.remove('cursor--active');
  });

  document.addEventListener('pointerleave', () => {
    deactivateCustomCursor();
  });

  document.addEventListener('mouseleave', () => {
    deactivateCustomCursor();
  });

  window.addEventListener('mouseout', (event) => {
    if (event.relatedTarget) return;
    deactivateCustomCursor();
  });

  window.addEventListener('blur', () => {
    deactivateCustomCursor();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') {
      deactivateCustomCursor();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeScroll();
  
  prepareGalleryImages();
  setupAccordion();
  setupMenu();
  setupCustomCursor();

  const itemHoverElements = document.querySelectorAll(".item-hover");
  itemHoverElements.forEach((itemHover) => {
    itemHover.addEventListener("mouseenter", () => {
      itemHover.classList.add("highlight");
    });
    itemHover.addEventListener("mouseleave", () => {
      itemHover.classList.remove("highlight");
    });
  });

  console.log("Ciao! Il sito in cui ti trovi l'ho progettato io, non sono un dev ma ho voluto mettermi alla prova e ho imparato molto da questa esperienza");
});

function initPreloader() {
  const preloaderImage = document.getElementById('preloader-sequence-image');
  const preloaderElement = document.getElementById('preloader');
  if (!preloaderImage || !preloaderElement) return;

  const assetsReadyPromise = warmPreloaderAssets() || Promise.resolve();

  document.body.classList.add('loading');

  let preloaderSequence = [];
  let preloaderFrameIndex = 0;
  let preloaderClosed = false;
  let preloaderInterval = null;
  let pageLoaded = document.readyState === 'complete';
  let preloaderFramesReady = false;
  const preloaderStartedAt = Date.now();
  const minDisplayTime = 900;

  const tryHidePreloader = () => {
    if (preloaderClosed) return;
    if (!pageLoaded || !preloaderFramesReady) return;

    const elapsed = Date.now() - preloaderStartedAt;
    if (elapsed < minDisplayTime) {
      setTimeout(tryHidePreloader, minDisplayTime - elapsed);
      return;
    }

    hidePreloader();
  };

  const hidePreloader = () => {
    if (preloaderClosed) return;
    preloaderClosed = true;

    if (preloaderInterval) {
      clearInterval(preloaderInterval);
      preloaderInterval = null;
    }

    document.body.classList.remove('loading');
    preloaderElement.classList.add('fade-out');

    preloaderElement.addEventListener('transitionend', () => {
      preloaderElement.style.display = 'none';
    }, { once: true });

    setTimeout(() => {
      preloaderElement.style.display = 'none';
    }, 800);
  };

  const shuffleFrames = (frames) => {
    const shuffledFrames = [...frames];

    for (let index = shuffledFrames.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledFrames[index], shuffledFrames[randomIndex]] = [shuffledFrames[randomIndex], shuffledFrames[index]];
    }

    return shuffledFrames;
  };

  const buildRandomSequence = (previousFrame) => {
    const randomSequence = shuffleFrames(PRELOADER_FRAMES);

    if (previousFrame && randomSequence[0] === previousFrame && randomSequence.length > 1) {
      [randomSequence[0], randomSequence[1]] = [randomSequence[1], randomSequence[0]];
    }

    return randomSequence;
  };

  preloaderSequence = buildRandomSequence();

  if (preloaderSequence.length > 0) {
    preloaderImage.src = preloaderSequence[0];
  }

  preloaderInterval = setInterval(() => {
    if (PRELOADER_FRAMES.length === 0) {
      return;
    }

    preloaderFrameIndex += 1;

    if (preloaderFrameIndex >= preloaderSequence.length) {
      preloaderSequence = buildRandomSequence(preloaderSequence[preloaderSequence.length - 1]);
      preloaderFrameIndex = 0;
    }

    preloaderImage.src = preloaderSequence[preloaderFrameIndex];
  }, 250);

  assetsReadyPromise.then(() => {
    preloaderFramesReady = true;
    tryHidePreloader();
  });

  if (pageLoaded) {
    tryHidePreloader();
  } else {
    window.addEventListener('load', () => {
      pageLoaded = true;
      tryHidePreloader();
    }, { once: true });
  }

  // Safety fallback in case some browser never resolves decode/load states.
  setTimeout(hidePreloader, 7000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreloader, { once: true });
} else {
  initPreloader();
}

