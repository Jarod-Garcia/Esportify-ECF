

let slideIndex = 1;
let slideTimer;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Initialisation du diaporama');
    showSlide(slideIndex);
    startAutoSlide();

    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', stopAutoSlide);
        slideshowContainer.addEventListener('mouseleave', startAutoSlide);
    }
});

// Rendre les fonctions globales pour les onclick HTML
window.changeSlide = function(n) {
    showSlide(slideIndex += n);
    resetAutoSlide();
}

window.currentSlide = function(n) {
    showSlide(slideIndex = n);
    resetAutoSlide();
}

function showSlide(n) {
    const slides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');
    
    if (slides.length === 0 || dots.length === 0) {
        console.error('❌ Aucun slide trouvé');
        return;
    }

    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }

    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active');
    }

    slides[slideIndex - 1].classList.add('active');
    dots[slideIndex - 1].classList.add('active');
    
    console.log(`📸 Slide ${slideIndex}/${slides.length} affiché`);
}

function autoSlide() {
    slideIndex++;
    showSlide(slideIndex);
}

function startAutoSlide() {
    stopAutoSlide();
    slideTimer = setInterval(autoSlide, 5000);
    console.log('▶️ Défilement automatique démarré');
}

function stopAutoSlide() {
    if (slideTimer) {
        clearInterval(slideTimer);
        console.log('⏸️ Défilement automatique en pause');
    }
}

function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
});

console.log('✅ Script diaporama chargé');
