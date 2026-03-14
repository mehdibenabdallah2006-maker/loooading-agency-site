/**
 * Loooading Agency - Immersive 3D Bubble Background
 * Featuring volumetric rendering, parallax depth, and dynamic lighting.
 */

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 2 + 1;
        this.velocityX = (Math.random() - 0.5) * 6;
        this.velocityY = (Math.random() - 0.5) * 6;
        this.opacity = 1;
        this.gravity = 0.05;
        this.friction = 0.98;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;
        this.velocityY += this.gravity;
        this.opacity -= 0.02;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Bubble {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Depth layer: 0.5 (far) to 1.5 (near)
        this.depth = options.depth || (0.5 + Math.random() * 1.0);
        
        // Base radius scaled by depth
        const baseRadius = options.radius || (Math.random() * 25 + 15);
        this.radius = baseRadius * this.depth;
        
        this.color = options.color || '#ff4d2e';
        this.isPopped = false;
        
        const margin = 100 * this.depth;

        if (options.isInitial) {
            // Spawn anywhere inside the canvas but avoid the center
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            
            // If spawned in center, push to edges
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const distFromCenter = Math.sqrt((this.x - centerX) ** 2 + (this.y - centerY) ** 2);
            const exclusionZone = 250; 

            if (distFromCenter < exclusionZone) {
                const angle = Math.random() * Math.PI * 2;
                this.x = centerX + Math.cos(angle) * (exclusionZone + Math.random() * 100);
                this.y = centerY + Math.sin(angle) * (exclusionZone + Math.random() * 100);
            }
        } else {
            // Standard Spawning (mostly around edges)
            const side = Math.floor(Math.random() * 4);
            switch(side) {
                case 0: this.x = Math.random() * canvas.width; this.y = -margin; break;
                case 1: this.x = canvas.width + margin; this.y = Math.random() * canvas.height; break;
                case 2: this.x = Math.random() * canvas.width; this.y = canvas.height + margin; break;
                case 3: this.x = -margin; this.y = Math.random() * canvas.height; break;
            }
        }

        // Speed scaled by depth for parallax
        this.speedX = (Math.random() - 0.5) * 0.5 * this.depth;
        this.speedY = (Math.random() - 0.5) * 0.5 * this.depth;
        
        this.floatAmplitude = (Math.random() * 0.4 + 0.1) * this.depth;
        this.floatSpeed = Math.random() * 0.015 + 0.005;
        this.angle = Math.random() * Math.PI * 2;
        
        // Parallax offset
        this.parallaxX = 0;
        this.parallaxY = 0;
    }

    update(mouseX, mouseY, parallaxIntensity) {
        if (this.isPopped) return;
        
        this.angle += this.floatSpeed;
        
        // Basic floating movement
        this.x += this.speedX + Math.sin(this.angle) * this.floatAmplitude;
        this.y += this.speedY + Math.cos(this.angle) * this.floatAmplitude;

        // Apply Parallax based on depth
        // Objects further away (low depth) move less with the mouse
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const targetParallaxX = (mouseX - centerX) * (this.depth - 0.5) * parallaxIntensity;
        const targetParallaxY = (mouseY - centerY) * (this.depth - 0.5) * parallaxIntensity;
        
        // Smooth interpolation for parallax
        this.parallaxX += (targetParallaxX - this.parallaxX) * 0.1;
        this.parallaxY += (targetParallaxY - this.parallaxY) * 0.1;

        const buffer = this.radius * 3;
        if (this.x < -buffer) this.x = this.canvas.width + buffer;
        if (this.x > this.canvas.width + buffer) this.x = -buffer;
        if (this.y < -buffer) this.y = this.canvas.height + buffer;
        if (this.y > this.canvas.height + buffer) this.y = -buffer;
    }

    draw(mouseX, mouseY) {
        if (this.isPopped) return;
        
        const drawX = this.x + this.parallaxX;
        const drawY = this.y + this.parallaxY;
        
        this.ctx.save();
        
        // 1. Soft Drop Shadow (Depth)
        this.ctx.shadowBlur = 12 * this.depth;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
        this.ctx.shadowOffsetX = 2 * this.depth;
        this.ctx.shadowOffsetY = 4 * this.depth;

        // 2. Main Liquid Glass Sphere (High Transparency)
        const mainGradient = this.ctx.createRadialGradient(
            drawX - this.radius * 0.2, 
            drawY - this.radius * 0.2, 
            0, 
            drawX, 
            drawY, 
            this.radius
        );
        
        if (this.color === '#ff4d2e') {
            mainGradient.addColorStop(0, 'rgba(255, 122, 92, 0.2)');
            mainGradient.addColorStop(0.5, 'rgba(255, 77, 46, 0.15)');
            mainGradient.addColorStop(1, 'rgba(214, 52, 26, 0.1)');
        } else {
            mainGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
            mainGradient.addColorStop(0.5, 'rgba(240, 240, 240, 0.15)');
            mainGradient.addColorStop(1, 'rgba(216, 216, 216, 0.1)');
        }
        
        this.ctx.beginPath();
        this.ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = mainGradient;
        this.ctx.fill();

        // 3. Inner Fresnel/Refraction Highlight (Thick edges feel)
        this.ctx.globalAlpha = 0.2 * this.depth;
        this.ctx.strokeStyle = this.color === '#ff4d2e' ? 'rgba(255, 77, 46, 0.4)' : 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // 4. Dynamic Cursor Lighting (Highlight shifts towards mouse)
        const dx = mouseX - drawX;
        const dy = mouseY - drawY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxLightShift = this.radius * 0.45;
        const lightShiftX = (dx / (dist || 1)) * Math.min(dist * 0.06, maxLightShift);
        const lightShiftY = (dy / (dist || 1)) * Math.min(dist * 0.06, maxLightShift);

        const highlightGradient = this.ctx.createRadialGradient(
            drawX + lightShiftX, 
            drawY + lightShiftY, 
            0, 
            drawX + lightShiftX, 
            drawY + lightShiftY, 
            this.radius * 0.7
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = highlightGradient;
        this.ctx.fill();

        // 5. Specular Reflection (Glassy Surface)
        const specularX = drawX - this.radius * 0.35;
        const specularY = drawY - this.radius * 0.35;
        const specularGradient = this.ctx.createRadialGradient(
            specularX, specularY, 0, specularX, specularY, this.radius * 0.35
        );
        specularGradient.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
        specularGradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.1)');
        specularGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = specularGradient;
        this.ctx.fill();

        this.ctx.restore();
    }

    pop() {
        this.isPopped = true;
        const particles = [];
        const count = 10 + Math.floor(Math.random() * 10);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(this.x + this.parallaxX, this.y + this.parallaxY, this.color));
        }
        return particles;
    }

    isHit(mx, my) {
        const dx = mx - (this.x + this.parallaxX);
        const dy = my - (this.y + this.parallaxY);
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }
}

class BubbleBackground {
    constructor() {
        this.canvas = document.getElementById('bubble-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.bubbles = [];
        this.particles = [];
        this.bubbleCount = 18; // More bubbles for depth layers
        
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.parallaxIntensity = 0.05;
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        window.addEventListener('click', (e) => this.handleClick(e));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        for (let i = 0; i < this.bubbleCount; i++) {
            this.createBubble(true);
        }
    }

    createBubble(isInitial = false) {
        const colors = ['#ff4d2e', '#ff4d2e', '#ff4d2e', '#ffffff', '#e0e0e0'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.bubbles.push(new Bubble(this.canvas, { color, isInitial }));
        // Keep sorted for correct rendering depth
        this.bubbles.sort((a, b) => a.depth - b.depth);
    }

    handleClick(e) {
        const mx = e.clientX;
        const my = e.clientY;
        
        // Reverse iterate to hit closer bubbles first
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            if (this.bubbles[i].isHit(mx, my)) {
                const newParticles = this.bubbles[i].pop();
                this.particles.push(...newParticles);
                this.bubbles.splice(i, 1);
                
                setTimeout(() => this.createBubble(), 2000);
                break;
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw bubbles (sorted by depth)
        this.bubbles.forEach(bubble => {
            bubble.update(this.mouseX, this.mouseY, this.parallaxIntensity);
            bubble.draw(this.mouseX, this.mouseY);
        });
        
        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].opacity <= 0) {
                this.particles.splice(i, 1);
            } else {
                this.particles[i].draw(this.ctx);
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BubbleBackground();
});
