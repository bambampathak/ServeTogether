import { useEffect, useRef } from 'react';

export function useScrollAnimation(options = {}) {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -50px 0px',
    once = true,
  } = options;

  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe the element itself and all children with scroll-animate classes
    const animateElements = element.querySelectorAll(
      '.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale'
    );

    if (animateElements.length > 0) {
      animateElements.forEach((el) => observer.observe(el));
    } else {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return ref;
}

export default useScrollAnimation;
