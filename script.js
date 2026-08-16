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
let _housesState = 'all';         // active state pill: 'all' | 'DC' | 'MD' | 'VA'
let _housesArea  = 'all';         // active area dropdown value
let _housesLimit = 10;            // how many records to show
let _housesSort  = 'discount_desc'; // sort order

async function loadHouses() {
    const container = document.getElementById('houses-container');
    const dateEl    = document.getElementById('houses-date');

    try {
        // Fetch from API endpoint
        const res  = await fetch('/api/houses');
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

        // Wire sort dropdown
        const sortSelect = document.getElementById('houses-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', e => {
                _housesSort = e.target.value;
                _renderFilteredHouses();
            });
        }

        // Wire limit dropdown
        const limitSelect = document.getElementById('houses-limit-select');
        if (limitSelect) {
            limitSelect.addEventListener('change', e => {
                _housesLimit = e.target.value === 'all' ? Infinity : parseInt(e.target.value);
                _renderFilteredHouses();
            });
        }

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

    // Force grid layout inline — 2 cols like Redfin
    container.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem;align-items:start;';

    // Apply state + area filters
    let filtered = _housesAll;
    if (_housesState !== 'all') filtered = filtered.filter(h => h.state === _housesState);
    if (_housesArea  !== 'all') filtered = filtered.filter(h => h.area  === _housesArea);

    // Sort
    filtered = filtered.slice().sort((a, b) => {
        switch (_housesSort) {
            case 'discount_asc':  return (a.discountPct||0) - (b.discountPct||0);
            case 'price_asc':     return (parseFloat(a.listedPrice)||0) - (parseFloat(b.listedPrice)||0);
            case 'price_desc':    return (parseFloat(b.listedPrice)||0) - (parseFloat(a.listedPrice)||0);
            default:              return (b.discountPct||0) - (a.discountPct||0); // discount_desc
        }
    });
    const top10 = _housesLimit === Infinity ? filtered : filtered.slice(0, _housesLimit);

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
        const rank        = idx + 1;
        const medal       = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        const listed      = parseFloat(h.listedPrice)  || 0;
        const market      = parseFloat(h.marketPrice)  || 0;
        const savings     = parseFloat(h.savings)      || 0;
        const discount    = parseInt(h.discountPct)    || 0;
        const listedFmt   = '$' + listed.toLocaleString();
        const marketFmt   = '$' + market.toLocaleString();
        const savingsFmt  = '$' + Math.abs(savings).toLocaleString();
        const photoSrc    = h.imageUrl
            ? `/api/house-photo?url=${encodeURIComponent(h.imageUrl)}`
            : 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Photo';
        const discountLabel = discount > 0
            ? `↓${discount}% below market`
            : discount < 0
            ? `↑${Math.abs(discount)}% above market`
            : 'At market value';
        const discountColor = discount > 0 ? '#00b894' : '#d63031';
        const hasZestimate = market > 0 && market !== listed;
        const sqft = h.sqft ? Number(h.sqft).toLocaleString() : null;
        const daysOnMarket = h.firstSeenAt
            ? Math.max(0, Math.floor((Date.now() - new Date(h.firstSeenAt).getTime()) / 86400000))
            : null;

        const card = document.createElement('div');
        card.className = 'house-card';
        card.style.cssText = 'background:#fff;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 2px 12px rgba(0,0,0,0.12);cursor:pointer;transition:box-shadow 0.2s,transform 0.15s;';
        card.onmouseenter = () => { card.style.boxShadow='0 8px 30px rgba(0,0,0,0.18)'; card.style.transform='translateY(-2px)'; };
        card.onmouseleave = () => { card.style.boxShadow='0 2px 12px rgba(0,0,0,0.12)'; card.style.transform=''; };
        card.innerHTML = `
            <div style="position:relative;width:100%;height:280px;overflow:hidden;background:#e8e8e8;flex-shrink:0;">
                <img src="${photoSrc}" alt="${h.address}" loading="lazy"
                     style="width:100%;height:280px;object-fit:cover;object-position:center;display:block;">
                ${discount !== 0 ? `
                <div style="position:absolute;top:0.7rem;left:0.7rem;background:${discountColor};color:#fff;border-radius:8px;padding:0.3rem 0.7rem;display:flex;flex-direction:column;align-items:center;line-height:1.1;">
                    <span style="font-size:1.35rem;font-weight:900;letter-spacing:-0.5px;">${discount > 0 ? discount : Math.abs(discount)}%</span>
                    <span style="font-size:0.62rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">${discount > 0 ? 'below' : 'above'} market</span>
                </div>` : ''}
                <span style="position:absolute;top:0.7rem;right:0.7rem;background:rgba(0,0,0,0.5);color:#fff;font-size:0.72rem;font-weight:600;padding:0.25rem 0.6rem;border-radius:20px;">${medal}</span>
                ${daysOnMarket !== null ? `<span style="position:absolute;bottom:0.7rem;left:0.7rem;background:rgba(0,0,0,0.6);color:#fff;font-size:0.7rem;font-weight:600;padding:0.25rem 0.6rem;border-radius:20px;">${daysOnMarket} day${daysOnMarket !== 1 ? 's' : ''} on market</span>` : ''}
            </div>
            <div style="padding:1rem 1.1rem 1.2rem;display:flex;flex-direction:column;gap:0.4rem;">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:0.5rem;">
                    <span style="font-size:1.45rem;font-weight:800;color:#1a1a1a;">${listedFmt}</span>
                    ${discount !== 0 ? `<span style="font-size:0.95rem;font-weight:700;color:${discountColor};white-space:nowrap;">${discount > 0 ? '↓' : '↑'}${Math.abs(discount)}%</span>` : ''}
                </div>
                ${hasZestimate ? `<div style="font-size:0.78rem;color:#888;">Zestimate: <s>${marketFmt}</s>${savings > 0 ? ` &nbsp;·&nbsp; <span style="color:#00b894;font-weight:600;">save $${Math.abs(savings).toLocaleString()}</span>` : ''}</div>` : ''}
                <div style="font-size:0.9rem;color:#333;margin-top:0.1rem;">
                    ${h.beds ? `${h.beds} beds` : ''}${h.beds && h.baths ? ' · ' : ''}${h.baths ? `${h.baths} baths` : ''}${sqft ? ` · ${sqft} sq ft` : ''}
                </div>
                <div style="font-size:0.85rem;color:#555;">
                    ${h.address || ''}, ${h.city || ''}${h.zipcode ? ' ' + h.zipcode : ''}
                </div>
                ${h.type ? `<div style="font-size:0.75rem;color:#aaa;text-transform:uppercase;letter-spacing:0.05em;">${h.type}</div>` : ''}
                ${h.detailUrl ? `<a href="${h.detailUrl}" target="_blank" rel="noopener"
                    style="margin-top:0.5rem;font-size:0.82rem;font-weight:600;color:#1a73e8;text-decoration:none;"
                    onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">View on Zillow →</a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

function escapeLetterHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function buildMdNoticeHtml(d) {
    const totalDue = (parseFloat(d.rentAmount) || 0) + (parseFloat(d.lateFeeAmount) || 0);
    const fmt = n => "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `
        <div style="line-height:1.6; font-size:0.92rem;">
            <h3 style="text-align:center; margin-bottom:0.2rem;">NOTICE OF INTENT TO FILE A COMPLAINT FOR SUMMARY EJECTMENT (Failure to Pay Rent)</h3>
            <p style="text-align:center; margin-bottom:1.2rem;">(Real Property Article §8-401(c))</p>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div>
                    <strong>FROM: Landlord/Agent</strong>
                    <p style="margin:0.2rem 0;">${d.landlordName}<br>${d.landlordAddress}<br>${d.landlordCityStateZip}<br>Tel: ${d.landlordPhone}${d.landlordEmail ? "<br>Email: " + d.landlordEmail : ""}</p>
                </div>
                <div>
                    <strong>TO: Tenant(s)</strong>
                    <p style="margin:0.2rem 0;">${d.tenant1}${d.tenant2 ? ", " + d.tenant2 : ""}<br>${d.tenantAddress}<br>${d.tenantCityStateZip}${d.tenantPhone ? "<br>Tel: " + d.tenantPhone : ""}${d.tenantEmail ? "<br>Email: " + d.tenantEmail : ""}</p>
                </div>
            </div>

            <p style="text-align:center;"><strong>THIS IS NOT A NOTICE OF EVICTION</strong></p>
            <p>An action for repossession of the property may be initiated if the total amount listed below is not paid within 10 days after the landlord provides this notice. You have a legal right to dispute the charges.</p>

            <table style="width:100%; border-collapse:collapse; margin:1rem 0;">
                <tr><td style="border:1px solid #999; padding:0.5rem;">${fmt(d.rentAmount)} rent for the ${d.rentPeriod}</td><td style="border:1px solid #999; padding:0.5rem;">${d.rentFrom} to ${d.rentTo}</td></tr>
                ${d.lateFeeAmount ? `<tr><td style="border:1px solid #999; padding:0.5rem;">${fmt(d.lateFeeAmount)} late fee for the ${d.lateFeePeriod}</td><td style="border:1px solid #999; padding:0.5rem;">${d.lateFeeFrom} to ${d.lateFeeTo}</td></tr>` : ""}
                <tr><td style="border:1px solid #999; padding:0.5rem;"><strong>TOTAL</strong></td><td style="border:1px solid #999; padding:0.5rem;"><strong>${fmt(totalDue)}</strong></td></tr>
            </table>
            <p style="font-size:0.85rem;">*Due pursuant to the terms of your lease. *Does not include other charges related to utilities, services, other fees, fines, and court costs.</p>
            <p style="font-size:0.85rem;">At your request, the landlord must promptly provide you an itemized accounting of debits and credits (rental ledger) showing how the amount you owe came to be.</p>

            <p><strong>DATE AND METHOD OF PROVIDING NOTICE</strong></p>
            <p>This notice is being provided to the tenant by the landlord on ${d.noticeDate} by: ${d.deliveryMethod}</p>

            <div style="display:flex; justify-content:space-between; margin:1.5rem 0;">
                <span>Date: ${d.noticeDate}</span>
                <span>Signature: ______________________</span>
            </div>

            <div style="border:1px solid #999; padding:1rem; margin-top:1.5rem; font-size:0.85rem;">
                <strong>RESOURCES FOR TENANTS AND LANDLORDS</strong>
                <ul style="margin:0.5rem 0 0 1.2rem;">
                    <li>Under the Access to Counsel in Evictions Law, all income qualified tenants will have access to an attorney. Call 211 for a referral or visit legalhelp.org for more information.</li>
                    <li>Alternative Dispute Resolution (ADR) Office: mdcourts.gov/district/adr/home — Mediation is a conversation between the landlord and tenant facilitated by a mediator, available before and after a failure-to-pay-rent case is filed in the District Court of Maryland.</li>
                    <li>Rental assistance may be available to both Tenants and Landlords. Visit mdcourts.gov/legalhelp/housing.</li>
                    <li>Speak with a lawyer for free at a Maryland Court Help Center. Visit mdcourts.gov/helpcenter or call 410-260-1392.</li>
                </ul>
            </div>
            <p style="text-align:right; font-size:0.75rem; color:#888; margin-top:1rem;">DC-CV-115 (Rev. 10/2024)</p>
        </div>
    `;
}

function buildVaNoticeHtml(d) {
    const fmt = n => "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `
        <div style="line-height:1.6; font-size:0.92rem;">
            <h3 style="text-align:center; margin-bottom:0.2rem;">14-DAY NOTICE TO PAY RENT OR QUIT</h3>
            <p style="text-align:center; margin-bottom:1.2rem;">(Nonpayment of Rent — Va. Code § 55.1-1245)</p>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div>
                    <strong>FROM: Landlord/Agent</strong>
                    <p style="margin:0.2rem 0;">${d.landlordName}<br>${d.landlordAddress}<br>${d.landlordCityStateZip}<br>Tel: ${d.landlordPhone}${d.landlordEmail ? "<br>Email: " + d.landlordEmail : ""}</p>
                </div>
                <div>
                    <strong>TO: Tenant(s)</strong>
                    <p style="margin:0.2rem 0;">${d.tenant1}${d.tenant2 ? ", " + d.tenant2 : ""}<br>${d.tenantAddress}<br>${d.tenantCityStateZip}${d.tenantPhone ? "<br>Tel: " + d.tenantPhone : ""}${d.tenantEmail ? "<br>Email: " + d.tenantEmail : ""}</p>
                </div>
            </div>

            <p>You are hereby notified that you have failed to pay rent as required under your rental agreement. The rent set forth below remains unpaid:</p>

            <table style="width:100%; border-collapse:collapse; margin:1rem 0;">
                <tr><td style="border:1px solid #999; padding:0.5rem;">${fmt(d.rentAmount)} rent for the ${d.rentPeriod}</td><td style="border:1px solid #999; padding:0.5rem;">${d.rentFrom} to ${d.rentTo}</td></tr>
                <tr><td style="border:1px solid #999; padding:0.5rem;"><strong>TOTAL DUE</strong></td><td style="border:1px solid #999; padding:0.5rem;"><strong>${fmt(d.rentAmount)}</strong></td></tr>
            </table>

            <p><strong>You have FOURTEEN (14) DAYS from the date of this notice to pay the total amount due.</strong> If the rent is not paid in full within this 14-day period, the landlord intends to terminate the rental agreement and may file an unlawful detainer action in the <strong>Prince William County General District Court</strong> to obtain possession of the premises. This notice is provided pursuant to Va. Code § 55.1-1245.</p>

            <p><strong>DATE AND METHOD OF PROVIDING NOTICE</strong></p>
            <p>This notice is being provided to the tenant by the landlord on ${d.noticeDate} by ${d.deliveryMethod}.</p>

            <div style="display:flex; justify-content:space-between; margin:1.5rem 0;">
                <span>Date: ${d.noticeDate}</span>
                <span>Signature: ______________________</span>
            </div>

            <p style="font-size:0.8rem; color:#888; border:1px solid #999; padding:0.75rem;">This is a template based on current Virginia statutory requirements and is not a substitute for advice from a Virginia-licensed attorney. Notice periods and required content can change; verify current requirements before relying on this notice in a legal proceeding.</p>
        </div>
    `;
}

function setupLetterForm() {
    const stateSelect = document.getElementById("letter-state-select");
    const generalForm = document.getElementById("letter-form-general");
    const mdForm = document.getElementById("letter-form-md");
    const vaForm = document.getElementById("letter-form-va");
    const previewWrapper = document.getElementById("letter-preview-wrapper");
    const preview = document.getElementById("letter-preview");
    const printBtn = document.getElementById("letter-print-btn");
    const copyBtn = document.getElementById("letter-copy-btn");
    const pdfBtn = document.getElementById("letter-pdf-btn");
    const emailBtn = document.getElementById("letter-email-btn");

    let lastLetterType = null; // "general" | "md-cv115" | "va-pay-or-quit"
    let lastLetter = null; // raw (unescaped) field values, used for PDF export

    // Default the notice date and rent-owed-through date to today
    const todayLocal = new Date();
    const yyyy = todayLocal.getFullYear();
    const mm = String(todayLocal.getMonth() + 1).padStart(2, "0");
    const dd = String(todayLocal.getDate()).padStart(2, "0");
    const todayIso = `${yyyy}-${mm}-${dd}`;
    document.getElementById("md-notice-date").value = todayIso;
    document.getElementById("md-rent-to").value = todayIso;
    document.getElementById("md-latefee-to").value = todayIso;
    document.getElementById("va-notice-date").value = todayIso;
    document.getElementById("va-rent-to").value = todayIso;

    const FORMS_BY_STATE = { general: generalForm, MD: mdForm, VA: vaForm };

    stateSelect.addEventListener("change", () => {
        Object.entries(FORMS_BY_STATE).forEach(([state, form]) => {
            form.style.display = state === stateSelect.value ? "flex" : "none";
        });
        // Email sending is only wired up for the official MD notice
        emailBtn.style.display = stateSelect.value === "MD" ? "inline-block" : "none";
        previewWrapper.style.display = "none";
    });

    generalForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const recipientRaw = document.getElementById("letter-recipient").value;
        const addressRaw = document.getElementById("letter-address").value;
        const reasonRaw = document.getElementById("letter-reason").value;
        const period = document.getElementById("letter-period").value;
        const detailsRaw = document.getElementById("letter-details").value;
        const senderRaw = document.getElementById("letter-sender").value;

        const periodLabel = period
            ? (() => {
                const [py, pm] = period.split("-").map(Number);
                return new Date(py, pm - 1, 1).toLocaleDateString(undefined, { year: "numeric", month: "long" });
            })()
            : "";
        const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

        lastLetterType = "general";
        lastLetter = { recipient: recipientRaw, address: addressRaw, reason: reasonRaw, periodLabel, details: detailsRaw, sender: senderRaw, today };

        const recipient = escapeLetterHtml(recipientRaw);
        const address = escapeLetterHtml(addressRaw);
        const reason = escapeLetterHtml(reasonRaw);
        const details = escapeLetterHtml(detailsRaw);
        const sender = escapeLetterHtml(senderRaw);

        preview.innerHTML = `
            <div style="line-height:1.8;">
                <p>${today}</p>
                <p>${recipient}<br>${address}</p>
                <p><strong>Re: Warning Notice — ${reason}${periodLabel ? " (" + periodLabel + ")" : ""}</strong></p>
                <p>Dear ${recipient},</p>
                <p>This letter serves as formal notice regarding <strong>${reason.toLowerCase()}</strong> for the period of ${periodLabel}.</p>
                <p>${details.replace(/\n/g, "<br>")}</p>
                <p>Please address this matter promptly. Failure to do so may result in further action as outlined in your lease agreement.</p>
                <p>Sincerely,<br>${sender}</p>
            </div>
        `;
        previewWrapper.style.display = "block";
        previewWrapper.scrollIntoView({ behavior: "smooth" });
    });

    mdForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Rent-owed-from date = the 1st of the month, N months before today
        const rentCountNum = parseInt(document.getElementById("md-rent-count").value, 10) || 0;
        const rentFromDate = new Date();
        rentFromDate.setDate(1); // set day first to avoid day-overflow when shifting months
        rentFromDate.setMonth(rentFromDate.getMonth() - rentCountNum);
        const rfYyyy = rentFromDate.getFullYear();
        const rfMm = String(rentFromDate.getMonth() + 1).padStart(2, "0");
        document.getElementById("md-rent-from").value = `${rfYyyy}-${rfMm}-01`;

        // Late-fee months owed always mirrors the past-due rent months, so its
        // from-date uses the same "1st of the month, N months back" calculation
        document.getElementById("md-latefee-count").value = document.getElementById("md-rent-count").value;
        document.getElementById("md-latefee-from").value = `${rfYyyy}-${rfMm}-01`;

        const val = id => document.getElementById(id).value;
        const d = {
            landlordName: val("md-landlord-name"),
            landlordAddress: val("md-landlord-address"),
            landlordCityStateZip: val("md-landlord-citystatezip"),
            landlordPhone: val("md-landlord-phone"),
            landlordEmail: val("md-landlord-email"),
            tenant1: val("md-tenant1"),
            tenant2: val("md-tenant2"),
            tenantAddress: val("md-tenant-address"),
            tenantCityStateZip: val("md-tenant-citystatezip"),
            tenantPhone: val("md-tenant-phone"),
            tenantEmail: val("md-tenant-email"),
            rentAmount: val("md-rent-amount"),
            rentCount: val("md-rent-count"),
            rentUnit: val("md-rent-unit"),
            rentFrom: val("md-rent-from"),
            rentTo: val("md-rent-to"),
            lateFeeAmount: val("md-latefee-amount"),
            lateFeeCount: val("md-latefee-count"),
            lateFeeUnit: val("md-latefee-unit"),
            lateFeeFrom: val("md-latefee-from"),
            lateFeeTo: val("md-latefee-to"),
            noticeDate: val("md-notice-date"),
            deliveryMethod: val("md-delivery-method"),
        };
        d.rentPeriod = `${d.rentCount} ${d.rentUnit}`;
        d.lateFeePeriod = d.lateFeeCount ? `${d.lateFeeCount} ${d.lateFeeUnit}` : "";

        lastLetterType = "md-cv115";
        lastLetter = d;

        // Escape all user-entered text fields before rendering as HTML
        const escaped = {};
        Object.keys(d).forEach(k => { escaped[k] = escapeLetterHtml(String(d[k] ?? "")); });

        preview.innerHTML = buildMdNoticeHtml(escaped);
        previewWrapper.style.display = "block";
        previewWrapper.scrollIntoView({ behavior: "smooth" });
    });

    vaForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Rent-owed-from date = the 1st of the month, N months before today
        const rentCountNum = parseInt(document.getElementById("va-rent-count").value, 10) || 0;
        const rentFromDate = new Date();
        rentFromDate.setDate(1);
        rentFromDate.setMonth(rentFromDate.getMonth() - rentCountNum);
        const rfYyyy = rentFromDate.getFullYear();
        const rfMm = String(rentFromDate.getMonth() + 1).padStart(2, "0");
        document.getElementById("va-rent-from").value = `${rfYyyy}-${rfMm}-01`;

        const val = id => document.getElementById(id).value;
        const d = {
            landlordName: val("va-landlord-name"),
            landlordAddress: val("va-landlord-address"),
            landlordCityStateZip: val("va-landlord-citystatezip"),
            landlordPhone: val("va-landlord-phone"),
            landlordEmail: val("va-landlord-email"),
            tenant1: val("va-tenant1"),
            tenant2: val("va-tenant2"),
            tenantAddress: val("va-tenant-address"),
            tenantCityStateZip: val("va-tenant-citystatezip"),
            tenantPhone: val("va-tenant-phone"),
            tenantEmail: val("va-tenant-email"),
            rentAmount: val("va-rent-amount"),
            rentCount: val("va-rent-count"),
            rentFrom: val("va-rent-from"),
            rentTo: val("va-rent-to"),
            noticeDate: val("va-notice-date"),
            deliveryMethod: val("va-delivery-method"),
        };
        d.rentPeriod = `${d.rentCount} month${d.rentCount == 1 ? "" : "s"}`;

        lastLetterType = "va-pay-or-quit";
        lastLetter = d;

        const escaped = {};
        Object.keys(d).forEach(k => { escaped[k] = escapeLetterHtml(String(d[k] ?? "")); });

        preview.innerHTML = buildVaNoticeHtml(escaped);
        previewWrapper.style.display = "block";
        previewWrapper.scrollIntoView({ behavior: "smooth" });
    });

    printBtn.addEventListener("click", () => {
        window.print();
    });

    copyBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(preview.innerText);
            alert("Letter copied to clipboard.");
        } catch (err) {
            alert("Could not copy — please select and copy manually.");
        }
    });

    pdfBtn.addEventListener("click", async () => {
        if (!lastLetter) { alert("Generate the letter first."); return; }

        if (lastLetterType === "general") {
            if (!window.jspdf) { alert("PDF library failed to load — check your internet connection."); return; }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: "pt", format: "letter" });
            doc.setFont("times", "normal");
            doc.setFontSize(12);

            const marginX = 60;
            const maxWidth = 612 - marginX * 2;
            const lineHeight = 18;
            let y = 60;

            const writeLine = (text, bold = false) => {
                doc.setFont("times", bold ? "bold" : "normal");
                const lines = doc.splitTextToSize(text, maxWidth);
                lines.forEach(line => {
                    if (y > 740) { doc.addPage(); y = 60; }
                    doc.text(line, marginX, y);
                    y += lineHeight;
                });
            };

            const { recipient, address, reason, periodLabel, details, sender, today } = lastLetter;
            const periodSuffix = periodLabel ? ` (${periodLabel})` : "";

            writeLine(today); y += lineHeight / 2;
            writeLine(recipient);
            writeLine(address); y += lineHeight / 2;
            writeLine(`Re: Warning Notice — ${reason}${periodSuffix}`, true); y += lineHeight / 2;
            writeLine(`Dear ${recipient},`); y += lineHeight / 2;
            writeLine(`This letter serves as formal notice regarding ${reason.toLowerCase()} for the period of ${periodLabel}.`); y += lineHeight / 2;
            writeLine(details); y += lineHeight / 2;
            writeLine("Please address this matter promptly. Failure to do so may result in further action as outlined in your lease agreement."); y += lineHeight / 2;
            writeLine("Sincerely,");
            writeLine(sender);

            const safeName = ("warning-letter-" + (recipient || "letter")).replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "letter";
            doc.save(`${safeName}.pdf`);
            return;
        }

        if (lastLetterType === "va-pay-or-quit") {
            if (!window.jspdf) { alert("PDF library failed to load — check your internet connection."); return; }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: "pt", format: "letter" });
            doc.setFont("times", "normal");
            doc.setFontSize(11);

            const marginX = 54;
            const maxWidth = 612 - marginX * 2;
            let y = 50;
            const fmt = n => "$" + Number(n || 0).toFixed(2);

            const writeLine = (text, opts = {}) => {
                doc.setFont("times", opts.bold ? "bold" : "normal");
                doc.setFontSize(opts.size || 11);
                const lines = doc.splitTextToSize(text, opts.width || maxWidth);
                lines.forEach(line => {
                    if (y > 740) { doc.addPage(); y = 50; }
                    const x = opts.center ? 306 - doc.getTextWidth(line) / 2 : marginX;
                    doc.text(line, x, y);
                    y += opts.lineHeight || 15;
                });
            };

            writeLine("14-DAY NOTICE TO PAY RENT OR QUIT", { bold: true, size: 13, center: true });
            writeLine("(Nonpayment of Rent — Va. Code § 55.1-1245)", { size: 9, center: true });
            y += 8;

            writeLine("FROM: Landlord/Agent", { bold: true });
            writeLine(lastLetter.landlordName);
            writeLine(lastLetter.landlordAddress);
            writeLine(lastLetter.landlordCityStateZip + (lastLetter.landlordPhone ? "   Tel: " + lastLetter.landlordPhone : ""));
            if (lastLetter.landlordEmail) writeLine("Email: " + lastLetter.landlordEmail);
            y += 6;

            writeLine("TO: Tenant(s)", { bold: true });
            writeLine(lastLetter.tenant1 + (lastLetter.tenant2 ? ", " + lastLetter.tenant2 : ""));
            writeLine(lastLetter.tenantAddress);
            writeLine(lastLetter.tenantCityStateZip + (lastLetter.tenantPhone ? "   Tel: " + lastLetter.tenantPhone : ""));
            if (lastLetter.tenantEmail) writeLine("Email: " + lastLetter.tenantEmail);
            y += 10;

            writeLine("You are hereby notified that you have failed to pay rent as required under your rental agreement. The rent set forth below remains unpaid:");
            y += 4;
            writeLine(`${fmt(lastLetter.rentAmount)} rent for the ${lastLetter.rentPeriod}   ${lastLetter.rentFrom} to ${lastLetter.rentTo}`);
            writeLine(`TOTAL DUE: ${fmt(lastLetter.rentAmount)}`, { bold: true });
            y += 8;

            writeLine("You have FOURTEEN (14) DAYS from the date of this notice to pay the total amount due. If the rent is not paid in full within this 14-day period, the landlord intends to terminate the rental agreement and may file an unlawful detainer action in the Prince William County General District Court to obtain possession of the premises. This notice is provided pursuant to Va. Code § 55.1-1245.", { bold: true });
            y += 8;

            writeLine("DATE AND METHOD OF PROVIDING NOTICE", { bold: true });
            writeLine(`This notice is being provided to the tenant by the landlord on ${lastLetter.noticeDate} by ${lastLetter.deliveryMethod}.`);
            y += 10;
            writeLine(`Date: ${lastLetter.noticeDate}                                    Signature: ______________________`);
            y += 14;

            writeLine("This is a template based on current Virginia statutory requirements and is not a substitute for advice from a Virginia-licensed attorney. Verify current requirements before relying on this notice in a legal proceeding.", { size: 8 });

            const safeName = ("va-pay-or-quit-" + (lastLetter.tenant1 || "tenant")).replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "notice";
            doc.save(`${safeName}.pdf`);
            return;
        }

        try {
            const response = await fetch('/api/letter/md-notice-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lastLetter)
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Server error');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'md-notice-of-intent.pdf';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Could not generate PDF: ' + err.message);
        }
    });

    emailBtn.addEventListener("click", async () => {
        if (!lastLetter) { alert("Generate the notice first."); return; }
        if (!lastLetter.tenantEmail) { alert("Enter a tenant email address before sending."); return; }

        if (!confirm(`Send this notice by email to ${lastLetter.tenantEmail}?`)) return;

        emailBtn.disabled = true;
        const originalText = emailBtn.textContent;
        emailBtn.textContent = "Sending…";
        try {
            const response = await fetch('/api/letter/md-notice-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lastLetter)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server error');
            alert(`Notice emailed to ${data.sentTo}.`);
        } catch (err) {
            alert('Could not send email: ' + err.message);
        } finally {
            emailBtn.disabled = false;
            emailBtn.textContent = originalText;
        }
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
    setupLetterForm();
    setupGame();
});
