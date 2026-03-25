
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


function getScrollState() {
  if (isLocalStorageAvailable()) {
    return localStorage.getItem("scroll-enabled");
  }
  return null;
}


function setScrollState(state) {
  if (isLocalStorageAvailable()) {
    localStorage.setItem("scroll-enabled", state);
  }
}

const masonryLayoutState = new WeakMap();

function initializeScroll() {
  const savedScroll = getScrollState();
  
  if (!savedScroll) {
    document.body.classList.add("no-scroll");
    document.body.style.overflowY = "hidden";
    setScrollState("hidden");
  } else if (savedScroll === "auto") {
    // Se esplicitamente abilitato, abilita scroll
    document.body.style.overflowY = "auto";
    document.body.classList.remove("no-scroll");
  } else {
    // Default: blocca scroll
    document.body.classList.add("no-scroll");
    document.body.style.overflowY = "hidden";
  }
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

  const masonryConfig = typeof mansonrySettings !== 'undefined'
    ? mansonrySettings
    : window.mansonrySettings;
  const masonrySettings = masonryConfig && masonryConfig[masonrySelector];
  if (!masonrySettings) return null;

  return { button, masonryContainer, masonrySettings };
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

const setupTitle = () => {
  const letter = document.querySelector("#site-title .letter");
  if (!letter) return;
  const letters = ["benvenuta nel", "benvenute nel", "benvenuti nel", "benvenuto nel", "benvenutu nel"];
  let counter = 0;
  setInterval(() => {
    letter.textContent = letters[counter];
    counter++;
    if (counter >= letters.length) counter = 0;
  }, 600);
};

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
        const extraOffset = window.innerWidth * 0.04;
        window.scrollTo({
          top: elementTop - extraOffset,
          behavior: "smooth",
        });
      }, 450);
    });
  });
};

const setupMenu = () => {
  const menuToggle = document.querySelector("#menu-toggle");
  const menuItems = document.querySelectorAll("#menu .item");
  const backgroundLayer = document.querySelector("#background-layer");
  const menuActiveBanner = document.querySelector("#menu-active-banner");

  if (!menuToggle) return;

  gsap.set(menuToggle, { y: window.innerHeight - 200 });
  if (menuActiveBanner) {
    gsap.set(menuActiveBanner, { opacity: 0 });
  }

  const speed = 0.5;
  const menuToggleDelay = 0.5;
  const tl = gsap.timeline({ paused: true });

  tl.to("#site-title", speed, { opacity: "0", ease: "power1.inOut" });
  tl.to("#menu-toggle", speed, { y: "-13vh", ease: "power1" }, speed);
  tl.to(menuItems, { opacity: 1, y: "-95vh", stagger: 0.1 }, `-=${speed / 2}`);

  const toggleBackground = (hide) => {
    if (!backgroundLayer) return;
    if (hide) {
        backgroundLayer.style.opacity = "0";
    } else {
      setTimeout(() => {
        backgroundLayer.style.opacity = "1";
      }, 1200);
    }
  };

  menuToggle.addEventListener("click", (e) => {
    e.preventDefault();
    
    if (tl.isActive()) return;

    const isActive = menuToggle.classList.contains("active");

    if (isActive) {
      tl.reverse();
      toggleBackground(false);
      document.body.classList.add("no-scroll");
      document.body.style.overflowY = "hidden";
      setScrollState("hidden");
    } else {
      tl.play();
      toggleBackground(true);
      document.body.classList.remove("no-scroll");
      document.body.style.overflowY = "auto";
      setScrollState("auto");
    }

    menuToggle.classList.toggle("active");
    if (menuActiveBanner) {
      gsap.to(menuActiveBanner, {
        opacity: menuToggle.classList.contains("active") ? 1 : 0,
        duration: speed,
        delay: 0.5,
        ease: "power1.inOut",
      });
    }

    setTimeout(() => {
      menuToggle.textContent = menuToggle.classList.contains("active") ? "GO BACK!" : "LET'S GO!";
    }, 800);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initializeScroll();
  
  prepareGalleryImages();
  setupTitle();
  setupAccordion();
  setupMenu();
  console.log("Ciao! Il sito in cui ti trovi l'ho progettato io, non sono un dev ma ho voluto mettermi alla prova e ho imparato molto da questa esperienza");
});

window.addEventListener("load", () => {
  const currentScroll = getScrollState();
  if (currentScroll === "auto") {
    document.body.style.overflowY = "auto";
    document.body.classList.remove("no-scroll");
  }
});

const itemHoverElements = document.querySelectorAll(".item-hover");
itemHoverElements.forEach((itemHover) => {
  itemHover.addEventListener("mouseenter", () => {
    itemHover.classList.add("highlight");
  });
  itemHover.addEventListener("mouseleave", () => {
    itemHover.classList.remove("highlight");
  });
});