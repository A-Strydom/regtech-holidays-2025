// Initialize greeting text with individual letters
const greetingMain = document.getElementById('greetingMain');
const text = 'Happy Holidays';

text.split('').forEach((char, index) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.setProperty('--delay', index);
    // Add class to the space between "Happy" and "Holidays" for mobile line break
    if (char === ' ' && index === 5) {
        span.classList.add('mobile-line-break');
    }
    greetingMain.appendChild(span);
});

// Enhanced Snowfall Animation
let snowflakeCount = 0;
const MAX_SNOWFLAKES = 180;

function createSnowflake() {
    // Limit snowflake count for performance
    if (snowflakeCount >= MAX_SNOWFLAKES) {
        return;
    }

    const snowContainer = document.getElementById('snow-container');
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.innerHTML = '❄';
    
    const startX = Math.random() * 100;
    const drift = (Math.random() - 0.5) * 40;
    const duration = Math.random() * 4 + 3;
    const size = Math.random() * 8 + 12;
    const delay = Math.random() * 2;
    
    snowflake.style.left = startX + '%';
    snowflake.style.top = '-20px';
    snowflake.style.animationDuration = duration + 's';
    snowflake.style.animationDelay = delay + 's';
    snowflake.style.fontSize = size + 'px';
    snowflake.style.opacity = '0';
    
    // Add horizontal drift
    snowflake.style.setProperty('--drift', drift + 'px');
    
    snowContainer.appendChild(snowflake);
    snowflakeCount++;

    setTimeout(() => {
        if (snowflake.parentNode) {
            snowflake.remove();
            snowflakeCount--;
        }
    }, (duration + delay) * 1000);
}

// Create initial snowflakes
for (let i = 0; i < 100; i++) {
    setTimeout(() => createSnowflake(), i * 150);
}

// Continue creating snowflakes
setInterval(createSnowflake, 200);

// Enhanced Confetti System
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true, willReadFrequently: false });

// Safari performance optimizations
ctx.imageSmoothingEnabled = false; // Disable for better performance
ctx.imageSmoothingQuality = 'low';

// Detect Safari for additional optimizations
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

function resizeCanvas() {
    // For Safari, use 1:1 pixel ratio for better performance
    const dpr = isSafari ? 1 : (window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (dpr !== 1) {
        ctx.scale(dpr, dpr);
    }
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
}
resizeCanvas();

const confettiParticles = [];

class ConfettiParticle {
    constructor(x, y, type = 'square') {
        this.x = x;
        this.y = y;
        this.type = type;
        // Default velocities (can be overridden for burst effects)
        this.vx = (Math.random() - 0.5) * 12;
        this.vy = (Math.random() - 0.5) * 12 - 8;
        this.size = Math.random() * 8 + 4;
        this.height = this.size * 0.9; // Pre-calculate for square particles (Safari optimization)
        this.color = ['#ff6b6b', '#ffd93d', '#4ecdc4', '#95e1d3', '#f38181', '#aa96da', '#ffffff'][
            Math.floor(Math.random() * 7)
        ];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 30;
        this.gravity = 0.35;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.01;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
        this.life -= this.decay;
        this.vx *= 0.98; // Air resistance
    }

    draw() {
        // Optimize for Safari - batch operations and reduce save/restore
        const alpha = Math.max(0, this.life);
        if (alpha <= 0) return; // Skip invisible particles
        
        // For Safari, skip rotation for squares to improve performance
        const useRotation = !isSafari || this.type !== 'square';
        const rotation = useRotation ? (this.rotation * Math.PI) / 180 : 0;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        
        if (useRotation) {
            ctx.translate(this.x, this.y);
            ctx.rotate(rotation);
        }
        
        if (this.type === 'circle') {
            // Optimized circle drawing - use fillRect for Safari if small
            if (isSafari && this.size < 8) {
                const size = this.size / 2;
                if (useRotation) {
                    ctx.fillRect(-size, -size, size * 2, size * 2);
                } else {
                    ctx.fillRect(this.x - size, this.y - size, size * 2, size * 2);
                }
            } else {
                if (!useRotation) ctx.translate(this.x, this.y);
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.type === 'star') {
            // For Safari, use simple square instead of star
            if (isSafari) {
                const size = this.size / 2;
                if (useRotation) {
                    ctx.fillRect(-size, -size, this.size, this.size);
                } else {
                    ctx.fillRect(this.x - size, this.y - size, this.size, this.size);
                }
            } else {
                // Simplified star - use diamond shape for better performance
                const size = this.size / 2;
                if (!useRotation) ctx.translate(this.x, this.y);
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size * 0.4, 0);
                ctx.lineTo(0, size);
                ctx.lineTo(-size * 0.4, 0);
                ctx.closePath();
                ctx.fill();
            }
        } else {
            // Square/rectangle - use pre-calculated height for consistency
            if (useRotation) {
                ctx.fillRect(-this.size / 2, -this.height / 2, this.size, this.height);
            } else {
                ctx.fillRect(this.x - this.size / 2, this.y - this.height / 2, this.size, this.height);
            }
        }
        
        ctx.restore();
    }
}

function createConfettiBurst(x, y, count = 350) {
    // Create a beautiful circular/spherical burst pattern
    // Adjust count for Safari performance
    const particleCount = isSafari ? 280 : count;
    const dpr = window.devicePixelRatio || 1;
    const adjustedX = x;
    const adjustedY = y;
    
    for (let i = 0; i < particleCount; i++) {
        // Create particles in a circular pattern with random distribution
        const angle = Math.random() * Math.PI * 2; // Random angle for natural distribution
        const radius = Math.random() * 35; // Slightly reduced radius for better performance
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        
        // For Safari, prefer simpler shapes (more squares, fewer stars)
        const rand = Math.random();
        let type = 'square';
        if (isSafari) {
            // Safari: mostly squares, some circles, no stars
            if (rand > 0.85) {
                type = 'circle';
            }
        } else {
            // Chrome: more variety
            if (rand > 0.8) {
                type = 'circle';
            } else if (rand > 0.6) {
                type = 'star';
            }
        }
        
        const particle = new ConfettiParticle(adjustedX + offsetX, adjustedY + offsetY, type);
        // Add initial velocity based on angle for circular burst effect
        const velocity = 7 + Math.random() * 9;
        const angleVariation = angle + (Math.random() - 0.5) * 0.25; // Slight angle variation
        particle.vx = Math.cos(angleVariation) * velocity;
        particle.vy = Math.sin(angleVariation) * velocity - 2.5; // Upward bias for celebration
        // Reduce rotation speed for Safari
        particle.rotationSpeed = isSafari ? (Math.random() - 0.5) * 20 : (Math.random() - 0.5) * 35;
        confettiParticles.push(particle);
    }
}

// Frame throttling for Safari
let lastFrameTime = performance.now();
const targetFPS = isSafari ? 50 : 60;
const frameInterval = 1000 / targetFPS;

function animateConfetti(currentTime) {
    // Throttle frames for Safari
    if (isSafari) {
        const elapsed = currentTime - lastFrameTime;
        if (elapsed < frameInterval) {
            requestAnimationFrame(animateConfetti);
            return;
        }
        lastFrameTime = currentTime;
    }
    
    // Optimize for Safari - use efficient clearing
    const dpr = isSafari ? 1 : (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Batch updates and draws for better performance
    let particlesToRemove = [];
    const maxY = (canvas.height / dpr) + 100;
    const maxX = (canvas.width / dpr) + 100;
    
    // For Safari, update fewer particles per frame if there are many
    const updateStep = isSafari && confettiParticles.length > 200 ? 2 : 1;
    
    for (let i = confettiParticles.length - 1; i >= 0; i -= updateStep) {
        const particle = confettiParticles[i];
        particle.update();
        
        // Check bounds before drawing (Safari optimization)
        if (particle.life <= 0 || particle.y > maxY || particle.x < -100 || particle.x > maxX) {
            particlesToRemove.push(i);
        } else {
            particle.draw();
        }
    }
    
    // Update remaining particles if we skipped some
    if (updateStep > 1) {
        for (let i = confettiParticles.length - 2; i >= 0; i -= updateStep) {
            const particle = confettiParticles[i];
            particle.update();
            if (particle.life <= 0 || particle.y > maxY || particle.x < -100 || particle.x > maxX) {
                particlesToRemove.push(i);
            } else {
                particle.draw();
            }
        }
    }
    
    // Remove dead particles in batch
    particlesToRemove.sort((a, b) => b - a); // Sort descending to avoid index issues
    for (let i = 0; i < particlesToRemove.length; i++) {
        confettiParticles.splice(particlesToRemove[i], 1);
    }

    requestAnimationFrame(animateConfetti);
}

animateConfetti();

// Animation Handler
const sledContainer = document.getElementById('sledContainer');
const presentContainer = document.getElementById('presentContainer');
const resetPresentContainer = document.getElementById('resetPresentContainer');
const motionLines = document.getElementById('motionLines');
const challengeInputContainer = document.getElementById('challengeInputContainer');
const challengeInput = document.getElementById('challengeInput');
const submitChallenge = document.getElementById('submitChallenge');
const challengeTextContainer = document.getElementById('challengeTextContainer');
const challengeText = document.getElementById('challengeText');
const greetingContainer = document.querySelector('.greeting-container');
const sledInstruction = document.getElementById('sledInstruction');
const clickSound = document.getElementById('clickSound');
const soundToggle = document.getElementById('soundToggle');
const soundIcon = soundToggle.querySelector('.sound-icon');

let hasStarted = false;
let isMuted = false;
let soundWasPlaying = false;
let motionLineAnimationFrame = null;
let lastSledPosition = { x: 0, y: 0 };
let challengeActive = false;
let collisionCheckAnimationFrame = null;
let hasSmashed = false;
let lastMotionLineTime = 0;
const MOTION_LINE_INTERVAL = 150; // ms between motion line creation
let motionLineCount = 0;
const MAX_MOTION_LINES = 15;

// AudioContext for mobile compatibility - create once and reuse
let audioContext = null;

// Initialize AudioContext on first user interaction
function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (err) {
            console.log('AudioContext creation failed:', err);
        }
    }
    // Resume if suspended (required for mobile browsers)
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(err => {
            console.log('AudioContext resume failed:', err);
        });
    }
    return audioContext;
}

// Create motion lines behind the sled
function createMotionLine(x, y, angle, length = 150) {
    // Limit motion line count for performance
    if (motionLineCount >= MAX_MOTION_LINES) {
        // Remove oldest line
        const firstLine = motionLines.querySelector('.motion-line');
        if (firstLine) {
            firstLine.remove();
            motionLineCount--;
        }
    }

    const line = document.createElement('div');
    line.className = 'motion-line';
    line.style.left = x + 'px';
    line.style.top = y + 'px';
    line.style.width = length + 'px';
    line.style.transform = `rotate(${angle}deg) translateZ(0)`;
    line.style.willChange = 'transform, opacity';
    motionLines.appendChild(line);
    motionLineCount++;

    setTimeout(() => {
        if (line.parentNode) {
            line.remove();
            motionLineCount--;
        }
    }, 600);
}

function startMotionLines() {
    motionLines.classList.add('active');
    
    // Get initial position
    const initialRect = sledContainer.getBoundingClientRect();
    lastSledPosition = {
        x: initialRect.left + initialRect.width / 2,
        y: initialRect.top + initialRect.height / 2
    };
    
    lastMotionLineTime = performance.now();
    
    // Use requestAnimationFrame for better performance
    function animateMotionLines(timestamp) {
        if (!hasStarted) {
            motionLineAnimationFrame = null;
            return;
        }
        
        // Throttle motion line creation
        if (timestamp - lastMotionLineTime >= MOTION_LINE_INTERVAL) {
            const sledRect = sledContainer.getBoundingClientRect();
            const sledX = sledRect.left + sledRect.width / 2;
            const sledY = sledRect.top + sledRect.height / 2;
            
            // Calculate movement direction
            const dx = sledX - lastSledPosition.x;
            const dy = sledY - lastSledPosition.y;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Create motion lines trailing behind the sled (reduced from 2 to 1)
            const offset = 20;
            const offsetX = Math.cos((angle - 180) * Math.PI / 180) * offset;
            const offsetY = Math.sin((angle - 180) * Math.PI / 180) * offset;
            const lineLength = 120 + Math.random() * 40;
            createMotionLine(sledX + offsetX, sledY + offsetY, angle, lineLength);
            
            lastSledPosition = { x: sledX, y: sledY };
            lastMotionLineTime = timestamp;
        }
        
        motionLineAnimationFrame = requestAnimationFrame(animateMotionLines);
    }
    
    motionLineAnimationFrame = requestAnimationFrame(animateMotionLines);
}

function stopMotionLines() {
    motionLines.classList.remove('active');
    if (motionLineAnimationFrame) {
        cancelAnimationFrame(motionLineAnimationFrame);
        motionLineAnimationFrame = null;
    }
}

// Sound Toggle Handler
soundToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    
    if (isMuted) {
        soundIcon.textContent = '🔇';
        soundToggle.classList.add('muted');
        if (clickSound) {
            // Track if sound was playing before muting
            soundWasPlaying = !clickSound.paused;
            clickSound.pause();
        }
    } else {
        soundIcon.textContent = '🔊';
        soundToggle.classList.remove('muted');
        // Resume playing if animation has started and sound was playing
        if (clickSound && hasStarted && soundWasPlaying) {
            clickSound.volume = 0.8;
            clickSound.play().catch(err => {
                console.log('Audio play failed:', err);
            });
        }
    }
});

function startAnimation() {
    if (hasStarted) return;
    hasStarted = true;

    // Initialize AudioContext on user interaction (required for mobile)
    initAudioContext();

    // Play click sound (only if not muted)
    if (clickSound && !isMuted) {
        clickSound.volume = 0.8; // Set volume (0.0 to 1.0)
        clickSound.currentTime = 0; // Reset to start
        clickSound.play().then(() => {
            soundWasPlaying = true;
        }).catch(err => {
            // Handle autoplay restrictions - user interaction is required
            console.log('Audio play failed:', err);
            soundWasPlaying = false;
        });
    } else {
        soundWasPlaying = false;
    }

    // Hide instruction text
    sledInstruction.classList.add('hidden');

    // Make sled non-clickable and start smooth transition to looping
    sledContainer.classList.add('flying');
    sledContainer.style.pointerEvents = 'none';
    
    // Start looping animation smoothly - slight delay for smooth transition
    setTimeout(() => {
        sledContainer.classList.add('looping');
        startMotionLines();
    }, 100);

    // Show present with message smoothly
    setTimeout(() => {
        presentContainer.classList.add('show');
        setTimeout(() => {
            resetPresentContainer.classList.add('show');
            // Hide greeting and show challenge input after present appears
            greetingContainer.style.opacity = '0';
            greetingContainer.style.pointerEvents = 'none';
            challengeInputContainer.classList.add('show');
        }, 1000);
    }, 600);
}

// Challenge Submission
function submitChallengeHandler() {
    const text = challengeInput.value.trim();
    if (!text) return;

    // Reset position to spawn point and remove any smash state
    challengeTextContainer.style.top = '66%';
    challengeTextContainer.style.transform = 'translateY(-50%)';
    challengeTextContainer.style.webkitTransform = 'translateY(-50%)';
    challengeTextContainer.style.animation = '';
    challengeTextContainer.style.opacity = '';
    challengeTextContainer.style.visibility = '';
    challengeTextContainer.style.pointerEvents = '';
    challengeTextContainer.classList.remove('show', 'smashed');
    
    // Truncate text if longer than 40 characters
    const displayText = text.length > 40 ? text.substring(0, 40) + '...' : text;
    challengeText.textContent = displayText;
    // Force reflow to reset animation
    void challengeTextContainer.offsetWidth;
    challengeTextContainer.classList.add('show');
    // Clear input for next word but keep it visible
    challengeInput.value = '';
    challengeActive = true;
    hasSmashed = false;

    // Start collision detection
    startCollisionDetection();
}

submitChallenge.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event from bubbling to container
    submitChallengeHandler();
});
challengeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        submitChallengeHandler();
    }
});

// Collision Detection (optimized with requestAnimationFrame)
function startCollisionDetection() {
    if (collisionCheckAnimationFrame) {
        cancelAnimationFrame(collisionCheckAnimationFrame);
    }

    let cachedSledRect = null;
    let cachedChallengeRect = null;
    let lastCheckTime = 0;
    const CHECK_INTERVAL = 16; // ~60fps

    function checkCollision(timestamp) {
        if (!challengeActive || hasSmashed || !hasStarted) {
            collisionCheckAnimationFrame = null;
            return;
        }

        // Throttle checks to ~60fps
        if (timestamp - lastCheckTime >= CHECK_INTERVAL) {
            // Cache rects to avoid multiple getBoundingClientRect calls
            cachedSledRect = sledContainer.getBoundingClientRect();
            cachedChallengeRect = challengeTextContainer.getBoundingClientRect();

            // Check if sled overlaps with challenge text
            const sledLeft = cachedSledRect.left;
            const sledRight = cachedSledRect.right;
            const sledTop = cachedSledRect.top;
            const sledBottom = cachedSledRect.bottom;

            const challengeLeft = cachedChallengeRect.left;
            const challengeRight = cachedChallengeRect.right;
            const challengeTop = cachedChallengeRect.top;
            const challengeBottom = cachedChallengeRect.bottom;

            // Collision detection
            if (sledLeft < challengeRight && 
                sledRight > challengeLeft && 
                sledTop < challengeBottom && 
                sledBottom > challengeTop) {
                triggerSmash();
                collisionCheckAnimationFrame = null;
                return;
            }
            
            lastCheckTime = timestamp;
        }

        collisionCheckAnimationFrame = requestAnimationFrame(checkCollision);
    }

    collisionCheckAnimationFrame = requestAnimationFrame(checkCollision);
}

// Generate celebratory sound using Web Audio API
function playCelebratorySound() {
    if (isMuted) return;
    
    // Initialize/resume AudioContext (required for mobile)
    const ctx = initAudioContext();
    if (!ctx) return;
    
    try {
        const duration = 0.3;
        const sampleRate = ctx.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = ctx.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        // Create a celebratory "success" sound with multiple tones
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            // Create a rising chord pattern (major triad)
            const freq1 = 523.25; // C5
            const freq2 = 659.25; // E5
            const freq3 = 783.99; // G5
            
            // Add a rising pitch effect
            const risingFreq = 400 + (t * 200);
            
            // Combine frequencies with envelope
            const envelope = Math.exp(-t * 3); // Exponential decay
            const wave1 = Math.sin(2 * Math.PI * freq1 * t) * envelope * 0.3;
            const wave2 = Math.sin(2 * Math.PI * freq2 * t) * envelope * 0.3;
            const wave3 = Math.sin(2 * Math.PI * freq3 * t) * envelope * 0.2;
            const wave4 = Math.sin(2 * Math.PI * risingFreq * t) * envelope * 0.2;
            
            data[i] = wave1 + wave2 + wave3 + wave4;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
    } catch (err) {
        console.log('Celebratory sound generation failed:', err);
    }
}

function triggerSmash() {
    if (hasSmashed) return;
    hasSmashed = true;

    // Play celebratory smash sound (only if not muted)
    playCelebratorySound();

    // Get collision position
    const challengeRect = challengeTextContainer.getBoundingClientRect();
    const smashX = challengeRect.left + challengeRect.width / 2;
    const smashY = challengeRect.top + challengeRect.height / 2;

    // Create massive circular confetti burst
    createConfettiBurst(smashX, smashY, 400);

    // Immediately stop collision detection
    challengeActive = false;
    if (collisionCheckAnimationFrame) {
        cancelAnimationFrame(collisionCheckAnimationFrame);
        collisionCheckAnimationFrame = null;
    }
    
    // Immediately hide the text completely - stop all animations and make invisible
    challengeTextContainer.classList.remove('show');
    challengeTextContainer.style.animation = 'none';
    challengeTextContainer.style.opacity = '0';
    challengeTextContainer.style.visibility = 'hidden';
    challengeTextContainer.style.pointerEvents = 'none';
    
    setTimeout(() => {
        // Reset position to spawn point (while hidden)
        challengeTextContainer.classList.remove('smashed');
        challengeTextContainer.style.top = '66%';
        challengeTextContainer.style.transform = 'translateY(-50%)';
        challengeTextContainer.style.webkitTransform = 'translateY(-50%)';
        challengeTextContainer.style.visibility = '';
        hasSmashed = false;
    }, 500);
}

function resetAnimation() {
    hasStarted = false;
    stopMotionLines();
    
    // Stop sound
    if (clickSound) {
        clickSound.pause();
        clickSound.currentTime = 0;
        soundWasPlaying = false;
    }
    
    // Reset sled container - stop looping and return to center
    sledContainer.classList.remove('looping', 'flying');
    sledContainer.style.pointerEvents = 'auto';
    sledContainer.style.left = '50%';
    sledContainer.style.top = '50%';
    // Reset transform to center position (for Safari compatibility)
    sledContainer.style.transform = 'translate3d(-50%, -50%, 0)';
    
    // Hide present
    presentContainer.classList.remove('show');
    
    // Hide reset button
    resetPresentContainer.classList.remove('show');
    
    // Reset challenge state
    challengeActive = false;
    hasSmashed = false;
    challengeInput.value = '';
    challengeInputContainer.classList.remove('show');
    challengeTextContainer.classList.remove('show', 'smashed');
    challengeTextContainer.style.animation = '';
    challengeTextContainer.style.opacity = '';
    challengeTextContainer.style.visibility = '';
    challengeTextContainer.style.pointerEvents = '';
    challengeTextContainer.style.top = '66%'; // Reset to initial spawn position
    challengeTextContainer.style.transform = 'translateY(-50%)';
    challengeTextContainer.style.webkitTransform = 'translateY(-50%)';
    if (collisionCheckAnimationFrame) {
        cancelAnimationFrame(collisionCheckAnimationFrame);
        collisionCheckAnimationFrame = null;
    }
    
    // Show greeting again
    greetingContainer.style.opacity = '1';
    greetingContainer.style.pointerEvents = 'auto';
    
    // Show instruction text again
    sledInstruction.classList.remove('hidden');
    
    // Clear motion lines
    motionLines.innerHTML = '';
    
    // Force reflow to restart animations
    void sledContainer.offsetWidth;
    void presentContainer.offsetWidth;
}

// Initialize AudioContext on any user interaction (for mobile compatibility)
function initAudioOnInteraction() {
    initAudioContext();
    // Remove listeners after first interaction
    document.removeEventListener('touchstart', initAudioOnInteraction);
    document.removeEventListener('click', initAudioOnInteraction);
}

// Set up early audio initialization for mobile
document.addEventListener('touchstart', initAudioOnInteraction, { once: true });
document.addEventListener('click', initAudioOnInteraction, { once: true });

sledContainer.addEventListener('click', startAnimation);
const resetButton = resetPresentContainer.querySelector('.reset-button');
resetButton.addEventListener('click', resetAnimation);

// Allow Enter key to start animation from initial screen
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !hasStarted) {
        e.preventDefault();
        startAnimation();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
});

