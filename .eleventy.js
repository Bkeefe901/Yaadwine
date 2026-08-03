module.exports = function (eleventyConfig) {
  // assets/ (css, js, images) are hand-managed, not built — copy as-is.
  eleventyConfig.addPassthroughCopy("assets");

  // Decap CMS's admin UI is a static app shell (index.html + config.yml),
  // not a template — copy it untouched so 11ty doesn't try to render it.
  eleventyConfig.addPassthroughCopy("src/admin");

  // Lets a front-matter field hold raw markdown (e.g. a second content
  // block sandwiched around structured data) and render it inline.
  const md = require("markdown-it")({ html: true });
  eleventyConfig.addFilter("markdownify", (content) => md.render(content || ""));

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
