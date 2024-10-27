// Spielvariablen
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let pikachu, bisasam;
let lastTime = 0;
let colorGrid = [];
const CELL_SIZE = 35; // Größe eines Feldes, entspricht der Pokémon-Größe
const THUNDERBOLT_COOLDOWN = 30000; // 30 Sekunden Cooldown
let scores = {
    yellow: 0,  // Pikachu's Punktzahl
    green: 0    // Bisasam's Punktzahl
};

// Konfetti-System
let confetti = [];

// Beeren-System
let berries = [];
const BERRY_SPAWN_INTERVAL = 10000; // Neue Beere alle 10 Sekunden
let lastBerrySpawn = 0;

// Lade das Beeren-Bild einmal am Anfang
const berryImage = new Image();
berryImage.src = 'beere.png';

// Spieler-Klasse
class Player {
    constructor(x, y, image, color, thunderboltKey) {
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.image.src = image;
        this.color = color;
        this.speed = 1; // Geschwindigkeit in Feldern pro Bewegung
        this.thunderboltKey = thunderboltKey; 
        this.thunderboltReady = true;
        this.thunderboltCooldown = 0;
        this.activeEffects = new Map();
        this.thunderboltRadius = 2;
        this.visualX = x * CELL_SIZE;  // Tatsächliche Zeichenposition
        this.visualY = y * CELL_SIZE;
        this.targetX = x * CELL_SIZE;  // Zielposition
        this.targetY = y * CELL_SIZE;
        this.moveSpeed = 0.4;  // Erhöht von 0.2 auf 0.4 für schnellere Bewegung
    }

    draw() {
        // Sanfte Bewegung zur Zielposition
        const dx = this.targetX - this.visualX;
        const dy = this.targetY - this.visualY;
        
        if (Math.abs(dx) > 0.1) this.visualX += dx * this.moveSpeed;
        if (Math.abs(dy) > 0.1) this.visualY += dy * this.moveSpeed;

        // Zeichne Spieler an der visuellen Position
        ctx.drawImage(this.image, this.visualX, this.visualY, CELL_SIZE, CELL_SIZE);
        
        // Zeichne Thunderbolt-Ladestatus
        const barWidth = CELL_SIZE * 0.8;
        const barHeight = 5;
        const barX = this.visualX + (CELL_SIZE - barWidth) / 2;
        const barY = this.visualY - 10;
        
        ctx.fillStyle = 'gray';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const progress = this.thunderboltReady ? 1 : 1 - (this.thunderboltCooldown / THUNDERBOLT_COOLDOWN);
        ctx.fillStyle = this.thunderboltReady ? 'gold' : 'blue';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    }

    move(dx, dy) {
        const newX = this.x + dx * this.speed;
        const newY = this.y + dy * this.speed;
        if (this.canMoveTo(newX, newY)) {
            this.x = newX;
            this.y = newY;
            // Aktualisiere die Zielposition
            this.targetX = this.x * CELL_SIZE;
            this.targetY = this.y * CELL_SIZE;
            this.leaveTrail();
            this.checkCollision();
        }
    }

    canMoveTo(x, y) {
        return x >= 0 && x < colorGrid[0].length && y >= 0 && y < colorGrid.length && 
               colorGrid[y][x] !== this.oppositeColor();
    }

    oppositeColor() {
        return this.color === 'yellow' ? 'green' : 'yellow';
    }

    leaveTrail() {
        if (colorGrid[this.y][this.x] !== this.color) {
            if (colorGrid[this.y][this.x] === this.oppositeColor()) {
                scores[this.oppositeColor()]--; // Punkt vom Gegner abziehen
            }
            colorGrid[this.y][this.x] = this.color;
            scores[this.color]++; // Punkt hinzufügen
        }
    }

    updateThunderbolt(deltaTime) {
        if (!this.thunderboltReady) {
            this.thunderboltCooldown -= deltaTime;
            if (this.thunderboltCooldown <= 0) {
                this.thunderboltReady = true;
                this.thunderboltCooldown = 0;
            }
        }
    }

    forceThunderbolt() {
        // Löst den Blitz aus, ohne den Timer zurückzusetzen
        triggerThunderbolt(this, true);
    }

    useThunderbolt() {
        if (this.thunderboltReady) {
            this.thunderboltReady = false;
            this.thunderboltCooldown = THUNDERBOLT_COOLDOWN;
            const destroyedFields = triggerThunderbolt(this, false);
            // Reduziere den Cooldown basierend auf zerstörten Feldern
            this.thunderboltCooldown -= destroyedFields * 2000; // 2 Sekunden pro zerstörtes Feld
            if (this.thunderboltCooldown <= 0) {
                this.thunderboltReady = true;
                this.thunderboltCooldown = 0;
            }
            return true;
        }
        return false;
    }

    checkCollision() {
        const otherPlayer = this === pikachu ? bisasam : pikachu;
        if ((this.x === otherPlayer.x && Math.abs(this.y - otherPlayer.y) === 1) ||
            (this.y === otherPlayer.y && Math.abs(this.x - otherPlayer.x) === 1)) {
            this.forceThunderbolt();
            otherPlayer.forceThunderbolt();
        }
    }

    applyPowerup(powerupType) {
        const powerup = POWERUP_TYPES[powerupType];
        
        // Wenn ein gleichartiger Effekt bereits aktiv ist, diesen erst entfernen
        if (this.activeEffects.has(powerupType)) {
            clearTimeout(this.activeEffects.get(powerupType));
            powerup.endEffect(this);
        }

        // Effekt anwenden
        powerup.effect(this);

        // Wenn der Powerup eine Dauer hat, Timer setzen
        if (powerup.duration > 0) {
            const timer = setTimeout(() => {
                powerup.endEffect(this);
                this.activeEffects.delete(powerupType);
            }, powerup.duration);
            this.activeEffects.set(powerupType, timer);
        }
    }

    checkBerries() {
        berries = berries.filter(berry => {
            if (this.x === berry.x && this.y === berry.y) {
                this.applyPowerup(berry.powerupType);
                return false; // Beere entfernen
            }
            return true; // Beere behalten
        });
    }

    // Neue Methode zur Überprüfung, ob die Bewegung abgeschlossen ist
    isMoving() {
        return Math.abs(this.targetX - this.visualX) > 0.1 || 
               Math.abs(this.targetY - this.visualY) > 0.1;
    }
}

// Spiel initialisieren
function init() {
    canvas.width = Math.floor(window.innerWidth / CELL_SIZE) * CELL_SIZE;
    canvas.height = Math.floor(window.innerHeight / CELL_SIZE) * CELL_SIZE;
    
    // Punktzahl zurücksetzen
    scores.yellow = 0;
    scores.green = 0;

    // Spieler initialisieren
    pikachu = new Player(1, 1, 'player1.png', 'yellow', '0');
    bisasam = new Player(Math.floor(canvas.width / CELL_SIZE) - 2, 
                        Math.floor(canvas.height / CELL_SIZE) - 2, 
                        'player2.png', 'green', ' ');

    // Farbgitter initialisieren
    for (let y = 0; y < canvas.height / CELL_SIZE; y++) {
        colorGrid[y] = [];
        for (let x = 0; x < canvas.width / CELL_SIZE; x++) {
            colorGrid[y][x] = null;
        }
    }

    // Beeren zurücksetzen
    berries = [];
    lastBerrySpawn = 0;

    // Event-Listener für Tastatureingaben
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation starten
    requestAnimationFrame(gameLoop);

    // Optional: Aktiviere Pixelglätte deaktivieren für schärfere Grafiken
    ctx.imageSmoothingEnabled = false;  // Deaktiviert Pixel-Interpolation
}

// Spielschleife
function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Aktualisiere Spielerbewegungen
    updatePlayerMovements();

    // Beeren-Spawn-Timer
    if (currentTime - lastBerrySpawn > BERRY_SPAWN_INTERVAL) {
        const berry = new Berry();
        if (berry.placeRandomly()) {
            berries.push(berry);
        }
        lastBerrySpawn = currentTime;
    }

    pikachu.updateThunderbolt(deltaTime);
    bisasam.updateThunderbolt(deltaTime);

    // Überprüfe Kollisionen
    pikachu.checkCollision();
    bisasam.checkCollision();

    // Überprüfe Beeren
    pikachu.checkBerries();
    bisasam.checkBerries();

    updateConfetti(deltaTime);
    updateFloatingTexts(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

// Zeichenfunktion
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Zeichne Hintergrund
    ctx.fillStyle = createGradientBackground(ctx, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Zeichne ein subtiles Gittermuster
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Farbspuren mit Schatten und Glanz zeichnen
    for (let y = 0; y < colorGrid.length; y++) {
        for (let x = 0; x < colorGrid[y].length; x++) {
            if (colorGrid[y][x]) {
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                // Hauptfarbe mit Transparenz
                ctx.fillStyle = colorGrid[y][x].replace(')', ', 0.8)').replace('rgb', 'rgba');
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                
                // Glanzeffekt
                const gradient = ctx.createLinearGradient(
                    x * CELL_SIZE, y * CELL_SIZE,
                    x * CELL_SIZE, y * CELL_SIZE + CELL_SIZE
                );
                gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                
                ctx.restore();
            }
        }
    }

    // Verbesserte Beeren-Darstellung
    berries.forEach(berry => {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        berry.draw();
        // Glitzernder Effekt
        if (Math.random() > 0.9) {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(
                berry.x * CELL_SIZE + CELL_SIZE/2, 
                berry.y * CELL_SIZE + CELL_SIZE/2, 
                2, 0, Math.PI * 2
            );
            ctx.fill();
        }
        ctx.restore();
    });

    // Verbesserte Spieler-Darstellung
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    pikachu.draw();
    bisasam.draw();
    ctx.restore();

    // Verbessertes Konfetti
    drawConfetti();

    // Verbesserte Punktzahl-Anzeige
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.roundRect(5, 5, 140, 30, 5);
    ctx.roundRect(canvas.width - 145, 5, 140, 30, 5);
    ctx.fill();
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'yellow';
    ctx.fillText(`Pikachu: ${scores.yellow}`, 10, 25);
    ctx.fillStyle = 'green';
    ctx.fillText(`Bisasam: ${scores.green}`, canvas.width - 140, 25);
    ctx.restore();

    drawFloatingTexts();
}

// Tastatureingaben verarbeiten
function handleKeyDown(e) {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
    // Thunderbolt-Tasten
    if (e.key === '0') pikachu.useThunderbolt();
    if (e.key === ' ') bisasam.useThunderbolt();
}

function handleKeyUp(e) {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
}

// Füge diese neue Funktion hinzu
function updatePlayerMovements() {
    const currentTime = Date.now();
    if (currentTime - lastMovementTime < MOVEMENT_DELAY) return;
    
    let moved = false;
    
    // Nur bewegen, wenn keine Animation läuft
    if (!pikachu.isMoving()) {
        if (keys.ArrowUp) { pikachu.move(0, -1); moved = true; }
        if (keys.ArrowDown) { pikachu.move(0, 1); moved = true; }
        if (keys.ArrowLeft) { pikachu.move(-1, 0); moved = true; }
        if (keys.ArrowRight) { pikachu.move(1, 0); moved = true; }
    }

    if (!bisasam.isMoving()) {
        if (keys.w) { bisasam.move(0, -1); moved = true; }
        if (keys.s) { bisasam.move(0, 1); moved = true; }
        if (keys.a) { bisasam.move(-1, 0); moved = true; }
        if (keys.d) { bisasam.move(1, 0); moved = true; }
    }

    if (moved) {
        lastMovementTime = currentTime;
    }
}

// Blitz-Fähigkeit auslösen
function triggerThunderbolt(player, isCollision) {
    const radius = isCollision ? 1 : player.thunderboltRadius;
    createExplosionEffect(player.x, player.y, radius, player.color);
    return useThunderbolt(player, radius);
}

// Blitz-Fähigkeit
function useThunderbolt(player, radius) {
    let destroyedFields = 0;
    for (let y = player.y - radius; y <= player.y + radius; y++) {
        for (let x = player.x - radius; x <= player.x + radius; x++) {
            if (y >= 0 && y < colorGrid.length && x >= 0 && x < colorGrid[0].length) {
                if (colorGrid[y][x] === player.oppositeColor()) {
                    createConfetti(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);
                    scores[player.oppositeColor()]--;
                    colorGrid[y][x] = null;
                    destroyedFields++;
                }
            }
        }
    }
    return destroyedFields; // Gib die Anzahl der zerstörten Felder zurück
}

// Konfetti-System
function createConfetti(x, y) {
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 2 + Math.random() * 2;
        confetti.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            color: getRandomColor(),
            size: Math.random() * 3 + 1,
            lifetime: 1000 + Math.random() * 1000,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }
}

function updateConfetti(deltaTime) {
    confetti = confetti.filter(particle => {
        if (particle.type === 'ring') {
            // Update Explosionsring
            particle.radius += (particle.maxRadius - particle.radius) * 0.2;
            particle.lifetime -= deltaTime;
            return particle.lifetime > 0;
        } else if (particle.type === 'explosion') {
            // Update Explosionspartikel
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            particle.lifetime -= deltaTime;
            particle.alpha = particle.lifetime / 500;
            return particle.lifetime > 0;
        } else {
            // Normales Konfetti
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.lifetime -= deltaTime;
            return particle.lifetime > 0;
        }
    });
}

function drawConfetti() {
    confetti.forEach(particle => {
        ctx.save();
        if (particle.type === 'ring') {
            // Zeichne Explosionsring
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
        } else if (particle.type === 'explosion') {
            // Zeichne Explosionspartikel
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Zeichne normales Konfetti
            ctx.translate(particle.x, particle.y);
            ctx.rotate((particle.rotation + particle.rotationSpeed) * Math.PI / 180);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.lifetime / 1000;
            ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
        }
        ctx.restore();
    });
}

// Füge diese Funktion hinzu, um zufällige Farben zu generieren
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

// Spiel starten
window.onload = init;

// Füge diese Funktionen am Anfang hinzu
function createGradientBackground(ctx, width, height) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#87CEEB');   // Himmelblau
    gradient.addColorStop(1, '#4CA1AF');   // Türkis
    return gradient;
}

// Am Anfang der Datei bei den Konstanten
const POWERUP_TYPES = {
    SPEED: {
        color: 'blue',
        duration: 5000,
        effect: (player) => {
            player.speed = 2;
            createFloatingText(`Speed Up!`, player.x * CELL_SIZE, player.y * CELL_SIZE - 20, player.color);
        },
        endEffect: (player) => {
            player.speed = 1;
        }
    },
    RANGE: {
        color: 'orange',
        duration: 10000,
        effect: (player) => {
            player.thunderboltRadius = 3;
            createFloatingText(`Range Up!`, player.x * CELL_SIZE, player.y * CELL_SIZE - 20, player.color);
        },
        endEffect: (player) => {
            player.thunderboltRadius = 2;
        }
    },
    INSTANT_CHARGE: {
        color: 'purple',
        duration: 0,
        effect: (player) => {
            player.thunderboltReady = true;
            player.thunderboltCooldown = 0;
            createFloatingText(`Charged!`, player.x * CELL_SIZE, player.y * CELL_SIZE - 20, player.color);
        },
        endEffect: () => {}
    }
};

// Beeren-Klasse überarbeiten
class Berry {
    constructor() {
        this.powerupType = this.getRandomPowerup();
        this.placeRandomly();
    }

    getRandomPowerup() {
        const types = Object.keys(POWERUP_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    placeRandomly() {
        let attempts = 0;
        const maxAttempts = 100;

        do {
            this.x = Math.floor(Math.random() * (colorGrid[0].length));
            this.y = Math.floor(Math.random() * (colorGrid.length));
            attempts++;
            if (attempts > maxAttempts) return false;
        } while (colorGrid[this.y][this.x] !== null);
        
        return true;
    }

    draw() {
        const centerX = this.x * CELL_SIZE + CELL_SIZE/2;
        const centerY = this.y * CELL_SIZE + CELL_SIZE/2;
        const radius = CELL_SIZE/3;

        // Beeren-Grundform
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = POWERUP_TYPES[this.powerupType].color;
        ctx.fill();
        
        // Glanzeffekt
        ctx.beginPath();
        ctx.arc(centerX - radius/3, centerY - radius/3, radius/4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fill();
    }
}

// Schwebenden Text für Powerup-Effekte hinzufügen
let floatingTexts = [];

function createFloatingText(text, x, y, color) {
    floatingTexts.push({
        text,
        x,
        y,
        color,
        lifetime: 1000,
        velocity: -2
    });
}

function updateFloatingTexts(deltaTime) {
    floatingTexts = floatingTexts.filter(text => {
        text.y += text.velocity;
        text.lifetime -= deltaTime;
        return text.lifetime > 0;
    });
}

function drawFloatingTexts() {
    floatingTexts.forEach(text => {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = text.color;
        ctx.globalAlpha = text.lifetime / 1000;
        ctx.textAlign = 'center';
        ctx.fillText(text.text, text.x, text.y);
        ctx.restore();
    });
}

// Am Anfang der Datei bei den Variablen
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false
};

// Am Anfang der Datei bei den Variablen
const MOVEMENT_DELAY = 50; // Von 100 auf 50 Millisekunden reduziert
let lastMovementTime = 0;

// Füge diese Funktion hinzu
function createExplosionEffect(centerX, centerY, radius, color) {
    const baseColor = color === 'yellow' ? 
        { r: 255, g: 215, b: 0 } : // Gold für Pikachu
        { r: 144, g: 238, b: 144 }; // Hellgrün für Bisasam

    // Hauptexplosionsring
    confetti.push({
        x: centerX * CELL_SIZE + CELL_SIZE/2,
        y: centerY * CELL_SIZE + CELL_SIZE/2,
        radius: 0,
        maxRadius: radius * CELL_SIZE,
        color: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.3)`,
        lifetime: 400,
        type: 'ring',
        startTime: Date.now()
    });

    // Sekundärer Ring (verzögert)
    confetti.push({
        x: centerX * CELL_SIZE + CELL_SIZE/2,
        y: centerY * CELL_SIZE + CELL_SIZE/2,
        radius: 0,
        maxRadius: radius * CELL_SIZE * 0.8,
        color: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.4)`,
        lifetime: 300,
        type: 'ring',
        startTime: Date.now() + 100
    });

    // Explosionspartikel
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 4 + Math.random() * 4;
        const size = 2 + Math.random() * 3;
        const lifetime = 500 + Math.random() * 300;

        // Hauptpartikel
        confetti.push({
            x: centerX * CELL_SIZE + CELL_SIZE/2,
            y: centerY * CELL_SIZE + CELL_SIZE/2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 1)`,
            size: size,
            lifetime: lifetime,
            alpha: 1,
            type: 'explosion',
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15
        });

        // Glitzernde Partikel
        if (Math.random() > 0.5) {
            confetti.push({
                x: centerX * CELL_SIZE + CELL_SIZE/2,
                y: centerY * CELL_SIZE + CELL_SIZE/2,
                vx: Math.cos(angle) * (speed * 0.7),
                vy: Math.sin(angle) * (speed * 0.7),
                color: 'rgba(255, 255, 255, 0.9)',
                size: size * 0.6,
                lifetime: lifetime * 0.8,
                alpha: 1,
                type: 'sparkle',
                pulseSpeed: 0.05 + Math.random() * 0.05
            });
        }
    }

    // Zentrale Blitzeffekte
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        confetti.push({
            x: centerX * CELL_SIZE + CELL_SIZE/2,
            y: centerY * CELL_SIZE + CELL_SIZE/2,
            length: radius * CELL_SIZE * 0.7,
            angle: angle,
            color: `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.8)`,
            lifetime: 200,
            type: 'lightning',
            width: 3
        });
    }
}

function updateConfetti(deltaTime) {
    confetti = confetti.filter(particle => {
        if (particle.type === 'ring') {
            if (Date.now() < particle.startTime) return true;
            particle.radius += (particle.maxRadius - particle.radius) * 0.2;
            particle.lifetime -= deltaTime;
            return particle.lifetime > 0;
        } else if (particle.type === 'explosion') {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.96;
            particle.vy *= 0.96;
            particle.rotation += particle.rotationSpeed;
            particle.lifetime -= deltaTime;
            particle.alpha = particle.lifetime / 500;
            return particle.lifetime > 0;
        } else if (particle.type === 'sparkle') {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.lifetime -= deltaTime;
            particle.alpha = (1 + Math.sin(Date.now() * particle.pulseSpeed)) * 0.5 * (particle.lifetime / 500);
            return particle.lifetime > 0;
        } else if (particle.type === 'lightning') {
            particle.lifetime -= deltaTime;
            return particle.lifetime > 0;
        }
        return false;
    });
}

function drawConfetti() {
    confetti.forEach(particle => {
        ctx.save();
        if (particle.type === 'ring') {
            if (Date.now() >= particle.startTime) {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
            }
        } else if (particle.type === 'explosion') {
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation * Math.PI / 180);
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
        } else if (particle.type === 'sparkle') {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (particle.type === 'lightning') {
            const progress = particle.lifetime / 200;
            ctx.globalAlpha = progress;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = particle.width;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            const endX = particle.x + Math.cos(particle.angle) * particle.length * progress;
            const endY = particle.y + Math.sin(particle.angle) * particle.length * progress;
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        ctx.restore();
    });
}
