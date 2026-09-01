const siteData = {
  name: "Evan Saran",
  tagline: "AI • ML • Robotics",
  bio: "I am currently a Junior at Northview High School. I have done research at Stanford, Harvard, Yale, CMU, and Georgia Tech. Some of my hobbies are playing soccer and cricket.",
  location: "Johns Creek, Georgia",
  email: "evan.msaran@gmail.com",
  emailUrl: "mailto:evan.msaran@gmail.com",
  linkedinUrl: "https://www.linkedin.com/in/evan-saran-9211653b2/",
  githubUrl: "https://github.com/esaran1"
};

const bindText = (key, value) => {
  document.querySelectorAll(`[data-bind="${key}"]`).forEach((el) => {
    el.textContent = value;
  });
};

const bindHref = (key, value) => {
  document.querySelectorAll(`[data-bind-href="${key}"]`).forEach((el) => {
    el.setAttribute("href", value);
  });
};

const initProfileBindings = () => {
  bindText("name", siteData.name);
  bindText("tagline", siteData.tagline);
  bindText("bio", siteData.bio);
  bindText("location", siteData.location);
  bindText("email", siteData.email);
  bindHref("emailUrl", siteData.emailUrl);
  bindHref("linkedin", siteData.linkedinUrl);
  bindHref("github", siteData.githubUrl);
};

const initMobileNav = () => {
  const toggle = document.getElementById("mobileNavToggle");
  const menu = document.getElementById("mobileNavMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });
};

const initProfileBrandScale = () => {
  const brand = document.querySelector("[data-profile-brand]");
  const hero = document.querySelector("[data-orbital-hero]");
  if (!brand || !hero || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.to(brand, {
    scale: 1,
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=320",
      scrub: true,
      invalidateOnRefresh: true
    }
  });
};

const initBlogFilters = () => {
  const postsList = document.getElementById("postsList");
  if (!postsList) return;

  const postCards = Array.from(postsList.querySelectorAll("[data-post]")).map((card) => {
    const tags = (card.dataset.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
    return {
      element: card,
      title: card.dataset.title || "",
      excerpt: card.dataset.excerpt || "",
      tags
    };
  });

  const searchInput = document.getElementById("searchInput");
  const clearButton = document.getElementById("clearFilters");
  const tagButtons = Array.from(document.querySelectorAll("[data-tag-filter]"));
  const tagBadges = Array.from(document.querySelectorAll("[data-tag-badge]"));
  let activeTag = "all";

  const applyFilters = () => {
    const query = (searchInput?.value || "").toLowerCase().trim();

    postCards.forEach((post) => {
      const haystack = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesTag = activeTag === "all" || post.tags.includes(activeTag);
      post.element.classList.toggle("hidden", !(matchesQuery && matchesTag));
    });
  };

  const setActiveTag = (tag) => {
    activeTag = tag;
    tagButtons.forEach((button) => {
      const isSelected = button.dataset.tagFilter === tag;
      button.setAttribute("aria-selected", String(isSelected));
    });
    applyFilters();
  };

  tagButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTag(button.dataset.tagFilter));
  });

  tagBadges.forEach((badge) => {
    badge.addEventListener("click", () => setActiveTag(badge.dataset.tagBadge));
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      setActiveTag("all");
    });
  }
};

const initFooterYear = () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
};

const initAnimations = () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Hero: fade + slide up with stagger
  const heroColumns = document.querySelectorAll("main > section:first-of-type .container > div");
  if (heroColumns.length) {
    gsap.from(heroColumns, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power2.out",
      delay: 0.1
    });
  }

  // Project items: animate on scroll
  const projectCards = document.querySelectorAll("#projects .project-item");
  if (projectCards.length) {
    gsap.from(projectCards, {
      y: 24,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#projects",
        start: "top 88%",
        toggleActions: "play none none none"
      }
    });
  }

  // Latest post card: animate on scroll
  const latestPostCard = document.querySelector("#latest-post .card");
  if (latestPostCard) {
    gsap.from(latestPostCard, {
      y: 24,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#latest-post",
        start: "top 88%",
        toggleActions: "play none none none"
      }
    });
  }

  // Blog post cards (on blog index): animate on scroll
  const blogPostCards = document.querySelectorAll("#postsList .card");
  if (blogPostCards.length) {
    gsap.from(blogPostCards, {
      y: 24,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#postsList",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });
  }
};

/**
 * Vertical orbital project wheel.
 *
 * A virtual circle is centered beyond the right edge, so its visible left arc
 * reads as a vertical image track. Scroll changes the shared wheel phase; cards
 * remain upright and receive restrained focus treatment near the left anchor.
 */
const initOrbitalHero = () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.innerWidth < 768) return;

  const hero = document.querySelector("[data-orbital-hero]");
  const stage = document.querySelector("[data-orbital-stage]");
  const cards = Array.from(document.querySelectorAll("[data-orbital-card]"));
  const title = document.querySelector("[data-orbital-title]");
  const subtitle = document.querySelector("[data-orbital-subtitle]");
  if (!hero || !stage || cards.length === 0) return;

  gsap.registerPlugin(ScrollTrigger);

  const state = { progress: 0, ambient: 0 };
  let activeIndex = -1;

  const render = () => {
    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;
    const cardWidth = cards[0].offsetWidth;
    const cardHeight = cards[0].offsetHeight;
    const centerX = stageWidth + Math.min(stageWidth * 0.17, 110);
    const centerY = stageHeight * 0.5;
    const radiusX = Math.max(stageWidth * 0.7, cardWidth * 1.35);
    const radiusY = Math.max(stageHeight * 0.46, cardHeight * 1.75);
    const spacing = 0.66;
    const focusAngle = Math.PI;
    // Phase is driven by BOTH scroll (progress) and a continuous ambient drift,
    // so the wheel keeps turning gently on its own even when the user is idle.
    const phase =
      state.progress * spacing * (cards.length - 1) + state.ambient;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const angle = focusAngle + index * spacing - phase;
      const x = centerX + Math.cos(angle) * radiusX - cardWidth / 2;
      const y = centerY + Math.sin(angle) * radiusY - cardHeight / 2;
      const distance = Math.abs(Math.atan2(Math.sin(angle - focusAngle), Math.cos(angle - focusAngle)));
      const focus = Math.max(0, 1 - distance / 1.22);
      const isGraph = card.classList.contains("orbital-card--graph");
      const scale = (0.76 + focus * 0.24) * (isGraph ? 1.12 : 1);
      const brightness = 0.58 + focus * 0.42;
      const saturation = 0.58 + focus * 0.42;
      const blur = (1 - focus) * 2.3;

      gsap.set(card, {
        x,
        y: y + (isGraph ? 18 : 0),
        scale,
        opacity: 0.28 + focus * 0.72,
        zIndex: Math.round(focus * 100),
        filter: `blur(${blur}px) brightness(${brightness}) saturate(${saturation})`
      });

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestIndex !== activeIndex) {
      activeIndex = nearestIndex;
      const active = cards[activeIndex];
      if (title) title.textContent = active.dataset.label || "Selected project";
      if (subtitle) subtitle.textContent = active.dataset.subtitle || "Project preview";
    }
  };

  render();
  gsap.to(state, {
    progress: 1,
    ease: "none",
    onUpdate: render,
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true
    }
  });

  // Continuous ambient drift: the wheel keeps turning gently on its own,
  // seamlessly looping by advancing one card-spacing per cycle. Composed with
  // the scroll phase above, so scrolling still moves through the sequence.
  const spacing = 0.66;
  const ambientTween = gsap.to(state, {
    ambient: `+=${spacing}`,
    duration: 7,
    ease: "none",
    repeat: -1,
    onUpdate: render
  });

  // Pause the drift while the tab is hidden to save resources; resume on return.
  const onVisibility = () => {
    if (document.hidden) ambientTween.pause();
    else ambientTween.resume();
  };
  document.addEventListener("visibilitychange", onVisibility);

  const onResize = () => render();
  window.addEventListener("resize", onResize, { passive: true });
};
window.addEventListener("DOMContentLoaded", () => {
  initProfileBindings();
  initMobileNav();
  initProfileBrandScale();
  initBlogFilters();
  initFooterYear();
  initAnimations();
  initOrbitalHero();
});
