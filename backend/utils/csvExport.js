/**
 * Export volunteer data to CSV format
 * @param {Array} volunteers - Array of volunteer objects
 * @returns {string} CSV string
 */
const exportVolunteersCSV = (volunteers) => {
    const headers = [
        'Name',
        'Email',
        'Phone',
        'Age',
        'Gender',
        'City',
        'Skills',
        'Availability',
        'Status',
        'Total Hours',
        'Total Events',
        'Points',
        'Emergency Contact Name',
        'Emergency Contact Phone',
        'Emergency Contact Relationship',
        'Registered Date'
    ];

    const rows = volunteers.map(v => [
        v.name,
        v.email,
        v.phone,
        v.age,
        v.gender,
        v.city,
        v.skills ? v.skills.join('; ') : '',
        formatAvailability(v.availability),
        v.status,
        v.totalHours,
        v.totalEvents,
        v.points,
        v.emergencyContact ? v.emergencyContact.name : '',
        v.emergencyContact ? v.emergencyContact.phone : '',
        v.emergencyContact ? v.emergencyContact.relationship : '',
        v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-IN') : ''
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
};

/**
 * Export event data to CSV format
 * @param {Array} events - Array of event objects
 * @returns {string} CSV string
 */
const exportEventsCSV = (events) => {
    const headers = [
        'Title',
        'Category',
        'Date',
        'Time',
        'Location',
        'City',
        'Max Volunteers',
        'Current Volunteers',
        'Required Skills',
        'Status',
        'Created Date'
    ];

    const rows = events.map(e => [
        e.title,
        e.category,
        e.date ? new Date(e.date).toLocaleDateString('en-IN') : '',
        e.time,
        e.location ? e.location.address : '',
        e.location ? e.location.city : '',
        e.maxVolunteers,
        e.currentVolunteers,
        e.requiredSkills ? e.requiredSkills.join('; ') : '',
        e.status,
        e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN') : ''
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
};

/**
 * Export attendance data to CSV format
 * @param {Array} attendanceRecords - Array of attendance objects
 * @returns {string} CSV string
 */
const exportAttendanceCSV = (attendanceRecords) => {
    const headers = [
        'Volunteer Name',
        'Volunteer Email',
        'Event Title',
        'Check In Time',
        'Check Out Time',
        'Hours Volunteered',
        'Check In Method',
        'Status'
    ];

    const rows = attendanceRecords.map(a => [
        a.volunteer ? a.volunteer.name : '',
        a.volunteer ? a.volunteer.email : '',
        a.event ? a.event.title : '',
        a.checkInTime ? new Date(a.checkInTime).toLocaleString('en-IN') : '',
        a.checkOutTime ? new Date(a.checkOutTime).toLocaleString('en-IN') : '',
        a.hoursVolunteered,
        a.checkInMethod,
        a.status
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
};

/**
 * Format availability object to string
 */
const formatAvailability = (availability) => {
    if (!availability) return '';
    const parts = [];
    if (availability.weekdays) parts.push('Weekdays');
    if (availability.weekends) parts.push('Weekends');
    if (availability.morning) parts.push('Morning');
    if (availability.afternoon) parts.push('Afternoon');
    if (availability.evening) parts.push('Evening');
    return parts.join('; ');
};

module.exports = {
    exportVolunteersCSV,
    exportEventsCSV,
    exportAttendanceCSV
};
