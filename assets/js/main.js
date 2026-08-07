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
 * Spatial project world.
 *
 * The projects are objects at fixed coordinates in a large 2D artboard. On
 * capable viewports main.js pins the viewport and moves a "camera" (a single
 * translate on the .world element) across BOTH X and Y through a hand-authored
 * path, so scrolling feels like drifting through a spatial exhibition rather
 * than flipping through slides. There is no active slide and no per-object
 * enter/exit choreography: the whole world moves as one.
 *
 * Without JS, on small screens, or under reduced motion, the same markup stays
 * a readable static editorial stack in normal document flow.
 */

// Camera keyframes. `x`/`y` are the world translation (in vw/vh) applied at
// each scroll progress `p`. They are tuned by eye so the camera frames each
// cluster of the artboard in turn: ClearText (top-left) -> VolSurf (lower-left)
// -> Divergent (lower-right) -> Cricket Coach / distant Frost chart (right).
// World object coordinates live in the markup (inline --x / --y vars).
const CAMERA_PATH = [
  { p: 0.0, x: -2, y: 2 },
  { p: 0.22, x: -6, y: -66 },
  { p: 0.46, x: -58, y: -86 },
  { p: 0.72, x: -104, y: -40 },
  { p: 1.0, x: -128, y: 2 }
];

const WORLD_MIN_WIDTH = 700; // below this, keep the static editorial stack

const initWorld = () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const section = document.querySelector("[data-world-scene]");
  if (!section) return;

  const viewport = section.querySelector("[data-world-viewport]");
  const world = section.querySelector("[data-world]");
  const objects = Array.from(section.querySelectorAll("[data-world-object]"));
  if (!viewport || !world || objects.length === 0) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  gsap.registerPlugin(ScrollTrigger);

  let ctx = null; // active gsap.context for the camera build

  const canEnhance = () =>
    !reduceMotion.matches && window.innerWidth >= WORLD_MIN_WIDTH;

  const teardown = () => {
    if (ctx) {
      ctx.revert(); // kills timeline + ScrollTrigger, restores inline styles
      ctx = null;
    }
    section.classList.remove("is-camera");
  };

  const build = () => {
    if (ctx) return;
    section.classList.add("is-camera");

    ctx = gsap.context(() => {
      const vw = () => window.innerWidth / 100;
      const vh = () => window.innerHeight / 100;

      // Total camera travel (world units) drives the scroll length so pacing
      // stays consistent across viewport sizes. No magic vh number.
      const travelX = () =>
        Math.abs(CAMERA_PATH[CAMERA_PATH.length - 1].x - CAMERA_PATH[0].x);
      const pinLength = () =>
        Math.round(Math.max(travelX() * vw() * 1.15, window.innerHeight * 3.2));

      // Start the camera at its first keyframe so the entry frame is composed.
      gsap.set(world, { x: CAMERA_PATH[0].x * vw(), y: CAMERA_PATH[0].y * vh() });

      // ONE primary timeline + trigger drives the whole section: the world
      // camera and the subtle per-object depth parallax all live on it.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: viewport,
          start: "top top",
          end: () => "+=" + pinLength(),
          pin: true,
          pinSpacing: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });

      // Move the whole world through the camera keyframes. Segment durations are
      // proportional to the gaps between keyframe progress values, so the mapping
      // from scroll position to camera position is continuous and even.
      const total = CAMERA_PATH[CAMERA_PATH.length - 1].p - CAMERA_PATH[0].p;
      for (let i = 1; i < CAMERA_PATH.length; i++) {
        const k = CAMERA_PATH[i];
        tl.to(
          world,
          {
            x: () => k.x * vw(),
            y: () => k.y * vh(),
            duration: k.p - CAMERA_PATH[i - 1].p
          },
          CAMERA_PATH[i - 1].p
        );
      }

      // Very subtle depth parallax folded onto the same timeline: near objects
      // drift slightly more than the world, distant ones slightly less. Kept
      // tiny so everything stays anchored to one coherent world.
      objects.forEach((obj) => {
        const depth = parseFloat(obj.style.getPropertyValue("--depth")) || 1;
        const drift = (depth - 1) * 6; // world units, tiny
        if (drift !== 0) {
          tl.fromTo(
            obj,
            { x: 0 },
            { x: () => drift * vw(), duration: total },
            0
          );
        }
      });
    }, section);
  };

  // Wait for the world images so pin measurements are correct, then refresh.
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
    window.setTimeout(settle, 1500); // safety net
  }

  // Rebuild or tear down as the viewport crosses the capability threshold.
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

  // Honor a runtime reduced-motion change.
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
  initWorld();
});
