'use client';

import { useEffect, useRef } from 'react';

export default function CanvasBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let W: number, H: number;
        let pts: P[] = [];

        // We'll use a CSS variable for the color to allow theme switching
        const getThemeColor = () => {
            const style = getComputedStyle(document.body);
            const colorStr = style.getPropertyValue('--primary').trim() || '201, 168, 76';
            return colorStr.split(',').map(n => parseInt(n));
        };

        class P {
            x: number = 0;
            y: number = 0;
            s: number = 0;
            vx: number = 0;
            vy: number = 0;
            o: number = 0;
            sp: boolean = false;

            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.s = Math.random() * 1.2 + 0.3;
                this.vx = (Math.random() - 0.5) * 0.28;
                this.vy = (Math.random() - 0.5) * 0.28;
                this.o = Math.random() * 0.4 + 0.1;
                this.sp = Math.random() > 0.85;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
            }

            draw() {
                const [r, g, b] = getThemeColor();
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.s, 0, Math.PI * 2);
                ctx!.fillStyle = this.sp ? `rgba(${r},${g},${b},${this.o})` : `rgba(255,255,255,${this.o * 0.2})`;
                ctx!.fill();
            }
        }

        const resize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        };

        const drawLines = () => {
            const [r, g, b] = getThemeColor();
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x;
                    const dy = pts[i].y - pts[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 110) {
                        ctx!.beginPath();
                        ctx!.moveTo(pts[i].x, pts[i].y);
                        ctx!.lineTo(pts[j].x, pts[j].y);
                        ctx!.strokeStyle = `rgba(${r},${g},${b},${0.06 * (1 - d / 110)})`;
                        ctx!.lineWidth = 0.5;
                        ctx!.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx!.clearRect(0, 0, W, H);
            pts.forEach(p => {
                p.update();
                p.draw();
            });
            drawLines();
            requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener('resize', resize);

        pts = [];
        for (let i = 0; i < 90; i++) pts.push(new P());

        const animId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            id="cv"
            className="fixed inset-0 pointer-events-none z-[-1]"
        />
    );
}
