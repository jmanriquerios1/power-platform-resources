function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resourceCardTemplate(resource) {
  const tagLabels = new Set();
  const tags = [];

  const addTag = (value) => {
    if (!value) return;

    const label = window.portalCatalog.humanizeTag(value);
    const key = label.toLowerCase();

    if (tagLabels.has(key)) return;

    tagLabels.add(key);
    tags.push(label);
  };

  addTag(resource.language);

  for (const tag of resource.tags) {
    addTag(tag);
  }

  const renderedTags = tags
    .map((item) => `<span class="tag">${escapeHtml(item)}</span>`)
    .join("");

  const releaseLink = resource.release?.url
    ? `<a href="${escapeHtml(window.portalCatalog.resolveUrl(resource.release.url))}" target="_blank" rel="noopener noreferrer">Release</a>`
    : "";

  const documentationLink = resource.documentationUrl
    ? `<a href="${escapeHtml(window.portalCatalog.resolveUrl(resource.documentationUrl))}" target="_blank" rel="noopener noreferrer">Documentation</a>`
    : "";

  return `
    <article class="card">
      <p class="eyebrow">// ${escapeHtml(resource.category.toLowerCase())}</p>
      <h3>${escapeHtml(resource.title)}</h3>
      <p>${escapeHtml(resource.description || "No description available.")}</p>
      <div class="tag-row">${renderedTags}</div>
      <div class="meta-row">
        <span class="meta">★ ${escapeHtml(resource.stars)}</span>
        <span class="meta">updated ${escapeHtml(window.portalCatalog.formatDate(resource.updatedAt))}</span>
        <span class="meta">${escapeHtml(resource.language || "Unknown")}</span>
      </div>
      <div class="card-links">
        <a href="${escapeHtml(window.portalCatalog.resolveUrl(resource.repositoryUrl))}" target="_blank" rel="noopener noreferrer">Source Code</a>
        ${documentationLink}
        ${releaseLink}
      </div>
    </article>
  `;
}

function renderResources(targetId, list) {
  const target = document.getElementById(targetId);
  if (!target) return;

  if (!list.length) {
    target.innerHTML = '<div class="empty-state">No resources published yet for this view.</div>';
    return;
  }

  target.innerHTML = list.map(resourceCardTemplate).join("");
}

function renderCategoryCards(targetId, categories) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = categories
    .map((category) => {
      const count = category.resourceCount ?? 0;

      return `
        <li>
          <a class="category-card-link" href="${escapeHtml(window.portalCatalog.routeForCategory(category.key))}">
            <div class="category-card">
              <strong>${escapeHtml(category.label)}</strong>
              <span class="meta">${count} resource(s)</span>
            </div>
          </a>
        </li>
      `;
    })
    .join("");
}

function renderFilterOptions(selectId, categories) {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = [
    '<option value="all">All categories</option>',
    ...categories.map(
      (category) => `<option value="${escapeHtml(category.key)}">${escapeHtml(category.label)}</option>`
    )
  ].join("");
}

function sortByStars(list) {
  return [...list].sort((left, right) => {
    const byStars = (right.stars || 0) - (left.stars || 0);
    if (byStars !== 0) return byStars;

    const byUpdated = String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
    if (byUpdated !== 0) return byUpdated;

    return String(left.title || "").localeCompare(String(right.title || ""));
  });
}

function initHomePage(catalog) {
  renderResources("featuredResources", sortByStars(catalog.resources).slice(0, 3));
  renderResources("latestResources", catalog.resources.slice(0, 6));
  renderCategoryCards("categoryCards", catalog.categories);
}

function initResourcesPage(catalog) {
  renderFilterOptions("categoryFilter", catalog.categories);
  renderCategoryCards("resourceCategoryCards", catalog.categories);
}

function initPage(catalog) {
  const page = document.body.dataset.page;

  if (page === "home") {
    initHomePage(catalog);
  }

  if (page === "resources") {
    initResourcesPage(catalog);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  (window.resourceCatalogPromise || Promise.resolve({ resources: [], categories: [] }))
    .then(initPage);
});

/* ================================================================
   Interactive enhancements – theme, reveal, stats, copy buttons
   ================================================================ */

(function () {
  "use strict";

  // ── Theme toggle ────────────────────────────────────────────────
  var THEME_KEY = "site-theme";

  function getPreferredTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.getElementById("themeToggle");
    if (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }

  // Apply theme before paint to avoid flicker
  applyTheme(getPreferredTheme());

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(getPreferredTheme());

    var themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") || "light";
        var next = current === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
      });
    }

    // ── Reduced-motion check ──────────────────────────────────────
    var prefersReducedMotion = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

    // ── Reveal-on-scroll ─────────────────────────────────────────
    if (!prefersReducedMotion && "IntersectionObserver" in window) {
      var revealEls = document.querySelectorAll("main > section, main > div");
      if (revealEls.length) {
        revealEls.forEach(function (el) {
          el.classList.add("reveal");
        });
        var revealObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15 });
        revealEls.forEach(function (el) {
          revealObserver.observe(el);
        });
      }
    }

    // ── Stats counter animation ───────────────────────────────────
    function animateCounter(b) {
      var target = parseInt(b.getAttribute("data-target"), 10);
      if (isNaN(target)) return;
      if (prefersReducedMotion) {
        b.textContent = target;
        return;
      }
      var step = Math.max(1, Math.round(target / 40));
      var cur = 0;
      var t = setInterval(function () {
        cur = Math.min(cur + step, target);
        b.textContent = cur;
        if (cur >= target) clearInterval(t);
      }, 25);
    }

    if ("IntersectionObserver" in window) {
      document.querySelectorAll(".stats-bar").forEach(function (bar) {
        var obs = new IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              bar.querySelectorAll("b[data-target]").forEach(animateCounter);
              observer.disconnect();
            }
          });
        }, { threshold: 0.3 });
        obs.observe(bar);
      });
    } else {
      // Fallback: show final values immediately
      document.querySelectorAll(".stats-bar b[data-target]").forEach(function (b) {
        var t = parseInt(b.getAttribute("data-target"), 10);
        if (!isNaN(t)) b.textContent = t;
      });
    }

    // ── Copy buttons for code blocks ─────────────────────────────
    document.querySelectorAll("pre code, pre").forEach(function (block) {
      var pre = block.tagName === "PRE" ? block : block.parentElement;
      if (!pre || pre.tagName !== "PRE") return;
      // Avoid double-wrapping
      if (pre.parentElement && pre.parentElement.classList.contains("code-block-wrapper")) return;

      var wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      var btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.type = "button";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code to clipboard");

      var liveRegion = document.createElement("span");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap";
      wrapper.appendChild(liveRegion);

      btn.addEventListener("click", function () {
        var text = (block.tagName === "CODE" ? block : pre).textContent || "";
        var announce = function (msg, cls) {
          btn.textContent = msg;
          btn.className = "copy-btn " + cls;
          liveRegion.textContent = msg;
          setTimeout(function () {
            btn.textContent = "Copy";
            btn.className = "copy-btn";
            liveRegion.textContent = "";
          }, 2000);
        };

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function () {
            announce("Copied!", "copied");
          }).catch(function () {
            announce("Error", "error");
          });
        } else {
          // Fallback for older browsers
          try {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.style.cssText = "position:fixed;top:-9999px;left:-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            announce("Copied!", "copied");
          } catch (err) {
            announce("Error", "error");
          }
        }
      });

      wrapper.appendChild(btn);
    });
  });
}());
