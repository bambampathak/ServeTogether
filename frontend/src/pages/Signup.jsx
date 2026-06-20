import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SKILLS_OPTIONS = [
    'Teaching', 'Medical', 'First Aid', 'Counseling', 'Event Management',
    'Social Media', 'Photography', 'Writing', 'Graphic Design', 'Web Development',
    'Data Entry', 'Driving', 'Cooking', 'Cleaning', 'Music', 'Art & Craft',
    'Public Speaking', 'Translation', 'Legal', 'Accounting', 'Fitness Training'
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        gender: '',
        city: '',
        skills: [],
        availability: {
            weekdays: false,
            weekends: false,
            morning: false,
            afternoon: false,
            evening: false
        },
        emergencyContact: {
            name: '',
            phone: '',
            relation: ''
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('emergency')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                emergencyContact: { ...formData.emergencyContact, [field]: value }
            });
        } else if (name.startsWith('availability')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                availability: { ...formData.availability, [field]: e.target.checked }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSkillToggle = (skill) => {
        const skills = formData.skills.includes(skill)
            ? formData.skills.filter(s => s !== skill)
            : [...formData.skills, skill];
        setFormData({ ...formData, skills });
    };

    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
            toast.error('Please fill in all required fields');
            return false;
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        if (formData.phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.age || !formData.gender || !formData.city) {
            toast.error('Please fill in all required fields');
            return false;
        }
        if (formData.skills.length === 0) {
            toast.error('Please select at least one skill');
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.emergencyContact.name || !formData.emergencyContact.phone) {
            toast.error('Please provide emergency contact details');
            return;
        }
        setLoading(true);
        try {
            const data = await signup(formData);
            toast.success('Registration successful! Your account is pending approval.');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container signup-container glass">
                <div className="auth-header">
                    <span className="auth-logo">🤝</span>
                    <h1>Join ServeTogether</h1>
                    <p>Register as a volunteer for Nayepankh Foundation</p>
                </div>

                {/* Step Indicator */}
                <div className="step-indicator">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="form-step">
                            <h3>Basic Information</h3>
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <div className="input-with-icon">
                                    <FiUser className="input-icon" />
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <div className="input-with-icon">
                                    <FiMail className="input-icon" />
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password *</label>
                                <div className="input-with-icon">
                                    <FiLock className="input-icon" />
                                    <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" required />
                                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number *</label>
                                <div className="input-with-icon">
                                    <FiPhone className="input-icon" />
                                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" required />
                                </div>
                            </div>

                            <button type="button" className="btn btn-primary btn-full" onClick={nextStep}>
                                Next Step <FiArrowRight />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Skills & Availability */}
                    {step === 2 && (
                        <div className="form-step">
                            <h3>Skills & Availability</h3>

                            <div className="form-group">
                                <label htmlFor="age">Age *</label>
                                <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} placeholder="Enter your age" min="16" max="80" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender">Gender *</label>
                                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
                                    <option value="">Select Gender</option>
                                    {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="city">City *</label>
                                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Enter your city" required />
                            </div>

                            <div className="form-group">
                                <label>Skills * (Select at least one)</label>
                                <div className="skills-grid">
                                    {SKILLS_OPTIONS.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            className={`skill-tag ${formData.skills.includes(skill) ? 'selected' : ''}`}
                                            onClick={() => handleSkillToggle(skill)}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Availability</label>
                                <div className="availability-grid">
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="availability.weekdays" checked={formData.availability.weekdays} onChange={handleChange} />
                                        Weekdays
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="availability.weekends" checked={formData.availability.weekends} onChange={handleChange} />
                                        Weekends
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="availability.morning" checked={formData.availability.morning} onChange={handleChange} />
                                        Morning
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="availability.afternoon" checked={formData.availability.afternoon} onChange={handleChange} />
                                        Afternoon
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="availability.evening" checked={formData.availability.evening} onChange={handleChange} />
                                        Evening
                                    </label>
                                </div>
                            </div>

                            <div className="form-row form-row-between">
                                <button type="button" className="btn btn-outline" onClick={prevStep}>Back</button>
                                <button type="button" className="btn btn-primary" onClick={nextStep}>Next Step <FiArrowRight /></button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Emergency Contact */}
                    {step === 3 && (
                        <div className="form-step">
                            <h3>Emergency Contact</h3>
                            <div className="info-note">
                                <FiAlertCircle />
                                <p>Please provide emergency contact details for safety purposes.</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="emergencyName">Contact Person Name *</label>
                                <input type="text" id="emergencyName" name="emergency.name" value={formData.emergencyContact.name} onChange={handleChange} placeholder="Emergency contact name" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="emergencyPhone">Contact Person Phone *</label>
                                <input type="tel" id="emergencyPhone" name="emergency.phone" value={formData.emergencyContact.phone} onChange={handleChange} placeholder="Emergency contact phone" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="emergencyRelation">Relationship</label>
                                <select id="emergencyRelation" name="emergency.relation" value={formData.emergencyContact.relation} onChange={handleChange}>
                                    <option value="">Select Relationship</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-row form-row-between">
                                <button type="button" className="btn btn-outline" onClick={prevStep}>Back</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Registering...' : 'Complete Registration'} <FiArrowRight />
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
