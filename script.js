// ===== Page Transitions =====
const pages = {
    landing: document.getElementById('landing'),
    gallery: document.getElementById('gallery'),
    closing: document.getElementById('closing')
};

const beginBtn = document.getElementById('begin-btn');
const continueBtn = document.getElementById('continue-btn');

// Navigate to gallery
beginBtn.addEventListener('click', () => {
    switchPage('landing', 'gallery');
});

// Navigate to closing
continueBtn.addEventListener('click', () => {
    switchPage('gallery', 'closing');
});

// Page transition helper
function switchPage(fromPage, toPage) {
    pages[fromPage].classList.remove('active');
    setTimeout(() => {
        pages[toPage].classList.add('active');
    }, 100);
}

// ===== Photo Reveal Mechanic =====
const galleryCards = document.querySelectorAll('.gallery-card');

galleryCards.forEach(card => {
    const cardInner = card.querySelector('.card-inner');

    cardInner.addEventListener('click', () => {
        // Only reveal if not already revealed
        if (!card.classList.contains('revealed')) {
            revealPhoto(card);
        }
    });
});

function revealPhoto(card) {
    // Mark as revealed
    card.classList.add('revealed');

    // The CSS animations will handle:
    // 1. Brush strokes drawing (stroke-dashoffset animation)
    // 2. Shape overlay fading out (opacity transition)
}

// ===== Initialize Brush Strokes =====
// Set initial stroke-dasharray and stroke-dashoffset for all brush strokes
document.addEventListener('DOMContentLoaded', () => {
    // Initialize photo gallery brush strokes
    const brushStrokes = document.querySelectorAll('.brush-stroke');
    brushStrokes.forEach(stroke => {
        const length = stroke.getTotalLength();
        stroke.style.strokeDasharray = length;
        stroke.style.strokeDashoffset = length;
    });

    // Initialize title brush strokes
    const titleBrushStrokes = document.querySelectorAll('.title-brush-stroke');
    titleBrushStrokes.forEach(stroke => {
        const length = stroke.getTotalLength();
        stroke.style.strokeDasharray = length;
        stroke.style.strokeDashoffset = length;
    });
});
