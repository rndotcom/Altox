var html = $("html");

$(function () {
  darkMode();
  carousel();
});

function darkMode() {
  function toggleDarkMode(state) {
    if (state) {
      html.addClass("dark-mode");
      localStorage.setItem("alto_dark", true);
    } else {
      html.removeClass("dark-mode");
      localStorage.setItem("alto_dark", false);
    }
  }

  const useDark = window.matchMedia("(prefers-color-scheme: dark)");
  useDark.addEventListener("change", (event) => toggleDarkMode(event.matches));
  $(".toggle-track").on("click", () =>
    toggleDarkMode(!html.hasClass("dark-mode"))
  );
}

function carousel() {
  var carousel = $(".carousel");
  var postImage = carousel.find(".post-image");
  var imageHeight, nav;

  function moveNav() {
    imageHeight = postImage.height();
    if (!nav) {
      nav = carousel.find(".owl-prev, .owl-next");
    }
    nav.css({
      top: imageHeight / 2 + "px",
      opacity: 1,
    });
  }

  carousel.owlCarousel({
    dots: false,
    margin: 28,
    nav: true,
    navText: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22" fill="currentColor"><path d="M20.547 22.107l-6.107-6.107 6.107-6.12-1.88-1.88-8 8 8 8 1.88-1.893z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22" fill="currentColor"><path d="M11.453 22.107l6.107-6.107-6.107-6.12 1.88-1.88 8 8-8 8-1.88-1.893z"></path></svg>',
    ],
    onInitialized: function () {
      moveNav();
      carousel.css("visibility", "visible");
    },
    onResized: function () {
      moveNav();
    },
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 3,
      },
      992: {
        items: 4,
      },
    },
  });
}
