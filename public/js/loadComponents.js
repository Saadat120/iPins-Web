// loadComponents.js
export async function loadComponent(selector, path) {
  const container = document.querySelector(selector);
  if (container) {
    const res = await fetch(path);
    const html = await res.text();
    container.innerHTML = html;
  }
}
