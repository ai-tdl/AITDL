/*
|| ॐ श्री गणेशाय नमः ||

Organization: AITDL
AITDL — A Living Knowledge Ecosystem for AI Technology Development Lab

Creator: Jawahar R. Mallah
Founder, Author & System Architect

Email: jawahar@aitdl.com
GitHub: https://github.com/jawahar-mallah

Websites:
https://ganitsutram.com
https://aitdl.com

Then: 628 CE · Brahmasphuṭasiddhānta
Now: 8 March MMXXVI · Vikram Samvat 2082

Copyright © aitdl.com · AITDL | GANITSUTRAM.com
*/

/* ─── Particle Canvas ────────────────────────────────────────────────────── */
(function initCanvas() {
    const cv = document.getElementById('cv');
    const ctx = cv.getContext('2d');

    let W, H, pts = [];
    let pColor = [201, 168, 76]; // default gold

    /* Resize handler */
    function resize() {
        W = cv.width = window.innerWidth;
        H = cv.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* Particle class */
    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.s = Math.random() * 1.2 + 0.3;
            this.vx = (Math.random() - 0.5) * 0.28;
            this.vy = (Math.random() - 0.5) * 0.28;
            this.o = Math.random() * 0.4 + 0.1;
            this.sp = Math.random() > 0.85; // special (coloured) particle
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
        }
        draw() {
            const [r, g, b] = pColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
            ctx.fillStyle = this.sp
                ? `rgba(${r},${g},${b},${this.o})`
                : `rgba(255,255,255,${this.o * 0.2})`;
            ctx.fill();
        }
    }

    /* Spawn 90 particles */
    for (let i = 0; i < 90; i++) pts.push(new Particle());

    /* Draw connection lines */
    function drawLines() {
        const [r, g, b] = pColor;
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const dx = pts[i].x - pts[j].x;
                const dy = pts[i].y - pts[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 110) {
                    ctx.beginPath();
                    ctx.moveTo(pts[i].x, pts[i].y);
                    ctx.lineTo(pts[j].x, pts[j].y);
                    ctx.strokeStyle = `rgba(${r},${g},${b},${0.06 * (1 - d / 110)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    /* Animation loop */
    (function animate() {
        ctx.clearRect(0, 0, W, H);
        pts.forEach(p => { p.update(); p.draw(); });
        drawLines();
        requestAnimationFrame(animate);
    })();

    /* Expose colour setter for theme changes */
    window.CANVAS = {
        setColor: function (rgb) { pColor = rgb; },
        resetColor: function () { pColor = [201, 168, 76]; },
    };
})();
