// scripts/include.js

function includeHTML() {
  document.querySelectorAll('[data-include]').forEach(async (el) => {
    const file = el.getAttribute("data-include");
    if (file) {
      try {
        const resp = await fetch(file);
        const html = await resp.text();
        el.innerHTML = html;
      } catch (err) {
        el.innerHTML = "<!-- Include failed -->";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", includeHTML);
