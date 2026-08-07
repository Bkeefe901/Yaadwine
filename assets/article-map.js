// Loads assets/world-map.svg into any <div class="article-map"> on the page
// and highlights the countries listed in its data-highlight attribute, e.g.
// <div class="article-map" data-highlight="fr,ar"></div>. Kept as its own
// script (not folded into script.js) so pages without a map don't fetch it.
document.addEventListener("DOMContentLoaded", () => {
  const mapEls = document.querySelectorAll(".article-map[data-highlight]");
  if (mapEls.length === 0) return;

  fetch("assets/world-map.svg")
    .then((res) => res.text())
    .then((svgMarkup) => {
      mapEls.forEach((el) => {
        el.innerHTML = svgMarkup;

        const codes = el.dataset.highlight
          .split(",")
          .map((code) => code.trim().toLowerCase())
          .filter(Boolean);

        codes.forEach((code) => {
          const country = el.querySelector(`[id="${code}"]`);
          if (country) country.classList.add("highlighted");
        });
      });
    });
});
