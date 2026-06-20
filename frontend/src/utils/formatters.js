import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';

/**
 * Format a date string for display
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'dd MMM yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
    if (!date) return 'N/A';
    try {
        const dateObj = new Date(date);
        return format(dateObj, formatStr);
    } catch {
        return 'N/A';
    }
};

/**
 * Format a date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateWithTime = (date) => {
    if (!date) return 'N/A';
    try {
        const dateObj = new Date(date);
        return format(dateObj, 'dd MMM yyyy, hh:mm a');
    } catch {
        return 'N/A';
    }
};

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    if (!date) return 'N/A';
    try {
        const dateObj = new Date(date);
        return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
        return 'N/A';
    }
};

/**
 * Format a date with smart labels (Today, Tomorrow, Yesterday, or formatted date)
 * @param {string|Date} date - Date to format
 * @returns {string} Smart formatted date string
 */
export const formatSmartDate = (date) => {
    if (!date) return 'N/A';
    try {
        const dateObj = new Date(date);
        if (isToday(dateObj)) return 'Today';
        if (isTomorrow(dateObj)) return 'Tomorrow';
        if (isYesterday(dateObj)) return 'Yesterday';
        return format(dateObj, 'dd MMM yyyy');
    } catch {
        return 'N/A';
    }
};

/**
 * Format hours with proper decimal handling
 * @param {number} hours - Hours to format
 * @returns {string} Formatted hours string
 */
export const formatHours = (hours) => {
    if (!hours || hours === 0) return '0h';
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) return `${wholeHours}h`;
    return `${wholeHours}h ${minutes}min`;
};

/**
 * Format points with proper display
 * @param {number} points - Points to format
 * @returns {string} Formatted points string
 */
export const formatPoints = (points) => {
    if (!points || points === 0) return '0 pts';
    if (points >= 1000) return `${(points / 1000).toFixed(1)}k pts`;
    return `${points} pts`;
};

/**
 * Format a phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
};

/**
 * Format availability object for display
 * @param {Object} availability - Availability object with boolean flags
 * @returns {string} Formatted availability string
 */
export const formatAvailability = (availability) => {
    if (!availability) return 'Not specified';
    const parts = [];
    if (availability.weekdays) parts.push('Weekdays');
    if (availability.weekends) parts.push('Weekends');
    if (availability.morning) parts.push('Morning');
    if (availability.afternoon) parts.push('Afternoon');
    if (availability.evening) parts.push('Evening');
    return parts.length > 0 ? parts.join(', ') : 'Not specified';
};

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 100)
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

/**
 * Get status badge color class based on status
 * @param {string} status - Status string
 * @returns {string} CSS class name for the badge
 */
export const getStatusColor = (status) => {
    const colorMap = {
        pending: 'badge-pending',
        approved: 'badge-approved',
        active: 'badge-active',
        rejected: 'badge-rejected',
        inactive: 'badge-inactive',
        upcoming: 'badge-upcoming',
        ongoing: 'badge-ongoing',
        completed: 'badge-completed',
        cancelled: 'badge-cancelled',
        draft: 'badge-draft',
        checkedIn: 'badge-checked-in',
        checkedOut: 'badge-checked-out',
        registered: 'badge-registered',
        confirmed: 'badge-confirmed',
        generated: 'badge-generated',
    };
    return colorMap[status] || 'badge-default';
};

/**
 * Get a human-readable status label
 * @param {string} status - Status string
 * @returns {string} Human-readable status label
 */
export const getStatusLabel = (status) => {
    const labelMap = {
        pending: 'Pending Review',
        approved: 'Approved',
        active: 'Active',
        rejected: 'Rejected',
        inactive: 'Inactive',
        upcoming: 'Upcoming',
        ongoing: 'Ongoing',
        completed: 'Completed',
        cancelled: 'Cancelled',
        draft: 'Draft',
        checked_in: 'Checked In',
        checked_out: 'Checked Out',
        registered: 'Registered',
        confirmed: 'Confirmed',
        generated: 'Generated',
    };
    return labelMap[status] || status;
};

/**
 * Format category name for display
 * @param {string} category - Category enum value
 * @returns {string} Formatted category name
 */
export const formatCategory = (category) => {
    if (!category) return 'N/A';
    return category;
};

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
