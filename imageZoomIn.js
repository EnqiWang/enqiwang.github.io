document.addEventListener("DOMContentLoaded", () => {

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-image");

    // Select every image except icons/logos if desired
    const images = document.querySelectorAll("img");

    images.forEach(img => {

        img.style.cursor = "zoom-in";

        img.addEventListener("click", () => {
            lightboxImg.src = img.src;
            lightbox.classList.add("active");
        });

        img.addEventListener("contextmenu", e => e.preventDefault());
        img.addEventListener("dragstart", e => e.preventDefault());
    });

    lightbox.addEventListener("click", () => {
        lightbox.classList.remove("active");
    });

    lightboxImg.addEventListener("contextmenu", e => e.preventDefault());
    lightboxImg.addEventListener("dragstart", e => e.preventDefault());

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            lightbox.classList.remove("active");
        }
    });
});