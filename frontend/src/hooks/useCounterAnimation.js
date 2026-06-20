import { useEffect, useRef, useState } from 'react';

export function useCounterAnimation(options = {}) {
  const {
    duration = 2000,
    threshold = 0.15,
    once = true,
  } = options;

  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animateCounters = () => {
      const counters = element.querySelectorAll('.counter-number');
      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute('data-count'), 10);
        if (isNaN(target)) return;

        const start = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease-out cubic for smooth deceleration
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(start + (target - start) * eased);

          counter.textContent = current;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
            // Add the suffix (like +) if specified
            const suffix = counter.getAttribute('data-suffix') || '';
            counter.textContent = target + suffix;
          }
        };

        requestAnimationFrame(updateCounter);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            animateCounters();
            setHasAnimated(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [duration, threshold, once, hasAnimated]);

  return ref;
}

export default useCounterAnimation;
