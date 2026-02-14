// ===== Page Transitions =====
const pages = {
    landing: document.getElementById('landing'),
    gallery: document.getElementById('gallery'),
    closing: document.getElementById('closing')
};

const beginBtn = document.getElementById('begin-btn');
const continueBtn = document.getElementById('continue-btn');
const restartBtn = document.getElementById('restart-btn');

// Navigate to gallery
beginBtn.addEventListener('click', () => {
    switchPage('landing', 'gallery');
});

// Navigate to closing
continueBtn.addEventListener('click', () => {
    switchPage('gallery', 'closing');
});

// Navigate back to landing and reset gallery
restartBtn.addEventListener('click', () => {
    // Reset all gallery cards to hidden state
    const galleryCards = document.querySelectorAll('.gallery-card');
    galleryCards.forEach(card => {
        card.classList.remove('revealed');
    });

    // Navigate back to landing page
    switchPage('closing', 'landing');
});

// Page transition helper
function switchPage(fromPage, toPage) {
    pages[fromPage].classList.remove('active');
    setTimeout(() => {
        pages[toPage].classList.add('active');

        // Scroll to top of the page
        pages[toPage].scrollTop = 0;

        // Regenerate sprinkles for the target page after layout settles
        setTimeout(() => {
            const container = pages[toPage].querySelector('.sprinkles-container');
            if (container) {
                generateSprinkles(container);
            }
        }, 100);
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

    // Generate sprinkles for active page
    const activePage = document.querySelector('.page.active');
    const container = activePage.querySelector('.sprinkles-container');
    if (container) {
        generateSprinkles(container);
    }
});

// ===== Dynamic Sprinkle Generation =====
function generateSprinkles(container) {
    // Get the parent page
    const page = container.closest('.page');
    if (!page) return;

    // Temporarily hide container to measure content height
    container.style.display = 'none';

    // Measure content height
    const contentHeight = page.scrollHeight;

    // Calculate container dimensions
    const containerWidth = page.offsetWidth;
    const containerHeight = contentHeight;

    // Set container height to match content
    container.style.height = containerHeight + 'px';
    container.style.display = '';

    // Clear existing sprinkles
    container.innerHTML = '';

    // Calculate sprinkle count based on area
    // Landing page uses lower density to keep focus on title and floating shapes
    const area = containerWidth * containerHeight;
    const isLandingPage = page.id === 'landing';
    const density = isLandingPage ? 35000 : 14000;
    const minSprinkles = isLandingPage ? 20 : 50;
    const maxSprinkles = isLandingPage ? 150 : 400;

    let sprinkleCount = Math.round(area / density);
    sprinkleCount = Math.max(minSprinkles, Math.min(maxSprinkles, sprinkleCount));

    // Color palette cycling
    const colors = ['var(--coral)', 'var(--pale-blue)', 'var(--sage-green)', 'var(--lavender)', 'var(--muted-gold)'];

    // Create document fragment for performance
    const fragment = document.createDocumentFragment();

    // Generate sprinkles
    for (let i = 0; i < sprinkleCount; i++) {
        const sprinkle = document.createElement('div');
        sprinkle.className = 'sprinkle';

        // Random position (top 2-98%, left 2-94%)
        const top = 2 + Math.random() * 96;
        const left = 2 + Math.random() * 92;

        // Random rotation (-60 to +70 deg)
        const rotation = -60 + Math.random() * 130;

        // Cycle through colors
        const color = colors[i % colors.length];

        sprinkle.style.background = color;
        sprinkle.style.top = top + '%';
        sprinkle.style.left = left + '%';
        sprinkle.style.transform = `rotate(${rotation}deg)`;

        fragment.appendChild(sprinkle);
    }

    // Append all sprinkles at once
    container.appendChild(fragment);
}

// ===== Debounced Resize Handler =====
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Regenerate sprinkles for all pages with containers
        document.querySelectorAll('.sprinkles-container').forEach(container => {
            generateSprinkles(container);
        });
    }, 250);
});
