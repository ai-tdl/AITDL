"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RevealOnScroll() {
    const pathname = usePathname();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("rv-on");
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        const observeElements = () => {
            const elements = document.querySelectorAll(".rv");
            elements.forEach((el) => observer.observe(el));
        };

        // Small delay to ensure the DOM is painted after route change
        const timeoutId = setTimeout(observeElements, 100);

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [pathname]);

    return null;
}
