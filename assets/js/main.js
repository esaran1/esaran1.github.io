const siteData = {
  name: "Evan Saran",
  tagline: "AI • ML • Robotics",
  bio: "I am currently a Junior at Northview High School. I have done research at Stanford, Harvard, Yale, CMU, and Georgia Tech. Some of my hobbies are playing soccer and cricket.",
  location: "Johns Creek, Georgia",
  email: "evan.msaran@gmail.com",
  emailUrl: "",
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
 * Cinematic project showcase.
 *
 * Progressive enhancement: the markup renders as a static editorial grid by
 * default (that is also the reduced-motion / no-JS / mobile experience). On
 * capable desktop viewports this upgrades the section into a pinned, scroll-
 * scrubbed spatial gallery where cards enter from the right, reach a readable
 * focal point, and recede to the left along varied trajectories.
 *
 * One master GSAP timeline is driven by a single ScrollTrigger, so scroll
 * progress maps directly to composition progress (no per-frame React/DOM work
 * beyond the transforms GSAP applies).
 */

// Deterministic per-card choreography. Values are intentionally varied so the
// composition reads as a designed spatial gallery, not an evenly spaced row.
// lane   : vertical center offset as a fraction of viewport height (-0.5..0.5)
// width  : card width in vw at focus
// scale  : scale multiplier at the focal point
// rotate : tiny tilt in degrees (kept subtle)
// depth  : blur (px) + opacity floor applied while far from focus
// window : [enter, focus, exit] positions along normalized timeline progress
const SHOWCASE_LAYOUT = [
  { lane: -0.17, width: 30, scale: 1.0, rotate: -1.2, blur: 5, window: [0.03, 0.17, 0.38] },
  { lane: 0.18, width: 25, scale: 0.9, rotate: 1.5, blur: 6, window: [0.14, 0.3, 0.5] },
  { lane: -0.08, width: 33, scale: 1.05, rotate: 0.7, blur: 4, window: [0.27, 0.43, 0.62] },
  { lane: 0.2, width: 27, scale: 0.94, rotate: -1.1, blur: 6, window: [0.4, 0.56, 0.74] },
  { lane: -0.14, width: 31, scale: 1.02, rotate: 1.0, blur: 5, window: [0.53, 0.69, 0.86] },
  { lane: 0.12, width: 26, scale: 0.92, rotate: -0.7, blur: 6, window: [0.66, 0.82, 0.96] }
];

const SHOWCASE_MIN_WIDTH = 1024; // below this, keep the static editorial grid

const initShowcase = () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const section = document.querySelector("[data-showcase]");
  if (!section) return;

  const stage = section.querySelector("[data-showcase-stage]");
  const track = section.querySelector("[data-showcase-track]");
  const cards = Array.from(section.querySelectorAll("[data-showcase-card]"));
  if (!stage || !track || cards.length === 0) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  gsap.registerPlugin(ScrollTrigger);

  let ctx = null; // active gsap.context for the cinematic build

  const canEnhance = () =>
    !reduceMotion.matches &&
    finePointer.matches &&
    window.innerWidth >= SHOWCASE_MIN_WIDTH;

  const teardown = () => {
    if (ctx) {
      ctx.revert(); // kills timeline + ScrollTrigger and restores inline styles
      ctx = null;
    }
    section.classList.remove("is-cinematic");
    cards.forEach((card) => card.removeAttribute("style"));
  };

  const build = () => {
    if (ctx) return; // already cinematic
    section.classList.add("is-cinematic");

    ctx = gsap.context(() => {
      const vh = () => window.innerHeight;

      // Scroll length scales with the number of cards and the viewport so the
      // pace stays consistent across screen sizes (no magic vh number).
      const pinLength = () => Math.round((cards.length + 1) * vh() * 0.9);

      // Configure each card's resting geometry from its layout entry.
      cards.forEach((card, i) => {
        const cfg = SHOWCASE_LAYOUT[i % SHOWCASE_LAYOUT.length];
        card.style.setProperty("--card-w", cfg.width + "vw");
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          y: () => cfg.lane * vh(),
          zIndex: 10 + i
        });
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => "+=" + pinLength(),
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });

      // Build one continuous timeline. Each card occupies a normalized window
      // [enter, focus, exit]; windows overlap so several cards are visible at
      // once and each follows a slightly different trajectory.
      cards.forEach((card, i) => {
        const cfg = SHOWCASE_LAYOUT[i % SHOWCASE_LAYOUT.length];
        const [enter, focus, exit] = cfg.window;

        // Travel is expressed in vw so it tracks viewport width on refresh.
        const fromX = () => window.innerWidth * 0.62; // start off to the right
        const toX = () => -window.innerWidth * 0.62; // exit to the left

        tl.fromTo(
          card,
          {
            x: fromX,
            scale: cfg.scale * 0.7,
            rotation: cfg.rotate * 0.4,
            autoAlpha: 0,
            filter: "blur(" + cfg.blur + "px)"
          },
          {
            x: 0,
            scale: cfg.scale,
            rotation: cfg.rotate,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: focus - enter
          },
          enter
        ).to(
          card,
          {
            x: toX,
            scale: cfg.scale * 0.82,
            rotation: cfg.rotate * -0.3,
            autoAlpha: 0,
            filter: "blur(" + Math.min(cfg.blur, 4) + "px)",
            duration: exit - focus
          },
          focus
        );
      });
    }, section);
  };

  // Wait for showcase images so pin measurements are correct, then refresh.
  const imgs = Array.from(section.querySelectorAll("img"));
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    if (canEnhance()) build();
    ScrollTrigger.refresh();
  };
  const pending = imgs.filter((img) => !img.complete);
  if (pending.length === 0) {
    settle();
  } else {
    let left = pending.length;
    const done = () => {
      if (--left <= 0) settle();
    };
    pending.forEach((img) => {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
    // Safety net so we never hang if an image never fires.
    window.setTimeout(settle, 1500);
  }

  // Re-evaluate on resize (debounced): rebuild or tear down as capability
  // crosses the desktop threshold. GSAP's invalidateOnRefresh handles the
  // measurement math within the cinematic state.
  let resizeTimer = null;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (canEnhance()) {
        if (!ctx) build();
        ScrollTrigger.refresh();
      } else {
        teardown();
        ScrollTrigger.refresh();
      }
    }, 200);
  };
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  // If the user switches on reduced-motion at runtime, collapse to static.
  const onMotionPref = () => {
    if (reduceMotion.matches) {
      teardown();
      ScrollTrigger.refresh();
    } else if (canEnhance()) {
      build();
      ScrollTrigger.refresh();
    }
  };
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", onMotionPref);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  initProfileBindings();
  initMobileNav();
  initBlogFilters();
  initFooterYear();
  initAnimations();
  initShowcase();
});
