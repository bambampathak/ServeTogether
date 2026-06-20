/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export const isValidPhone = (phone) => {
    if (!phone) return false;
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleaned = phone.replace(/\D/g, '');
    return phoneRegex.test(cleaned) || cleaned.length >= 10;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
    if (!password) return { isValid: false, message: 'Password is required' };
    if (password.length < 6) return { isValid: false, message: 'Password must be at least 6 characters' };
    if (password.length < 8) return { isValid: true, message: 'Password is weak. Consider using 8+ characters.' };

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (strength < 2) return { isValid: true, message: 'Password is weak. Add uppercase, numbers, or special characters.' };
    if (strength < 3) return { isValid: true, message: 'Password is moderate.' };
    return { isValid: true, message: 'Password is strong.' };
};

/**
 * Validate age for volunteering (minimum 16)
 * @param {number|string} age - Age to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateAge = (age) => {
    const numAge = parseInt(age);
    if (!age && age !== 0) return { isValid: false, message: 'Age is required' };
    if (isNaN(numAge)) return { isValid: false, message: 'Age must be a number' };
    if (numAge < 16) return { isValid: false, message: 'Volunteer must be at least 16 years old' };
    if (numAge > 100) return { isValid: false, message: 'Please enter a valid age' };
    return { isValid: true, message: '' };
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} Validation result with isValid and message
 */
export const validateRequired = (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return { isValid: false, message: `${fieldName} is required` };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateName = (name) => {
    if (!name || name.trim() === '') return { isValid: false, message: 'Name is required' };
    if (name.trim().length < 2) return { isValid: false, message: 'Name must be at least 2 characters' };
    if (name.trim().length > 50) return { isValid: false, message: 'Name cannot exceed 50 characters' };
    return { isValid: true, message: '' };
};

/**
 * Validate city name
 * @param {string} city - City to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateCity = (city) => {
    if (!city || city.trim() === '') return { isValid: false, message: 'City is required' };
    if (city.trim().length < 2) return { isValid: false, message: 'City name must be at least 2 characters' };
    return { isValid: true, message: '' };
};

/**
 * Validate skills selection (at least one required)
 * @param {Array} skills - Skills array to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateSkills = (skills) => {
    if (!skills || skills.length === 0) {
        return { isValid: false, message: 'Please select at least one skill' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate emergency contact information
 * @param {Object} contact - Emergency contact object { name, phone, relationship }
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateEmergencyContact = (contact) => {
    const errors = {};

    if (!contact.name || contact.name.trim() === '') {
        errors.name = 'Emergency contact name is required';
    }
    if (!contact.phone || contact.phone.trim() === '') {
        errors.phone = 'Emergency contact phone is required';
    } else if (!isValidPhone(contact.phone)) {
        errors.phone = 'Please enter a valid phone number';
    }
    if (!contact.relationship || contact.relationship.trim() === '') {
        errors.relationship = 'Relationship is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate the complete registration form (Step 1)
 * @param {Object} formData - Form data for step 1
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateRegistrationStep1 = (formData) => {
    const errors = {};

    const nameResult = validateName(formData.name);
    if (!nameResult.isValid) errors.name = nameResult.message;

    if (!isValidEmail(formData.email)) errors.email = 'Please enter a valid email address';

    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.isValid) errors.password = passwordResult.message;

    if (!formData.phone || !isValidPhone(formData.phone)) errors.phone = 'Please enter a valid phone number';

    const ageResult = validateAge(formData.age);
    if (!ageResult.isValid) errors.age = ageResult.message;

    if (!formData.gender) errors.gender = 'Please select a gender';

    const cityResult = validateCity(formData.city);
    if (!cityResult.isValid) errors.city = cityResult.message;

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate the complete registration form (Step 2)
 * @param {Object} formData - Form data for step 2
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateRegistrationStep2 = (formData) => {
    const errors = {};

    const skillsResult = validateSkills(formData.skills);
    if (!skillsResult.isValid) errors.skills = skillsResult.message;

    // Availability - at least one option should be selected
    const { availability } = formData;
    if (availability) {
        const hasAnyAvailability = availability.weekdays || availability.weekends ||
            availability.morning || availability.afternoon || availability.evening;
        if (!hasAnyAvailability) {
            errors.availability = 'Please select at least one availability option';
        }
    } else {
        errors.availability = 'Please specify your availability';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate the complete registration form (Step 3)
 * @param {Object} formData - Form data for step 3
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateRegistrationStep3 = (formData) => {
    const errors = {};

    const contactResult = validateEmergencyContact(formData.emergencyContact);
    if (!contactResult.isValid) {
        Object.assign(errors, contactResult.errors);
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate login form
 * @param {Object} formData - Login form data { email, password }
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateLogin = (formData) => {
    const errors = {};

    if (!formData.email || !isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
        errors.password = 'Password is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate password update form
 * @param {Object} formData - Password update data { currentPassword, newPassword, confirmPassword }
 * @returns {Object} Validation result with isValid and errors object
 */
export const validatePasswordUpdate = (formData) => {
    const errors = {};

    if (!formData.currentPassword) {
        errors.currentPassword = 'Current password is required';
    }

    const newPasswordResult = validatePassword(formData.newPassword);
    if (!newPasswordResult.isValid) {
        errors.newPassword = newPasswordResult.message;
    }

    if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate event creation form
 * @param {Object} formData - Event form data
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateEventForm = (formData) => {
    const errors = {};

    if (!formData.title || formData.title.trim() === '') errors.title = 'Event title is required';
    if (!formData.description || formData.description.trim() === '') errors.description = 'Event description is required';
    if (!formData.category) errors.category = 'Event category is required';
    if (!formData.date) errors.date = 'Event date is required';
    if (!formData.time) errors.time = 'Event time is required';
    if (!formData.location?.address) errors.locationAddress = 'Event location address is required';
    if (!formData.location?.city) errors.locationCity = 'Event city is required';
    if (!formData.maxVolunteers || formData.maxVolunteers < 1) errors.maxVolunteers = 'At least 1 volunteer is required';

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate feedback form
 * @param {Object} formData - Feedback form data { rating, comment }
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateFeedback = (formData) => {
    const errors = {};

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
        errors.rating = 'Please provide a rating between 1 and 5';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
