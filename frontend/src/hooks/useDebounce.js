import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value by a specified delay.
 * Useful for search inputs to avoid making API calls on every keystroke.
 *
 * @param {string} value - The value to debounce
 * @param {number} delay - The debounce delay in milliseconds (default: 300ms)
 * @returns {string} The debounced value
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 *
 * useEffect(() => {
 *     if (debouncedSearch) {
 *         fetchResults(debouncedSearch);
 *     }
 * }, [debouncedSearch]);
 */
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
