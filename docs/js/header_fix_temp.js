document.addEventListener("DOMContentLoaded", function () {
  const headerTitle = document.querySelector(".md-header__title");

  if (headerTitle) {
    headerTitle.style.cursor = "pointer";
    headerTitle.addEventListener("click", function () {
      const logoLink = document.querySelector("a.md-header__button.md-logo");
      if (logoLink && logoLink.href) {
        window.location.href = logoLink.href;
      } else {
        window.location.href = location.origin;
      }
    });
  }
});