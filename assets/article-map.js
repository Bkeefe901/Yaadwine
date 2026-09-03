// Loads assets/world-map.svg into any <div class="article-map"> on the page,
// highlights the countries it names, and — if the page asks for it — shows a
// one-line caption when the reader hovers, focuses, or taps a highlighted
// country.
//
// Kept as its own file (not folded into script.js) so pages without a map
// don't pay for the SVG fetch.
//
// Attributes the <div class="article-map"> understands:
//   data-highlight="us,nz"      primary highlight   -> class .highlighted     (wine red)
//   data-highlight-alt="za"     secondary highlight -> class .highlighted-alt (teal)
//   data-tip-us="United States — ..."   per-country caption text (one per code)
//
// If at least one data-tip-* is present, a <p class="article-map-caption"> is
// appended under the map and each tipped country becomes hover/focus/tap
// interactive. Pages with no data-tip-* attributes get the map exactly as
// before — no caption, no listeners.

document.addEventListener("DOMContentLoaded", () => {
  const mapEls = document.querySelectorAll(".article-map");
  if (mapEls.length === 0) return;

  fetch("assets/world-map.svg")
    .then((res) => res.text())
    .then((svgMarkup) => {
      mapEls.forEach((el) => setupMap(el, svgMarkup));
    });
});

function setupMap(el, svgMarkup) {
  // Drop a fresh copy of the map into this container.
  el.innerHTML = svgMarkup;

  // Stop some browsers from giving the <svg> element itself a phantom tab
  // stop; the countries below manage their own focusability.
  const svg = el.querySelector("svg");
  if (svg) svg.setAttribute("focusable", "false");

  // --- 1. Highlight countries -------------------------------------------------
  // Two tiers, so a page can visually separate two kinds of relevance — here,
  // "grapes hit by wildfire smoke" (primary) vs "smoky wine by choice"
  // (secondary). Both are comma-separated ISO 3166-1 alpha-2 codes.
  applyHighlight(el, el.dataset.highlight, "highlighted");
  applyHighlight(el, el.dataset.highlightAlt, "highlighted-alt");

  // --- 2. Gather per-country caption text -----------------------------------
  // The wording lives on the page (data-tip-<code>), not in this shared file,
  // so every article keeps its own voice. Note dataset camel-cases the key:
  // data-tip-us -> el.dataset.tipUs.
  const tips = {};
  Object.keys(el.dataset).forEach((key) => {
    // data-tip-us -> dataset key "tipUs" (always an uppercase letter after
    // "tip"); the regex avoids matching unrelated keys like "tipsy".
    if (/^tip[A-Z]/.test(key)) {
      const code = key.slice(3).toLowerCase(); // "tipUs" -> "us"
      tips[code] = el.dataset[key];
    }
  });

  // No captions requested -> the map is purely decorative, nothing left to do.
  if (Object.keys(tips).length === 0) return;

  // --- 3. Build the caption line ------------------------------------------
  // aria-live so screen readers announce the text as it changes on focus.
  const RESTING_TEXT = "Hover or tap a highlighted region";
  const caption = document.createElement("p");
  caption.className = "article-map-caption";
  caption.setAttribute("aria-live", "polite");
  caption.textContent = RESTING_TEXT;
  el.appendChild(caption);

  const showTip = (country, text) => {
    clearActive(el);
    country.classList.add("tip-active");
    caption.textContent = text;
  };
  const resetTip = () => {
    clearActive(el);
    caption.textContent = RESTING_TEXT;
  };

  // --- 4. Wire each tipped country for hover / focus / tap ----------------
  Object.keys(tips).forEach((code) => {
    const country = el.querySelector(`[id="${code}"]`);
    if (!country) return;
    const text = tips[code];

    // Make it reachable by keyboard and announceable by screen readers.
    // (The tabindex also drives the cursor + focus styles in article-map.css.)
    country.setAttribute("tabindex", "0");
    country.setAttribute("aria-label", text);

    // Desktop pointer + keyboard focus: caption tracks the country, resets
    // when you move away.
    country.addEventListener("mouseenter", () => showTip(country, text));
    country.addEventListener("focus", () => showTip(country, text));
    country.addEventListener("mouseleave", resetTip);
    country.addEventListener("blur", resetTip);

    // Touch has no hover, so a tap toggles the caption on/off — same
    // tap-to-toggle behaviour as the .patois glossary tips in script.js.
    // stopPropagation keeps the document handler below from firing on the
    // same tap and immediately clearing it.
    country.addEventListener("click", (e) => {
      e.stopPropagation();
      if (country.classList.contains("tip-active")) {
        resetTip();
      } else {
        showTip(country, text);
      }
    });
  });

  // A tap/click anywhere else on the page clears the caption.
  document.addEventListener("click", resetTip);
}

// Add `className` to every country whose ISO code appears in `rawCodes`
// (a comma-separated string). Missing/blank attribute -> no-op.
function applyHighlight(el, rawCodes, className) {
  if (!rawCodes) return;
  rawCodes
    .split(",")
    .map((code) => code.trim().toLowerCase())
    .filter(Boolean)
    .forEach((code) => {
      const country = el.querySelector(`[id="${code}"]`);
      if (country) country.classList.add(className);
    });
}

// Only one country is "active" (its caption showing) at a time.
function clearActive(el) {
  el
    .querySelectorAll(".tip-active")
    .forEach((c) => c.classList.remove("tip-active"));
}
