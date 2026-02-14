// ===== Page Transitions =====
const pages = {
    landing: document.getElementById('landing'),
    gallery: document.getElementById('gallery'),
    closing: document.getElementById('closing')
};

const beginBtn = document.getElementById('begin-btn');
const continueBtn = document.getElementById('continue-btn');
const restartBtn = document.getElementById('restart-btn');

// Flag to block sprinkle regeneration during page transitions
let isTransitioning = false;

// Navigate to gallery
beginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    switchPage('landing', 'gallery');
});

// Navigate to closing
continueBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    switchPage('gallery', 'closing');
});

// Navigate back to landing and reset gallery
restartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

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
    // Set transition flag to block resize-triggered regeneration
    isTransitioning = true;

    // Pause physics when leaving landing page
    if (fromPage === 'landing' && physicsState.initialized) {
        pausePhysics();
    }

    pages[fromPage].classList.remove('active');
    setTimeout(() => {
        pages[toPage].classList.add('active');

        // Resume physics when returning to landing page
        if (toPage === 'landing' && physicsState.initialized) {
            resumePhysics();
        }

        // Scroll to top of the page
        pages[toPage].scrollTop = 0;

        // Regenerate sprinkles for the target page after layout settles
        setTimeout(() => {
            const container = pages[toPage].querySelector('.sprinkles-container');
            if (container) {
                generateSprinkles(container);
            }
            // Clear transition flag after sprinkles are generated
            isTransitioning = false;
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


// ===== Dynamic Sprinkle Generation =====
function generateSprinkles(container) {
    // Get the parent page
    const page = container.closest('.page');
    if (!page) return;

    // Measure using .content sibling to avoid circular reference
    // (the absolutely-positioned sprinkles container contributes to scrollHeight)
    const contentEl = page.querySelector('.content');
    const containerWidth = page.offsetWidth;
    const containerHeight = Math.max(page.clientHeight, contentEl ? contentEl.offsetHeight : page.clientHeight);

    // Skip if dimensions unchanged and sprinkles already exist
    if (container.children.length > 0 &&
        parseInt(container.dataset.w) === containerWidth &&
        parseInt(container.dataset.h) === containerHeight) {
        return;
    }

    container.dataset.w = containerWidth;
    container.dataset.h = containerHeight;
    container.style.height = containerHeight + 'px';

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
        // Skip if currently transitioning between pages
        if (isTransitioning) return;

        // Regenerate sprinkles for active page only (but skip landing page)
        const activePage = document.querySelector('.page.active');
        if (activePage && activePage.id !== 'landing') {
            const container = activePage.querySelector('.sprinkles-container');
            if (container) {
                generateSprinkles(container);
            }
        }

        // Update physics viewport bounds
        if (physicsState.initialized) {
            updateViewportBounds();
        }
    }, 250);
});

// ===== Interactive Shape Physics =====
const FRICTION = 0.985;
const RESTITUTION = 0.6;
const MAX_FLING_VELOCITY = 25;
const IDLE_SPEED = 0.3;
const AMBIENT_DRIFT_FORCE = 0.05;
const HOVER_ANGULAR_VELOCITY = 12;    // degrees per frame (randomized +/-)
const HOVER_PARTICLE_COUNT = 12;       // particles per hover burst
const HOVER_PARTICLE_DURATION = 800;   // ms, matches CSS animation
const HOVER_COOLDOWN = 2500;           // ms, minimum time between hover effects
const COLLISION_SPEED_THRESHOLD = 2;   // minimum collision speed to trigger particles
const COLLISION_COOLDOWN = 800;        // ms, minimum time between collision effects

const physicsState = {
    bodies: [],
    viewportBounds: { width: 0, height: 0 },
    animationId: null,
    isPaused: false,
    initialized: false
};

function updateViewportBounds() {
    const landing = document.getElementById('landing');
    physicsState.viewportBounds.width = landing.offsetWidth;
    physicsState.viewportBounds.height = landing.offsetHeight;
}

function initShapePhysics() {
    const landing = document.getElementById('landing');
    const shapes = landing.querySelectorAll('.floating-shape');

    if (shapes.length === 0 || physicsState.initialized) return;

    // Store viewport bounds
    updateViewportBounds();

    // Convert each shape to a physics body
    shapes.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const landingRect = landing.getBoundingClientRect();

        // Calculate center position relative to landing page
        const width = rect.width;
        const height = rect.height;
        const radius = (width / 2) * 0.75; // Reduce collision radius to better match visual shape

        // Get current position relative to landing page
        const x = rect.left - landingRect.left + radius;
        const y = rect.top - landingRect.top + radius;

        // Add physics-active class (removes CSS positioning, sets top:0 left:0)
        element.classList.add('physics-active');

        // Apply initial transform to maintain visual position
        element.style.transform = `translate(${x - radius}px, ${y - radius}px)`;

        // Create physics body
        const body = {
            element: element,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: radius,
            mass: radius * radius,
            isDragging: false,
            dragOffsetX: 0,
            dragOffsetY: 0,
            pointerHistory: [],
            pointerId: null,
            rotation: 0,
            angularVelocity: 0,
            isHovered: false,
            lastHoverTime: 0,
            lastCollisionTime: 0
        };

        physicsState.bodies.push(body);

        // Attach pointer event handlers
        attachPointerHandlers(body);
    });

    // Run silent physics frames to resolve initial overlaps
    for (let i = 0; i < 20; i++) {
        resolveCollisions();
    }

    // Apply final positions after initial collision resolution
    physicsState.bodies.forEach(body => {
        body.element.style.transform = `translate(${body.x - body.radius}px, ${body.y - body.radius}px)`;
    });

    physicsState.initialized = true;

    // Start physics loop
    startPhysicsLoop();
}

function attachPointerHandlers(body) {
    const element = body.element;

    element.addEventListener('pointerdown', (e) => {
        e.preventDefault();

        // Capture this pointer
        element.setPointerCapture(e.pointerId);

        body.isDragging = true;
        body.pointerId = e.pointerId;
        body.vx = 0;
        body.vy = 0;
        body.pointerHistory = [];

        // Calculate drag offset
        const rect = element.getBoundingClientRect();
        const landing = document.getElementById('landing');
        const landingRect = landing.getBoundingClientRect();

        body.dragOffsetX = (e.clientX - landingRect.left) - body.x;
        body.dragOffsetY = (e.clientY - landingRect.top) - body.y;

        element.classList.add('dragging');
    });

    element.addEventListener('pointermove', (e) => {
        if (!body.isDragging || e.pointerId !== body.pointerId) return;

        e.preventDefault();

        const landing = document.getElementById('landing');
        const landingRect = landing.getBoundingClientRect();

        // Update position
        body.x = (e.clientX - landingRect.left) - body.dragOffsetX;
        body.y = (e.clientY - landingRect.top) - body.dragOffsetY;

        // Record position history for velocity calculation
        body.pointerHistory.push({
            x: body.x,
            y: body.y,
            time: performance.now()
        });

        // Keep only last 5 entries
        if (body.pointerHistory.length > 5) {
            body.pointerHistory.shift();
        }
    });

    const endDrag = (e) => {
        if (!body.isDragging || e.pointerId !== body.pointerId) return;

        body.isDragging = false;
        body.pointerId = null;
        element.classList.remove('dragging');

        // Calculate fling velocity from pointer history
        if (body.pointerHistory.length >= 2) {
            const now = performance.now();
            const lookbackTime = 80; // ms

            // Find oldest point within lookback window
            let oldestIndex = body.pointerHistory.length - 1;
            for (let i = body.pointerHistory.length - 1; i >= 0; i--) {
                if (now - body.pointerHistory[i].time <= lookbackTime) {
                    oldestIndex = i;
                } else {
                    break;
                }
            }

            if (oldestIndex < body.pointerHistory.length - 1) {
                const oldest = body.pointerHistory[oldestIndex];
                const newest = body.pointerHistory[body.pointerHistory.length - 1];
                const dt = (newest.time - oldest.time) / 16.67; // normalize to 60fps frames

                if (dt > 0) {
                    body.vx = (newest.x - oldest.x) / dt;
                    body.vy = (newest.y - oldest.y) / dt;

                    // Cap velocity
                    const speed = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
                    if (speed > MAX_FLING_VELOCITY) {
                        const scale = MAX_FLING_VELOCITY / speed;
                        body.vx *= scale;
                        body.vy *= scale;
                    }
                }
            }
        }

        body.pointerHistory = [];

        if (element.hasPointerCapture(e.pointerId)) {
            element.releasePointerCapture(e.pointerId);
        }
    };

    element.addEventListener('pointerup', endDrag);
    element.addEventListener('pointercancel', endDrag);

    // Hover effects (desktop only)
    element.addEventListener('pointerenter', (e) => {
        // Only trigger on mouse hover, not touch
        if (e.pointerType !== 'mouse') return;

        // Skip if already hovered or being dragged
        if (body.isHovered || body.isDragging) return;

        // Check cooldown - prevent effect from triggering too frequently
        const now = performance.now();
        if (now - body.lastHoverTime < HOVER_COOLDOWN) return;

        body.isHovered = true;
        body.lastHoverTime = now;

        // Apply random angular velocity for wiggle effect
        const direction = Math.random() < 0.5 ? 1 : -1;
        const velocity = (8 + Math.random() * 7) * direction; // 8-15 deg/frame
        body.angularVelocity = velocity;

        // Spawn particle burst
        spawnHoverParticles(body);
    });

    element.addEventListener('pointerleave', (e) => {
        body.isHovered = false;
    });
}

function spawnHoverParticles(body) {
    const landing = document.getElementById('landing');

    // Get the color from the parent shape's path element
    const pathElement = body.element.querySelector('path');
    const shapeColor = pathElement ? pathElement.getAttribute('fill') : '#E8B4A0';

    // Spawn 10-14 particles
    const particleCount = 10 + Math.floor(Math.random() * 5);

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'hover-particle';

        // Use the parent shape's color
        particle.style.backgroundColor = shapeColor;

        // Random position along the border/perimeter of the shape
        const angle = Math.random() * Math.PI * 2; // Random angle in radians
        const startOffsetX = Math.cos(angle) * body.radius;
        const startOffsetY = Math.sin(angle) * body.radius;
        const startX = body.x + startOffsetX;
        const startY = body.y + startOffsetY;

        // Random end position: drift outward + fall downward
        const driftX = (Math.random() - 0.5) * 30;
        const fallY = 40 + Math.random() * 40; // 40-80px downward
        const endX = startX + driftX;
        const endY = startY + fallY;

        // Set CSS custom properties for animation
        particle.style.setProperty('--px', `${startX}px`);
        particle.style.setProperty('--py', `${startY}px`);
        particle.style.setProperty('--px-end', `${endX}px`);
        particle.style.setProperty('--py-end', `${endY}px`);

        // Remove particle after animation completes
        particle.addEventListener('animationend', () => {
            particle.remove();
        });

        landing.appendChild(particle);
    }
}

function spawnCollisionParticles(bodyA, bodyB, collisionX, collisionY) {
    const landing = document.getElementById('landing');
    const now = performance.now();

    // Check cooldown for both bodies
    if (now - bodyA.lastCollisionTime < COLLISION_COOLDOWN) return;
    if (now - bodyB.lastCollisionTime < COLLISION_COOLDOWN) return;

    // Update collision times
    bodyA.lastCollisionTime = now;
    bodyB.lastCollisionTime = now;

    // Get colors from both shapes
    const pathA = bodyA.element.querySelector('path');
    const pathB = bodyB.element.querySelector('path');
    const colorA = pathA ? pathA.getAttribute('fill') : '#E8B4A0';
    const colorB = pathB ? pathB.getAttribute('fill') : '#E8B4A0';

    // Spawn 6-10 particles total (mix of both colors)
    const particleCount = 6 + Math.floor(Math.random() * 5);

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'hover-particle';

        // Alternate between both colors
        const color = i % 2 === 0 ? colorA : colorB;
        particle.style.backgroundColor = color;

        // Start at collision point with small random spread
        const spreadAngle = Math.random() * Math.PI * 2;
        const spreadDist = Math.random() * 15;
        const startX = collisionX + Math.cos(spreadAngle) * spreadDist;
        const startY = collisionY + Math.sin(spreadAngle) * spreadDist;

        // Particles burst outward in all directions
        const burstAngle = Math.random() * Math.PI * 2;
        const burstDist = 30 + Math.random() * 40;
        const endX = startX + Math.cos(burstAngle) * burstDist;
        const endY = startY + Math.sin(burstAngle) * burstDist;

        // Set CSS custom properties for animation
        particle.style.setProperty('--px', `${startX}px`);
        particle.style.setProperty('--py', `${startY}px`);
        particle.style.setProperty('--px-end', `${endX}px`);
        particle.style.setProperty('--py-end', `${endY}px`);

        // Remove particle after animation completes
        particle.addEventListener('animationend', () => {
            particle.remove();
        });

        landing.appendChild(particle);
    }
}

function startPhysicsLoop() {
    let lastTime = performance.now();

    function physicsLoop(currentTime) {
        if (physicsState.isPaused) {
            physicsState.animationId = requestAnimationFrame(physicsLoop);
            return;
        }

        const dt = Math.min((currentTime - lastTime) / 16.67, 2); // cap at 2x normal speed
        lastTime = currentTime;

        // Update non-dragged bodies
        physicsState.bodies.forEach(body => {
            if (body.isDragging) return;

            // Apply friction
            body.vx *= FRICTION;
            body.vy *= FRICTION;

            // Update rotation
            body.rotation += body.angularVelocity * dt;
            body.angularVelocity *= 0.95; // angular friction (decays faster than linear)

            // Ambient drift for slow-moving bodies
            const speed = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
            if (speed < IDLE_SPEED) {
                body.vx += (Math.random() - 0.5) * AMBIENT_DRIFT_FORCE;
                body.vy += (Math.random() - 0.5) * AMBIENT_DRIFT_FORCE;
            }

            // Update position
            body.x += body.vx * dt;
            body.y += body.vy * dt;

            // Wall collisions
            handleWallCollisions(body);
        });

        // Resolve shape-shape collisions
        resolveCollisions();

        // Apply transforms
        physicsState.bodies.forEach(body => {
            const x = body.x - body.radius;
            const y = body.y - body.radius;
            body.element.style.transform = `translate(${x}px, ${y}px) rotate(${body.rotation}deg)`;
        });

        physicsState.animationId = requestAnimationFrame(physicsLoop);
    }

    physicsState.animationId = requestAnimationFrame(physicsLoop);
}

function handleWallCollisions(body) {
    const bounds = physicsState.viewportBounds;

    // Left wall
    if (body.x - body.radius < 0) {
        body.x = body.radius;
        body.vx = Math.abs(body.vx) * RESTITUTION;
    }

    // Right wall
    if (body.x + body.radius > bounds.width) {
        body.x = bounds.width - body.radius;
        body.vx = -Math.abs(body.vx) * RESTITUTION;
    }

    // Top wall
    if (body.y - body.radius < 0) {
        body.y = body.radius;
        body.vy = Math.abs(body.vy) * RESTITUTION;
    }

    // Bottom wall
    if (body.y + body.radius > bounds.height) {
        body.y = bounds.height - body.radius;
        body.vy = -Math.abs(body.vy) * RESTITUTION;
    }
}

function resolveCollisions() {
    const bodies = physicsState.bodies;

    // Check all pairs
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const a = bodies[i];
            const b = bodies[j];

            // Skip if either is being dragged
            if (a.isDragging || b.isDragging) continue;

            // Calculate distance
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distSq = dx * dx + dy * dy;
            const minDist = a.radius + b.radius;
            const minDistSq = minDist * minDist;

            // Check collision
            if (distSq < minDistSq && distSq > 0) {
                const dist = Math.sqrt(distSq);
                const overlap = minDist - dist;

                // Normalize collision vector
                const nx = dx / dist;
                const ny = dy / dist;

                // Separate bodies (proportional to mass)
                const totalMass = a.mass + b.mass;
                const separationA = overlap * (b.mass / totalMass);
                const separationB = overlap * (a.mass / totalMass);

                a.x -= nx * separationA;
                a.y -= ny * separationA;
                b.x += nx * separationB;
                b.y += ny * separationB;

                // Calculate relative velocity
                const dvx = b.vx - a.vx;
                const dvy = b.vy - a.vy;
                const dotProduct = dvx * nx + dvy * ny;

                // Only resolve if bodies are moving toward each other
                if (dotProduct < 0) {
                    // Calculate collision speed (relative velocity magnitude)
                    const collisionSpeed = Math.sqrt(dvx * dvx + dvy * dvy);

                    // Elastic collision impulse
                    const impulse = (2 * dotProduct) / totalMass;

                    a.vx += impulse * b.mass * nx * RESTITUTION;
                    a.vy += impulse * b.mass * ny * RESTITUTION;
                    b.vx -= impulse * a.mass * nx * RESTITUTION;
                    b.vy -= impulse * a.mass * ny * RESTITUTION;

                    // Spawn particles on high-speed collisions
                    if (collisionSpeed > COLLISION_SPEED_THRESHOLD) {
                        // Calculate collision point (between the two shapes)
                        const collisionX = a.x + nx * a.radius;
                        const collisionY = a.y + ny * a.radius;
                        spawnCollisionParticles(a, b, collisionX, collisionY);
                    }
                }
            }
        }
    }
}

function pausePhysics() {
    physicsState.isPaused = true;
}

function resumePhysics() {
    physicsState.isPaused = false;
}

// Initialize physics when DOM is ready
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

    // Initialize shape physics
    initShapePhysics();
});
