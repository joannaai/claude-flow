const posts = [
    {
        id: 1,
        title: "Mastering JavaScript Async/Await",
        date: "2026-05-18",
        category: "JavaScript",
        tags: ["javascript", "async", "promises"],
        excerpt: "Learn how to write cleaner asynchronous code with async/await patterns. Say goodbye to callback hell.",
        content: "Async/await is one of the most powerful features in modern JavaScript. It allows you to write asynchronous code that looks and behaves like synchronous code. In this deep dive, we'll explore error handling, performance considerations, and real-world patterns for handling concurrent operations. You'll learn how async/await works under the hood and how to avoid common pitfalls.",
        readTime: "8 min"
    },
    {
        id: 2,
        title: "CSS Grid Layout: Complete Guide",
        date: "2026-05-16",
        category: "CSS",
        tags: ["css", "layout", "grid"],
        excerpt: "Master CSS Grid with practical examples. Create complex responsive layouts effortlessly.",
        content: "CSS Grid is a powerful layout system that allows you to create two-dimensional layouts with ease. Unlike Flexbox which is one-dimensional, Grid gives you control over both rows and columns. This guide covers grid basics, template areas, auto-placement, and how to combine Grid with media queries for responsive designs. Learn through interactive examples and real-world use cases.",
        readTime: "12 min"
    },
    {
        id: 3,
        title: "React Hooks: useState and useEffect",
        date: "2026-05-14",
        category: "React",
        tags: ["react", "hooks", "state"],
        excerpt: "Understand the fundamentals of React Hooks and how they revolutionized functional components.",
        content: "React Hooks introduced a new way to write components using functions instead of classes. The useState hook lets you add state to functional components, while useEffect handles side effects. In this tutorial, we'll build practical examples from simple counters to complex data fetching patterns. You'll understand the dependency array, cleanup functions, and when to use each hook.",
        readTime: "10 min"
    },
    {
        id: 4,
        title: "Web Performance Optimization Tips",
        date: "2026-05-12",
        category: "Web",
        tags: ["performance", "optimization", "web"],
        excerpt: "Boost your website speed with these essential performance optimization techniques.",
        content: "Website performance directly impacts user experience and SEO rankings. Learn about critical rendering path, lazy loading, code splitting, image optimization, and caching strategies. This comprehensive guide covers both technical optimizations and practical tools for measuring performance. Discover how to use Lighthouse, WebPageTest, and Chrome DevTools effectively.",
        readTime: "15 min"
    },
    {
        id: 5,
        title: "Building Responsive Websites",
        date: "2026-05-10",
        category: "Web",
        tags: ["responsive", "mobile", "css"],
        excerpt: "Create websites that look perfect on every device. Master responsive design principles.",
        content: "Responsive web design is no longer optional—it's essential. Learn the mobile-first approach, media queries, flexible layouts, and flexible images. This guide covers viewport meta tags, flexible grids, breakpoints strategies, and testing on real devices. You'll build a responsive portfolio site from scratch and understand the tools that help validate responsive behavior.",
        readTime: "11 min"
    },
    {
        id: 6,
        title: "JavaScript Array Methods Deep Dive",
        date: "2026-05-08",
        category: "JavaScript",
        tags: ["javascript", "arrays", "methods"],
        excerpt: "Explore 20+ essential array methods and when to use each one in your projects.",
        content: "Array methods are the backbone of JavaScript programming. From classics like map and filter to newer additions like flatMap and at, each method solves specific problems. This deep dive covers performance implications, method chaining, and practical patterns. You'll see real-world examples for data transformation, filtering, searching, and combining arrays effectively.",
        readTime: "14 min"
    },
    {
        id: 7,
        title: "Understanding CSS Flexbox",
        date: "2026-05-05",
        category: "CSS",
        tags: ["css", "flexbox", "layout"],
        excerpt: "Flexbox simplified: Learn one-dimensional layout with flex containers and items.",
        content: "Flexbox revolutionized one-dimensional layout on the web. Learn flex containers, flex items, main axis, cross axis, and alignment properties. This guide includes interactive demos for justify-content, align-items, flex-wrap, and flex-grow. You'll understand when to use Flexbox over Grid and master responsive navigation bars and card layouts.",
        readTime: "9 min"
    },
    {
        id: 8,
        title: "Introduction to Web Components",
        date: "2026-05-02",
        category: "Web",
        tags: ["web-components", "javascript", "custom-elements"],
        excerpt: "Build reusable, encapsulated components using the Web Components standard.",
        content: "Web Components provide a standard way to create reusable custom elements. Learn about Custom Elements, Shadow DOM, and HTML Templates. Build a custom button component from scratch and explore how to manage styles and content encapsulation. This guide shows how Web Components compare to frameworks and when they're the best choice.",
        readTime: "13 min"
    }
];

let currentFilter = "all";
let currentSearch = "";

function calculateReadTime(content) {
    const wordsPerMinute = 200;
    const words = content.split(" ").length;
    return Math.ceil(words / wordsPerMinute);
}

function renderPosts() {
    const container = document.getElementById("posts-container");
    const noResults = document.getElementById("no-results");
    container.innerHTML = "";

    let filtered = posts;

    if (currentSearch) {
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }

    if (currentFilter !== "all") {
        filtered = filtered.filter(post =>
            post.tags.includes(currentFilter.toLowerCase())
        );
    }

    if (filtered.length === 0) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    filtered.forEach(post => {
        const postEl = document.createElement("article");
        postEl.className = "post-item";
        postEl.innerHTML = `
            <div class="post-header">
                <h3 class="post-title">${post.title}</h3>
                <span class="post-date">${post.date}</span>
            </div>
            <div class="post-meta">
                <span class="post-category">${post.category}</span>
                <span class="read-time">📖 ${post.readTime}</span>
            </div>
            <p class="post-excerpt">${post.excerpt}</p>
            <div class="post-tags">
                ${post.tags.map(tag => `<span class="badge">#${tag}</span>`).join("")}
            </div>
        `;
        postEl.addEventListener("click", () => openPost(post));
        container.appendChild(postEl);
    });
}

function openPost(post) {
    const modal = document.getElementById("post-modal");
    const modalBody = document.getElementById("modal-body");

    const relatedPosts = posts.filter(p =>
        p.id !== post.id &&
        p.tags.some(tag => post.tags.includes(tag))
    ).slice(0, 3);

    modalBody.innerHTML = `
        <h2>${post.title}</h2>
        <div class="modal-meta">
            <span>${post.date}</span>
            <span>•</span>
            <span>${post.readTime}</span>
            <span>•</span>
            <span>${post.category}</span>
        </div>
        <div class="modal-tags">
            ${post.tags.map(tag => `<span class="badge">#${tag}</span>`).join("")}
        </div>
        <div class="modal-content-text">
            <p>${post.content}</p>
        </div>
        ${relatedPosts.length > 0 ? `
            <div class="related-posts">
                <h4>Related Posts</h4>
                ${relatedPosts.map(p => `
                    <div class="related-item" onclick="searchTag('${p.tags[0]}')">${p.title}</div>
                `).join("")}
            </div>
        ` : ""}
    `;

    modal.style.display = "flex";
}

function closePost() {
    document.getElementById("post-modal").style.display = "none";
}

function searchTag(tag) {
    currentSearch = "";
    currentFilter = tag;
    updateFilterButtons(tag);
    renderPosts();
    closePost();
    document.querySelector('a[data-section="blog"]').click();
}

function updateFilterButtons(activeTag) {
    document.querySelectorAll(".tag-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.tag === activeTag) {
            btn.classList.add("active");
        }
    });
}

function renderArchives() {
    const container = document.getElementById("archives-container");
    container.innerHTML = "";

    const grouped = {};
    posts.forEach(post => {
        const [year, month] = post.date.split("-");
        const monthName = new Date(`${year}-${month}-01`).toLocaleString("default", {
            year: "numeric",
            month: "long"
        });

        if (!grouped[monthName]) {
            grouped[monthName] = [];
        }
        grouped[monthName].push(post);
    });

    Object.entries(grouped).forEach(([month, monthPosts]) => {
        const archiveMonth = document.createElement("div");
        archiveMonth.className = "archive-month";
        archiveMonth.innerHTML = `
            <h3>${month}</h3>
            ${monthPosts.map(post => `
                <div class="archive-post" onclick="openPost(posts[${posts.indexOf(post)}])">
                    <span>${post.title}</span>
                    <span>${post.readTime}</span>
                </div>
            `).join("")}
        `;
        container.appendChild(archiveMonth);
    });
}

function setupNavigation() {
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            const section = tab.dataset.section;

            document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
            document.getElementById(section).classList.add("active");

            if (section === "archives") {
                renderArchives();
            } else if (section === "houses") {
                loadHouses();
            }
        });
    });
}

function setupFilters() {
    document.querySelectorAll(".tag-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            currentFilter = btn.dataset.tag;
            updateFilterButtons(currentFilter);
            renderPosts();
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", (e) => {
        currentSearch = e.target.value;
        currentFilter = "all";
        updateFilterButtons("all");
        renderPosts();
    });
}

function setupTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    const isDark = localStorage.getItem("darkMode") === "true";

    if (isDark) {
        document.body.classList.add("dark-mode");
    }

    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isNowDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isNowDark);
    });
}

function setupModal() {
    const modal = document.getElementById("post-modal");
    const closeBtn = document.querySelector(".modal-close");

    closeBtn.addEventListener("click", closePost);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closePost();
    });
}

function setupContactForm() {
    const form = document.getElementById("contact-form");
    const clearBtn = document.getElementById("clear-btn");
    const downloadBtn = document.getElementById("download-btn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("contact-name").value;
        const email = document.getElementById("contact-email").value;
        const subject = document.getElementById("contact-subject").value;
        const message = document.getElementById("contact-message").value;

        try {
            const response = await fetch('/api/submit-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message })
            });

            if (response.ok) {
                alert("Thank you! Your message has been saved.");
                form.reset();
                renderSubmissions();
            } else {
                alert("Error saving submission. Please try again.");
            }
        } catch (error) {
            alert("Error: Could not connect to server. Make sure it's running!");
        }
    });

    clearBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete all submissions?")) {
            try {
                const response = await fetch('/api/clear-submissions', { method: 'POST' });
                if (response.ok) {
                    renderSubmissions();
                    alert("All submissions cleared.");
                }
            } catch (error) {
                alert("Error clearing submissions.");
            }
        }
    });

    downloadBtn.addEventListener("click", async () => {
        try {
            const response = await fetch('/api/submissions');
            const submissions = await response.json();

            if (submissions.length === 0) {
                alert("No submissions to download.");
                return;
            }

            let text = "CONTACT FORM SUBMISSIONS\n";
            text += "========================\n\n";

            submissions.forEach((sub, index) => {
                text += `Submission #${index + 1}\n`;
                text += `Date: ${sub.timestamp}\n`;
                text += `Name: ${sub.name}\n`;
                text += `Email: ${sub.email}\n`;
                text += `Subject: ${sub.subject}\n`;
                text += `Message:\n${sub.message}\n`;
                text += "\n" + "=".repeat(50) + "\n\n";
            });

            const blob = new Blob([text], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `submissions_${new Date().toISOString().split("T")[0]}.txt`;
            a.click();
        } catch (error) {
            alert("Error downloading submissions.");
        }
    });

    renderSubmissions();
}

async function renderSubmissions() {
    try {
        const response = await fetch('/api/submissions');
        const submissions = await response.json();
        const container = document.getElementById("submissions-list");
        const noSubmissions = document.getElementById("no-submissions");

        container.innerHTML = "";

        if (submissions.length === 0) {
            noSubmissions.style.display = "block";
            return;
        }

        noSubmissions.style.display = "none";

        submissions.forEach((sub, index) => {
            const subEl = document.createElement("div");
            subEl.className = "submission-item";
            subEl.style.cssText = `
                background-color: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1rem;
            `;
            subEl.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h4 style="color: var(--accent); margin-bottom: 0.5rem;">${sub.name}</h4>
                        <p style="color: var(--text-tertiary); font-size: 0.9rem; margin-bottom: 0.5rem;">${sub.timestamp}</p>
                        <p style="color: var(--text-secondary);"><strong>Email:</strong> ${sub.email}</p>
                    </div>
                    <button onclick="deleteSubmission(${index})" style="background: #ff6b6b; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Delete</button>
                </div>
                <div style="background: var(--bg-primary); padding: 1rem; border-radius: 4px; margin-top: 1rem;">
                    <p style="color: var(--text-secondary); font-weight: 600; margin-bottom: 0.5rem;">${sub.subject}</p>
                    <p style="color: var(--text-secondary); white-space: pre-wrap;">${sub.message}</p>
                </div>
            `;
            container.appendChild(subEl);
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
    }
}

async function deleteSubmission(index) {
    if (confirm("Delete this submission?")) {
        try {
            const response = await fetch(`/api/delete-submission/${index}`, { method: 'POST' });
            if (response.ok) {
                renderSubmissions();
            }
        } catch (error) {
            alert("Error deleting submission.");
        }
    }
}

// Poetry Snake Game - Enhanced Version
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

// Word list for random generation
const WORDS_POOL = {
    nouns: ['dream', 'star', 'river', 'mountain', 'ocean', 'forest', 'dawn', 'night', 'journey', 'hope', 'love', 'heart', 'sky', 'wind', 'light', 'shadow', 'fire', 'water', 'earth', 'soul'],
    verbs: ['dance', 'flow', 'soar', 'whisper', 'shine', 'bloom', 'discover', 'embrace', 'awaken', 'wander', 'fly', 'drift', 'breathe', 'sing', 'create', 'explore'],
    adjectives: ['beautiful', 'serene', 'golden', 'ethereal', 'peaceful', 'wild', 'ancient', 'bright', 'silent', 'vivid', 'tender', 'boundless'],
    adverbs: ['gently', 'softly', 'freely', 'deeply', 'slowly', 'swiftly', 'eternally', 'slowly', 'brightly']
};

let gameState = {
    snake: [{ x: 10, y: 10 }],
    wordTokens: [],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    score: 0,
    isRunning: false,
    gameOver: false,
    level: 1,
    poemsGenerated: 0,
    comboTimer: 0,
    comboCount: 0
};

let poetryState = {
    buffer: [],
    isGenerating: false,
    currentPoem: null,
    currentImage: null,
    currentTheme: null
};

let powerUpState = {
    active: null,
    endTime: 0,
    speedMultiplier: 1
};

let gameLoop;
let lastMoveTime = 0;
let MOVE_INTERVAL = 100;
let lastComboTime = 0;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Word token class
class WordToken {
    constructor(x, y, word, type) {
        this.x = x;
        this.y = y;
        this.word = word;
        this.type = type; // noun, verb, adjective, adverb
    }

    getColor() {
        const colors = {
            noun: '#4a9eff',
            verb: '#ff6b6b',
            adjective: '#4ecdc4',
            adverb: '#a78bfa'
        };
        return colors[this.type] || '#a78bfa';
    }
}

function generateWordTokens() {
    gameState.wordTokens = [];
    const tokenCount = 3 + gameState.level;
    const types = Object.keys(WORDS_POOL);

    for (let i = 0; i < tokenCount; i++) {
        let pos, isValid;
        do {
            isValid = true;
            pos = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };

            if (gameState.snake.some(s => s.x === pos.x && s.y === pos.y)) {
                isValid = false;
            }
            if (gameState.wordTokens.some(t => t.x === pos.x && t.y === pos.y)) {
                isValid = false;
            }
        } while (!isValid);

        const type = types[Math.floor(Math.random() * types.length)];
        const words = WORDS_POOL[type];
        const word = words[Math.floor(Math.random() * words.length)];

        gameState.wordTokens.push(new WordToken(pos.x, pos.y, word, type));
    }

    // Add power-ups occasionally
    if (Math.random() < 0.3 && gameState.poemsGenerated > 0) {
        let pos, isValid;
        do {
            isValid = true;
            pos = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };

            if (gameState.snake.some(s => s.x === pos.x && s.y === pos.y)) {
                isValid = false;
            }
            if (gameState.wordTokens.some(t => t.x === pos.x && t.y === pos.y)) {
                isValid = false;
            }
        } while (!isValid);

        gameState.wordTokens.push({
            x: pos.x,
            y: pos.y,
            word: '⚡',
            type: 'powerup',
            powerupType: ['speedBoost', 'slowTime', 'doublePoints'][Math.floor(Math.random() * 3)]
        });
    }
}

function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'eat') {
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === 'gameOver') {
            oscillator.frequency.value = 200;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'powerup') {
            oscillator.frequency.value = 1200;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        }
    } catch (e) {
        console.log('Audio unavailable');
    }
}

function drawGame() {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary');
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border');
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }

    // Draw word tokens
    gameState.wordTokens.forEach(token => {
        ctx.fillStyle = token.type === 'powerup' ? '#ffb700' : token.getColor();
        ctx.fillRect(token.x * CELL_SIZE + 2, token.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

        if (token.type === 'powerup') {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡', token.x * CELL_SIZE + CELL_SIZE / 2, token.y * CELL_SIZE + CELL_SIZE / 2);
        }
    });

    // Draw snake
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent');
    gameState.snake.forEach((segment, index) => {
        ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
}

function updateGame() {
    if (!gameState.isRunning) return;

    gameState.direction = gameState.nextDirection;

    const head = gameState.snake[0];
    let newHead = {
        x: head.x + gameState.direction.x,
        y: head.y + gameState.direction.y
    };

    // Wrap around borders instead of dying
    if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
    if (newHead.x >= GRID_SIZE) newHead.x = 0;
    if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
    if (newHead.y >= GRID_SIZE) newHead.y = 0;

    // Self collision only (no wall collision anymore)
    if (gameState.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame();
        return;
    }

    gameState.snake.unshift(newHead);

    // Check word token collision
    const tokenIndex = gameState.wordTokens.findIndex(t => t.x === newHead.x && t.y === newHead.y);
    if (tokenIndex !== -1) {
        const token = gameState.wordTokens[tokenIndex];

        if (token.type === 'powerup') {
            applyPowerUp(token.powerupType);
            playSound('powerup');
        } else {
            // Add word to poetry buffer
            poetryState.buffer.push(token.word);
            gameState.score += 10;
            lastComboTime = Date.now();
            gameState.comboCount++;
            playSound('eat');

            updatePoetryBuffer();
        }

        gameState.wordTokens.splice(tokenIndex, 1);

        if (gameState.wordTokens.length === 0) {
            generateWordTokens();
        }
    } else {
        gameState.snake.pop();
    }

    // Update UI
    document.getElementById('current-score').textContent = gameState.score;
}

function updatePoetryBuffer() {
    const container = document.getElementById('poetry-buffer-words');

    if (poetryState.buffer.length === 0) {
        container.innerHTML = '<span style="color: var(--text-tertiary); font-size: 0.9rem;">No words yet...</span>';
    } else {
        container.innerHTML = poetryState.buffer.map(word => {
            return `<span class="word-chip">${word}</span>`;
        }).join(' ');
    }

    document.getElementById('word-count').textContent = poetryState.buffer.length;

    const btn = document.getElementById('generate-poem-btn');
    if (poetryState.buffer.length >= 10) {
        btn.style.display = 'block';
    }
}

function applyPowerUp(type) {
    powerUpState.active = type;
    powerUpState.endTime = Date.now() + 5000;

    const display = document.getElementById('powerup-display');
    display.style.display = 'block';

    const messages = {
        speedBoost: '⚡ Speed Boost +50%',
        slowTime: '🐌 Slow Time -50%',
        doublePoints: '2️⃣  Double Points'
    };

    document.getElementById('active-powerup').textContent = messages[type];

    if (type === 'speedBoost') {
        MOVE_INTERVAL = 50;
    } else if (type === 'slowTime') {
        MOVE_INTERVAL = 150;
    }
}

function startGame() {
    if (gameState.isRunning) return;

    gameState.snake = [{ x: 10, y: 10 }];
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.score = 0;
    gameState.isRunning = true;
    gameState.gameOver = false;
    gameState.comboCount = 0;

    poetryState.buffer = [];
    powerUpState.active = null;
    MOVE_INTERVAL = 100;

    document.getElementById('current-score').textContent = '0';
    document.getElementById('game-level').textContent = gameState.level;
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('game-status').style.display = 'none';
    document.getElementById('generate-poem-btn').style.display = 'none';
    document.getElementById('powerup-display').style.display = 'none';

    updatePoetryBuffer();
    generateWordTokens();
    gameLoopFn();
}

function endGame() {
    gameState.isRunning = false;
    gameState.gameOver = true;

    document.getElementById('restart-btn').style.display = 'block';
    document.getElementById('game-status').style.display = 'block';
    document.getElementById('generate-poem-btn').style.display = 'none';

    playSound('gameOver');
}

function gameLoopFn() {
    const now = Date.now();

    // Check power-up expiration
    if (powerUpState.active && now > powerUpState.endTime) {
        powerUpState.active = null;
        MOVE_INTERVAL = 100;
        document.getElementById('powerup-display').style.display = 'none';
    }

    if (now - lastMoveTime > MOVE_INTERVAL * powerUpState.speedMultiplier) {
        updateGame();
        lastMoveTime = now;
    }

    drawGame();

    if (gameState.isRunning) {
        requestAnimationFrame(gameLoopFn);
    }
}

document.addEventListener('keydown', (e) => {
    if (!gameState.isRunning) return;

    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (gameState.direction.y === 0) gameState.nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (gameState.direction.y === 0) gameState.nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (gameState.direction.x === 0) gameState.nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (gameState.direction.x === 0) gameState.nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
    }
});

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (!gameState.isRunning) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const minSwipe = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > minSwipe && gameState.direction.x === 0) {
            gameState.nextDirection = { x: 1, y: 0 };
        } else if (deltaX < -minSwipe && gameState.direction.x === 0) {
            gameState.nextDirection = { x: -1, y: 0 };
        }
    } else {
        if (deltaY > minSwipe && gameState.direction.y === 0) {
            gameState.nextDirection = { x: 0, y: 1 };
        } else if (deltaY < -minSwipe && gameState.direction.y === 0) {
            gameState.nextDirection = { x: 0, y: -1 };
        }
    }
});

// Poetry Generation Functions
async function generatePoem() {
    if (poetryState.buffer.length < 10 || poetryState.isGenerating) return;

    poetryState.isGenerating = true;
    document.getElementById('generate-poem-btn').disabled = true;

    try {
        const response = await fetch('/api/generate-poem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ words: poetryState.buffer })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || errorData.error || 'Poem generation failed');
        }

        const data = await response.json();
        poetryState.currentPoem = data.poem;
        gameState.score += 50;

        generateImage(data.poem);
        showPoemModal();

    } catch (error) {
        let errorMsg = error.message || error.toString();
        if (errorMsg.includes('CLAUDE_API_KEY')) {
            errorMsg = 'Claude API key not configured. Ask the admin to set CLAUDE_API_KEY environment variable.';
        } else if (errorMsg.includes('Failed to parse') || errorMsg.includes('Failed to connect')) {
            errorMsg = 'Error generating poem. Make sure server is running!';
        }
        alert(errorMsg);
        console.error(error);
    } finally {
        poetryState.isGenerating = false;
        document.getElementById('generate-poem-btn').disabled = false;
    }
}

async function generateImage(poem) {
    try {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ poem })
        });

        if (!response.ok) throw new Error('Image generation failed');

        const data = await response.json();
        poetryState.currentImage = data.imageUrl;
        poetryState.currentTheme = data.theme;

        document.getElementById('image-loading').style.display = 'none';
        const img = document.getElementById('generated-image');
        img.src = poetryState.currentImage;
        img.style.display = 'block';

    } catch (error) {
        console.error('Image generation error:', error);
        document.getElementById('image-loading').innerHTML = '<p style="color: var(--text-secondary);">Image generation not available</p>';
    }
}

function showPoemModal() {
    document.getElementById('generated-poem').textContent = poetryState.currentPoem;
    document.getElementById('image-loading').style.display = 'block';
    document.getElementById('generated-image').style.display = 'none';
    document.getElementById('poem-modal').style.display = 'flex';
}

function closePoemModal() {
    document.getElementById('poem-modal').style.display = 'none';
    poetryState.currentPoem = null;
    poetryState.currentImage = null;
}

async function savePoem() {
    if (!poetryState.currentPoem) return;

    try {
        const response = await fetch('/api/save-poem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                words: poetryState.buffer,
                poem: poetryState.currentPoem,
                theme: poetryState.currentTheme || 'Unknown',
                imageUrl: poetryState.currentImage || '',
                score: gameState.score
            })
        });

        if (response.ok) {
            gameState.poemsGenerated++;
            gameState.level = Math.floor(gameState.poemsGenerated / 3) + 1;
            document.getElementById('game-level').textContent = gameState.level;

            poetryState.buffer = [];
            updatePoetryBuffer();
            loadGallery();
            closePoemModal();
        }
    } catch (error) {
        console.error('Error saving poem:', error);
    }
}

async function loadGallery() {
    try {
        const response = await fetch('/api/gallery');
        const poems = await response.json();

        const container = document.getElementById('gallery-container');
        if (poems.length === 0) {
            container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 2rem;">No poems yet...</p>';
            return;
        }

        container.innerHTML = poems.map(poem => `
            <div class="gallery-item">
                <img src="${poem.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%23333%22 width=%22300%22 height=%22200%22/%3E%3C/svg%3E'}" alt="Poem artwork" class="gallery-image">
                <div class="gallery-content">
                    <div class="gallery-theme">${poem.theme || 'Untitled'}</div>
                    <div class="gallery-poem">${poem.poem.split('\n')[0]}...</div>
                    <div class="gallery-meta">
                        <span>${new Date(poem.timestamp).toLocaleDateString()}</span>
                        <button class="gallery-delete" onclick="deletePoem('${poem.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

async function deletePoem(id) {
    if (!confirm('Delete this poem?')) return;

    try {
        await fetch(`/api/delete-poem/${id}`, { method: 'POST' });
        loadGallery();
    } catch (error) {
        console.error('Error deleting poem:', error);
    }
}

function setupGame() {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    document.getElementById('generate-poem-btn').addEventListener('click', generatePoem);

    drawGame();
    loadGallery();
}

// ── Houses page state ────────────────────────────────────────────────────────
let _housesAll   = [];      // all deals loaded from houses.json (up to 50)
let _housesState = 'all';   // active state pill: 'all' | 'DC' | 'MD' | 'VA'
let _housesArea  = 'all';   // active area dropdown value

async function loadHouses() {
    const container = document.getElementById('houses-container');
    const dateEl    = document.getElementById('houses-date');

    try {
        // Read directly from the pre-generated static file — no API wait
        const res  = await fetch('/houses.json?t=' + new Date().toDateString().replace(/ /g,''));
        const data = await res.json();

        if (dateEl) dateEl.textContent = `Today's listings — ${data.date}`;
        // Derive state and area from "City, ST ZIPCODE" if not already present
        _housesAll = (data.houses || []).map(h => {
            if (!h.state || !h.area) {
                const m = h.city && h.city.match(/^(.+),\s*([A-Z]{2})\s+\d/);
                return Object.assign({}, h, {
                    state: h.state || (m ? m[2] : ''),
                    area:  h.area  || (m ? m[1].trim() : h.city || '')
                });
            }
            return h;
        });
        _housesState = 'all';
        _housesArea  = 'all';

        // Populate area dropdown for "all states"
        _populateAreaDropdown('all');

        // Wire state pill buttons (safe to re-wire; cloneNode trick avoids dupes)
        document.querySelectorAll('.state-pill').forEach(btn => {
            const fresh = btn.cloneNode(true);
            btn.parentNode.replaceChild(fresh, btn);
            fresh.addEventListener('click', () => {
                document.querySelectorAll('.state-pill').forEach(b => b.classList.remove('active'));
                fresh.classList.add('active');
                _housesState = fresh.dataset.state;
                _housesArea  = 'all';
                const sel = document.getElementById('houses-area-select');
                if (sel) sel.value = 'all';
                _populateAreaDropdown(_housesState);
                _renderFilteredHouses();
            });
        });

        // Wire area dropdown
        const areaSelect = document.getElementById('houses-area-select');
        if (areaSelect) {
            const freshSel = areaSelect.cloneNode(false); // clone without children
            areaSelect.parentNode.replaceChild(freshSel, areaSelect);
            _populateAreaDropdown('all', freshSel);       // re-populate on the new node
            freshSel.addEventListener('change', e => {
                _housesArea = e.target.value;
                _renderFilteredHouses();
            });
        }

        _renderFilteredHouses();

    } catch (err) {
        container.innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:2rem;grid-column:1/-1;">Could not load listings. Make sure the server is running.</p>';
    }
}

function _populateAreaDropdown(state, el) {
    const select = el || document.getElementById('houses-area-select');
    if (!select) return;

    const areas = [...new Set(
        _housesAll
            .filter(h => state === 'all' || h.state === state)
            .map(h => h.area)
            .filter(Boolean)
    )].sort();

    select.innerHTML = '<option value="all">— All Areas —</option>' +
        areas.map(a => `<option value="${a}">${a}</option>`).join('');
}

function _renderFilteredHouses() {
    const container = document.getElementById('houses-container');
    const countEl   = document.getElementById('houses-count');

    // Apply state + area filters
    let filtered = _housesAll;
    if (_housesState !== 'all') filtered = filtered.filter(h => h.state === _housesState);
    if (_housesArea  !== 'all') filtered = filtered.filter(h => h.area  === _housesArea);

    // Show top 10 of the filtered set (already sorted by discountPct desc)
    const top10 = filtered.slice(0, 10);

    if (countEl) {
        countEl.textContent = top10.length
            ? `Showing ${top10.length} listing${top10.length !== 1 ? 's' : ''}`
            : '';
    }

    if (top10.length === 0) {
        container.innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:3rem;grid-column:1/-1;">No below-market listings found for this area yet. Try a different filter.</p>';
        return;
    }

    container.innerHTML = '';
    top10.forEach((h, idx) => {
        const rank       = idx + 1;
        const medal      = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        const marketFmt  = '$' + h.marketPrice.toLocaleString();
        const listedFmt  = '$' + h.listedPrice.toLocaleString();
        const savingsFmt = '$' + h.savings.toLocaleString();
        const photoSrc   = h.imageUrl
            ? `/api/house-photo?url=${encodeURIComponent(h.imageUrl)}`
            : 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Photo';

        const card = document.createElement('div');
        card.className = 'house-card';
        card.innerHTML = `
            <div class="house-photo-wrap">
                <img class="house-photo" src="${photoSrc}" alt="${h.address}" loading="lazy">
                <span class="house-rank-badge">${medal}</span>
                <span class="house-discount-badge">-${h.discountPct}% below market</span>
            </div>
            <div class="house-card-body">
                <div class="house-price-row">
                    <span class="house-listed-price">${listedFmt}</span>
                    <span class="house-market-price">Zestimate: <s>${marketFmt}</s></span>
                </div>
                <div class="house-specs">
                    <span>🛏 ${h.beds} bd</span>
                    <span class="house-spec-divider">·</span>
                    <span>🚿 ${h.baths} ba</span>
                    ${h.sqft ? `<span class="house-spec-divider">·</span><span>📐 ${h.sqft.toLocaleString()} sqft</span>` : ''}
                </div>
                <div class="house-address">
                    <h3>${h.address}</h3>
                    <p class="house-city">${h.city}</p>
                </div>
                <div class="house-discount-bar-wrap">
                    <div class="house-discount-bar" style="width:${Math.min(h.discountPct, 100)}%"></div>
                    <span class="house-discount-pct">${h.discountPct}% below market</span>
                </div>
                <div class="house-savings-row">
                    <span class="house-savings">Save ${savingsFmt}</span>
                    <span class="house-days">${h.daysOnMarket}d on market</span>
                </div>
                <div class="house-card-header">
                    <span class="house-type-badge">${h.type}</span>
                </div>
                <a class="house-zillow-btn" href="${h.detailUrl}" target="_blank" rel="noopener">
                    View on Zillow →
                </a>
            </div>
        `;
        container.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderPosts();
    setupNavigation();
    setupFilters();
    setupSearch();
    setupTheme();
    setupModal();
    setupContactForm();
    setupGame();
});
