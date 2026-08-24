import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

export default function AnimatedCounter({ to, from = 0, duration = 1.5, className, prefix = '', suffix = '' }) {
  const nodeRef = useRef();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView && nodeRef.current) {
      const node = nodeRef.current;
      const controls = animate(from, to, {
        duration: duration,
        onUpdate(value) {
          if (node) {
            node.textContent = `${prefix}${Math.round(value)}${suffix}`;
          }
        },
      });
      return () => controls.stop();
    }
  }, [inView, from, to, duration, prefix, suffix]);

  return <span ref={nodeRef} className={className}>{prefix}{from}{suffix}</span>;
}