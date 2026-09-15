(() => {
  "use strict";

  // Enable enhanced styles only after JavaScript begins running.
  document.documentElement.classList.add("js");

  const body = document.body;
  const menuButton = document.querySelector("[data-menu-button]");
  const siteNav = document.querySelector("[data-site-nav]");

  // Mobile navigation -------------------------------------------------------
  const closeMenu = () => {
    if (!menuButton || !siteNav) return;
    menuButton.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
    body.classList.remove("menu-open");
  };

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", () => {
      const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(willOpen));
      siteNav.classList.toggle("is-open", willOpen);
      body.classList.toggle("menu-open", willOpen);
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    window.matchMedia("(min-width: 861px)").addEventListener("change", closeMenu);
  }

  // Highlight the link for the page currently being viewed.
  const currentFile = window.location.pathname.split("/").pop()?.toLowerCase() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const linkFile = (link.getAttribute("href") || "").split("/").pop()?.toLowerCase();
    const isCurrent = linkFile === currentFile || (currentFile === "" && linkFile === "index.html");
    if (isCurrent) {
      link.classList.add("is-current");
      link.setAttribute("aria-current", "page");
    }
  });

  // Placeholder links remain visible without navigating away from the site.
  document.querySelectorAll("[data-placeholder-link]").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  // Shared page effects -----------------------------------------------------
  const progressBar = document.querySelector("[data-scroll-progress]");
  const updateScrollProgress = () => {
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    progressBar.style.transform = `scaleX(${progress})`;
  };
  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  const revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Member roster -----------------------------------------------------------
  // Content lives in team-data-v3.js so profile updates do not require HTML edits.
  const data = window.VILTRUMITES_DATA || { members: [], gallery: [] };
  const initialsFor = (name) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const membersGrid = document.querySelector("[data-members-grid]");
  if (membersGrid) {
    membersGrid.innerHTML = data.members
      .map(
        (member, index) => `
          <article class="member-card ${member.owner ? "member-card--owner" : ""}" data-reveal style="--delay: ${index * 45}ms">
            <div class="member-photo ${member.photo ? "has-photo" : ""}">
              ${
                member.photo
                  ? `<img src="${member.photo}" alt="Portrait of ${member.name}" loading="lazy">`
                  : `<span aria-hidden="true">${initialsFor(member.name)}</span><small>PHOTO<br>PLACEHOLDER</small>`
              }
            </div>
            <div class="member-card__body">
              <div class="member-card__labels">
                <span class="tag ${member.owner ? "tag--accent" : ""}">${member.role}</span>
                <span class="tag">${member.division}</span>
              </div>
              <h2>${member.name}</h2>
              <p>${member.bio}</p>
            </div>
          </article>`,
      )
      .join("");

    requestAnimationFrame(() => {
      membersGrid
        .querySelectorAll("[data-reveal]")
        .forEach((item) => item.classList.add("is-visible"));
    });
  }

  // Gallery, filters, and lightbox ------------------------------------------
  const galleryGrid = document.querySelector("[data-gallery-grid]");
  const filterBar = document.querySelector("[data-gallery-filters]");
  const lightbox = document.querySelector("[data-lightbox]");
  let activeGallery = [...data.gallery];
  let lastFocused = null;

  const galleryMarkup = (item, index) => `
    <button class="gallery-card" type="button" data-gallery-index="${index}" aria-label="Open ${item.title} gallery item">
      <span class="gallery-card__media ${item.image ? "has-image" : ""}">
        ${
          item.image
            ? `<img src="${item.image}" alt="${item.alt}" loading="lazy">`
            : `<span class="gallery-placeholder" aria-hidden="true"><span>${String(index + 1).padStart(2, "0")}</span><small>IMAGE PLACEHOLDER</small></span>`
        }
      </span>
      <span class="gallery-card__meta"><span>${item.category}</span><strong>${item.title}</strong></span>
      <span class="gallery-card__open" aria-hidden="true">↗</span>
    </button>`;

  const renderGallery = (category = "All") => {
    if (!galleryGrid) return;
    activeGallery =
      category === "All"
        ? [...data.gallery]
        : data.gallery.filter((item) => item.category === category);
    galleryGrid.innerHTML = activeGallery.map(galleryMarkup).join("");
  };

  // Restore focus after closing the dialog for keyboard accessibility.
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.close();
    lastFocused?.focus();
  };

  const openLightbox = (item, trigger) => {
    if (!lightbox) return;
    lastFocused = trigger;
    const media = lightbox.querySelector("[data-lightbox-media]");
    const category = lightbox.querySelector("[data-lightbox-category]");
    const title = lightbox.querySelector("[data-lightbox-title]");
    if (media) {
      media.innerHTML = item.image
        ? `<img src="${item.image}" alt="${item.alt}">`
        : `<div class="lightbox-placeholder"><span>PHOTO COMING SOON</span><small>Add the image path in js/team-data-v3.js</small></div>`;
    }
    if (category) category.textContent = item.category;
    if (title) title.textContent = item.title;
    lightbox.showModal();
    lightbox.querySelector("[data-lightbox-close]")?.focus();
  };

  if (galleryGrid) {
    renderGallery();
    galleryGrid.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-gallery-index]");
      if (!trigger) return;
      const item = activeGallery[Number(trigger.dataset.galleryIndex)];
      if (item) openLightbox(item, trigger);
    });
  }

  if (filterBar) {
    filterBar.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      filterBar.querySelectorAll("[data-filter]").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      renderGallery(button.dataset.filter);
    });
  }

  if (lightbox) {
    lightbox.querySelector("[data-lightbox-close]")?.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeLightbox();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav?.classList.contains("is-open")) closeMenu();
  });

  // Reveal the completed page after its initial styles and content are ready.
  requestAnimationFrame(() => body.classList.add("is-ready"));
})();
