/* i18n.js — English default + Spanish translation */
(function () {
  const DICT = {
    en: {
      "brand.tagline": "Idea Connector",
      "nav.home": "Home",
      "nav.resources": "Resources",
      "nav.tutorials": "Tutorials",
      "nav.architecture": "Architecture",
      "nav.speaking": "Speaking",
      "nav.about": "About",
      "search.placeholder": "Search resources...",

      "hero.eyebrow": "// connector · power-platform · community",
      "hero.title": "Idea Connector",
      "hero.subtitle": "Power Platform resources built for the real world.",
      "hero.desc": "Open-source resources, architecture patterns, components and practical examples for Microsoft Power Platform.",
      "hero.cta1": "Explore resources",
      "hero.cta2": "View GitHub",

      "stats.categories": "Categories",
      "stats.patterns": "Architecture patterns",
      "stats.tech": "Technologies covered",
      "stats.oss": "% Open Source",

      "featured.eyebrow": "// open-source · featured",
      "featured.title": "Featured Resources",
      "featured.subtitle": "Build once. Reuse everywhere.",

      "categories.eyebrow": "// technologies · index",
      "categories.title": "Resource Categories",
      "categories.subtitle": "From architecture to implementation.",

      "latest.eyebrow": "// latest · repositories",
      "latest.title": "Latest Resources",
      "latest.subtitle": "Code you can actually use.",

      "arch.eyebrow": "// architecture · production",
      "arch.title": "Built beyond the demo",
      "arch.subtitle": "Patterns I use in real projects.",

      "tutorials.eyebrow": "// tutorials · practical",
      "tutorials.title": "Tutorials",
      "tutorials.subtitle": "Short guides focused on implementation, not demos.",

      "community.eyebrow": "// community · open-source",
      "community.title": "Community & Speaking",
      "community.subtitle": "Sessions, talks and community resources for teams building real solutions.",
      "community.cta1": "Speaking resources",
      "community.cta2": "Read tutorials",

      "about.eyebrow": "// architect · practitioner",
      "about.title": "About",
      "about.subtitle": "Power Platform Architect. Community Speaker. Practical innovator.",

      "cta.eyebrow": "// your turn",
      "cta.title": "Your turn",
      "cta.subtitle": "Take the idea. Improve it. Share it.",
      "cta.explore": "Explore GitHub",
      "cta.contribute": "Contribute",

      "footer.role": "Power Platform Architect · Community Speaker",
      "footer.signature": "// ideas that work in production, not in demos",
      "footer.resources": "Resources",
      "footer.community": "Community",
      "footer.social": "Social",

      "res.choice.desc": "Generic PCF component to render options as color tiles, with no dependency on field names or environment schemas."
    },
    es: {
      "brand.tagline": "Connector de ideas",
      "nav.home": "Inicio",
      "nav.resources": "Recursos",
      "nav.tutorials": "Tutoriales",
      "nav.architecture": "Arquitectura",
      "nav.speaking": "Ponencias",
      "nav.about": "Acerca de",
      "search.placeholder": "Buscar recursos...",

      "hero.eyebrow": "// conector · power-platform · comunidad",
      "hero.title": "Connector de ideas",
      "hero.subtitle": "Recursos de Power Platform hechos para el mundo real.",
      "hero.desc": "Recursos de código abierto, patrones de arquitectura, componentes y ejemplos prácticos para Microsoft Power Platform.",
      "hero.cta1": "Explorar recursos",
      "hero.cta2": "Ver GitHub",

      "stats.categories": "Categorías",
      "stats.patterns": "Patrones de arquitectura",
      "stats.tech": "Tecnologías cubiertas",
      "stats.oss": "% Código abierto",

      "featured.eyebrow": "// código abierto · destacado",
      "featured.title": "Recursos destacados",
      "featured.subtitle": "Créalo una vez. Reutilízalo en todas partes.",

      "categories.eyebrow": "// tecnologías · índice",
      "categories.title": "Categorías de recursos",
      "categories.subtitle": "De la arquitectura a la implementación.",

      "latest.eyebrow": "// recientes · repositorios",
      "latest.title": "Recursos recientes",
      "latest.subtitle": "Código que sí puedes usar.",

      "arch.eyebrow": "// arquitectura · producción",
      "arch.title": "Más allá de la demo",
      "arch.subtitle": "Patrones que uso en proyectos reales.",

      "tutorials.eyebrow": "// tutoriales · prácticos",
      "tutorials.title": "Tutoriales",
      "tutorials.subtitle": "Guías cortas centradas en la implementación, no en demos.",

      "community.eyebrow": "// comunidad · código abierto",
      "community.title": "Comunidad y ponencias",
      "community.subtitle": "Sesiones, charlas y recursos comunitarios para equipos que construyen soluciones reales.",
      "community.cta1": "Recursos de ponencias",
      "community.cta2": "Leer tutoriales",

      "about.eyebrow": "// arquitecto · profesional",
      "about.title": "Acerca de",
      "about.subtitle": "Arquitecto de Power Platform. Ponente en la comunidad. Innovador práctico.",

      "cta.eyebrow": "// tu turno",
      "cta.title": "Tu turno",
      "cta.subtitle": "Toma la idea. Mejórala. Compártela.",
      "cta.explore": "Explorar GitHub",
      "cta.contribute": "Contribuir",

      "footer.role": "Arquitecto de Power Platform · Ponente en la comunidad",
      "footer.signature": "// ideas que funcionan en producción, no en demos",
      "footer.resources": "Recursos",
      "footer.community": "Comunidad",
      "footer.social": "Redes",

      "res.choice.desc": "Componente PCF genérico para representar opciones mediante tarjetas de color, sin dependencias de nombres de campos o esquemas de entorno."
    }
  };

  const STORAGE_KEY = "site-lang";
  const DEFAULT = "en";

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT;
  }

  function apply(lang) {
    const dict = DICT[lang] || DICT[DEFAULT];
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
    // Atributos (placeholder, aria-label, title)
    document.querySelectorAll("[data-i18n-attr]").forEach(el => {
      el.getAttribute("data-i18n-attr").split(",").forEach(pair => {
        const [attr, key] = pair.split(":").map(s => s.trim());
        if (dict[key] != null) el.setAttribute(attr, dict[key]);
      });
    });

    localStorage.setItem(STORAGE_KEY, lang);
    document.querySelectorAll(".lang-switch button").forEach(b => {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
  }

  function buildSwitcher() {
    if (document.querySelector(".lang-switch")) return;
    const nav = document.querySelector(".nav-links") || document.querySelector(".nav-wrap");
    if (!nav) return;
    const wrap = document.createElement("div");
    wrap.className = "lang-switch";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Language");
    ["en", "es"].forEach(l => {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.lang = l;
      b.textContent = l.toUpperCase();
      b.addEventListener("click", () => apply(l));
      wrap.appendChild(b);
    });
    nav.appendChild(wrap);
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildSwitcher();
    apply(getLang());
  });
})();
