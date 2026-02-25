(function () {
  const content = window.siteContent || { i18n: {}, clinic: {}, services: [], gallery: [] };
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const langToggleButtons = document.querySelectorAll(".lang-toggle");
  const navLinksContainer = document.querySelector(".nav-links");
  const menuToggle = document.querySelector(".menu-toggle");
  const backToTop = document.getElementById("backToTop");

  const keyPath = (obj, path) => {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
  };

  const getLang = () => localStorage.getItem("clinicLang") || "en";

  const applyClinicBindings = () => {
    document.querySelectorAll("[data-clinic-name]").forEach((el) => {
      el.textContent = content.clinic?.name?.[getLang()] || "Sana Ullah Clinic";
    });

    document.querySelectorAll("[data-clinic-phone]").forEach((el) => {
      el.textContent = content.clinic?.phoneDisplay || "0323-7366386";
    });

    document.querySelectorAll(".call-link").forEach((el) => {
      el.setAttribute("href", `tel:${content.clinic?.phoneLink || "+923237366386"}`);
    });

    document.querySelectorAll("[data-clinic-address]").forEach((el) => {
      el.textContent = content.clinic?.address?.[getLang()] || "Vanike Road, Opp. Akram Tractor Workshop, Hafizabad";
    });

    document.querySelectorAll("[data-clinic-doctor]").forEach((el) => {
      el.textContent = content.clinic?.doctor?.[getLang()] || "Dr. Asher Malik";
    });
  };

  const applyTranslations = () => {
    const lang = getLang();
    const dict = content.i18n || {};

    document.documentElement.lang = lang === "ur" ? "ur" : "en";
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    document.body.classList.toggle("lang-ur", lang === "ur");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = keyPath(dict, key)?.[lang];
      if (value) {
        el.textContent = value;
      }
    });

    langToggleButtons.forEach((button) => {
      button.textContent = lang === "en" ? "اردو" : "EN";
    });

    if (content.i18n?.siteTitle?.[lang]) {
      const pageToken = (document.body.dataset.page || "index").toLowerCase();
      const pages = {
        index: { en: "Home", ur: "ہوم" },
        about: { en: "About", ur: "تعارف" },
        services: { en: "Services", ur: "سروسز" },
        gallery: { en: "Gallery", ur: "گیلری" },
        contact: { en: "Contact", ur: "رابطہ" }
      };
      document.title = `${content.clinic?.name?.[lang] || "Sana Ullah Clinic"} | ${pages[pageToken]?.[lang] || "Home"}`;
    }

    applyClinicBindings();
    renderServiceCards();
    renderGallery();
  };

  const setLang = (lang) => {
    localStorage.setItem("clinicLang", lang);
    applyTranslations();
  };

  langToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = getLang() === "en" ? "ur" : "en";
      setLang(next);
    });
  });

  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener("click", () => {
      navLinksContainer.classList.toggle("active");
      const expanded = navLinksContainer.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", String(expanded));
      menuToggle.innerHTML = expanded
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    document.addEventListener("click", (event) => {
      if (!navLinksContainer.contains(event.target) && !menuToggle.contains(event.target)) {
        navLinksContainer.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });
  }

  const currentPage = (document.body.dataset.page || "index").toLowerCase();
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("data-nav") === currentPage);
  });

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });

    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("visible", window.scrollY > 380);
    });
  }

  const revealNodes = document.querySelectorAll(".reveal");
  if (!prefersReduced && revealNodes.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("revealed"));
  }

  const addStagger = () => {
    const groups = document.querySelectorAll(".stagger-parent");
    if (!groups.length) {
      return;
    }

    groups.forEach((group) => {
      const children = Array.from(group.children);
      children.forEach((child, index) => {
        child.classList.add("stagger-item");
        if (prefersReduced) {
          child.classList.add("revealed");
          return;
        }

        child.style.transitionDelay = `${index * 80}ms`;
      });
    });

    if (prefersReduced) {
      return;
    }

    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            staggerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".stagger-item").forEach((item) => staggerObserver.observe(item));
  };

  const counterNodes = document.querySelectorAll(".stat-number[data-target]");
  if (counterNodes.length && !prefersReduced) {
    const animateCounter = (el) => {
      const target = Number(el.dataset.target || 0);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 80));
      const update = () => {
        current += step;
        if (current >= target) {
          el.textContent = target.toLocaleString();
          return;
        }
        el.textContent = current.toLocaleString();
        requestAnimationFrame(update);
      };
      update();
    };

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counterNodes.forEach((node) => counterObserver.observe(node));
  } else {
    counterNodes.forEach((node) => {
      node.textContent = Number(node.dataset.target || 0).toLocaleString();
    });
  }

  const hero = document.querySelector(".hero-bg");
  if (hero && !prefersReduced) {
    window.addEventListener("scroll", () => {
      const shift = Math.min(80, window.scrollY * 0.12);
      hero.style.transform = `translateY(${shift}px)`;
    });
  }

  const transitionLayer = document.querySelector(".page-transition");
  document.querySelectorAll('a[href$=".html"]').forEach((link) => {
    link.addEventListener("click", () => {
      if (transitionLayer) {
        transitionLayer.classList.add("active");
        setTimeout(() => transitionLayer.classList.remove("active"), 360);
      }
    });
  });

  const renderServiceCards = () => {
    const grids = document.querySelectorAll("#servicesGrid");
    if (!grids.length) {
      return;
    }

    const lang = getLang();
    const cards = (content.services || [])
      .map(
        (service) => `
        <article class="service-card">
          <div class="service-icon"><i class="fa-solid ${service.icon || "fa-stethoscope"}"></i></div>
          <h3>${service[lang] || service.en}</h3>
          <p>${lang === "en" ? "Specialist consultation and personalized treatment guidance." : "اس شعبے میں خصوصی مشاورت اور ذاتی نوعیت کا علاج۔"}</p>
        </article>`
      )
      .join("");

    grids.forEach((grid) => {
      grid.innerHTML = cards;
    });

    addStagger();
  };

  const renderGallery = () => {
    const grid = document.getElementById("galleryGrid");
    if (!grid) {
      return;
    }

    const lang = getLang();
    grid.innerHTML = (content.gallery || [])
      .map((item, idx) => {
        const altText = lang === "en" ? item.altEn : item.altUr;
        return `
          <figure class="gallery-item" data-index="${idx}" tabindex="0" role="button" aria-label="${altText}">
            <img src="${item.src}" alt="${altText}" loading="lazy">
            <span>${altText}</span>
          </figure>`;
      })
      .join("");

    addStagger();

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const close = document.querySelector(".lightbox-close");

    if (!lightbox || !lightboxImg || !close) {
      return;
    }

    const openLightbox = (index) => {
      const data = content.gallery[index];
      if (!data) {
        return;
      }

      lightboxImg.src = data.src;
      lightboxImg.alt = lang === "en" ? data.altEn : data.altUr;
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
    };

    grid.querySelectorAll(".gallery-item").forEach((item) => {
      const index = Number(item.dataset.index);
      item.addEventListener("click", () => openLightbox(index));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove("active");
      lightbox.setAttribute("aria-hidden", "true");
    };

    close.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
    });
  };

  const yearNode = document.getElementById("currentYear");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  applyTranslations();
})();
