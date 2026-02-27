const siteData = {
  name: "Evan Saran",
  tagline: "AI • ML • Robotics",
  bio: "I am currently a Sophomore at Northview High School. Some activities that I participate in are Science Olympiad, FRC Robotics, and Science Fair. I enjoy playing soccer and cricket, and also video games.",
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
  const heroColumns = document.querySelectorAll("section.subtle-grid .container > div");
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

  // Project cards: animate on scroll
  const projectCards = document.querySelectorAll("#projects .card");
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

window.addEventListener("DOMContentLoaded", () => {
  initProfileBindings();
  initMobileNav();
  initBlogFilters();
  initFooterYear();
  initAnimations();
});
