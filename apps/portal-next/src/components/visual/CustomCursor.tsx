'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
    const curRef = useRef<HTMLDivElement>(null);
    const curRRef = useRef<HTMLDivElement>(null);
    const [isIdle, setIsIdle] = useState(false);
    const idleTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const cur = curRef.current;
        const curR = curRRef.current;
        if (!cur || !curR) return;

        let mx = 0, my = 0, rx = 0, ry = 0;

        const resetIdle = () => {
            setIsIdle(false);
            if (idleTimer.current) clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(() => setIsIdle(true), 2000);
        };

        const onMouseMove = (e: MouseEvent) => {
            mx = e.clientX;
            my = e.clientY;
            cur.style.left = `${mx}px`;
            cur.style.top = `${my}px`;
            resetIdle();
        };

        const animateR = () => {
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            curR.style.left = `${rx}px`;
            curR.style.top = `${ry}px`;
            requestAnimationFrame(animateR);
        };

        window.addEventListener('mousemove', onMouseMove);
        const animId = requestAnimationFrame(animateR);
        resetIdle();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animId);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };
    }, []);

    return (
        <>
        <div id="cur" ref={curRef} className={`hidden md:block fixed pointer-events-none z-[10000] transition-opacity duration-1000 ${isIdle ? 'opacity-0' : 'opacity-100'}`} />
        <div id="curR" ref={curRRef} className={`hidden md:block fixed pointer-events-none z-[10000] transition-opacity duration-1000 ${isIdle ? 'opacity-0' : 'opacity-100'}`} />
        </>
    );
}
