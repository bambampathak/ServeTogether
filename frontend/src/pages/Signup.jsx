import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';

const SKILLS_OPTIONS = [
    'Teaching', 'Event Management', 'Graphic Design', 'Social Media', 
    'Fundraising', 'Content Writing', 'Field Work', 'Photography', 'Logistics'
];

const AVAILABILITY_OPTIONS = [
    'Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings'
];

function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        role: 'volunteer',
        adminCode: '',
        skills: [],
        availability: []
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleSkill = (skill) => {
        setFormData(prev => {
            const index = prev.skills.indexOf(skill);
            const newSkills = [...prev.skills];
            if (index > -1) {
                newSkills.splice(index, 1);
            } else {
                newSkills.push(skill);
            }
            return { ...prev, skills: newSkills };
        });
    };

    const toggleAvailability = (slot) => {
        setFormData(prev => {
            const index = prev.availability.indexOf(slot);
            const newSlots = [...prev.availability];
            if (index > -1) {
                newSlots.splice(index, 1);
            } else {
                newSlots.push(slot);
            }
            return { ...prev, availability: newSlots };
        });
    };

    const nextStep = () => {
        // Validate Step 1
        const { name, email, password, phone, age } = formData;
        if (!name || !email || !password || !phone || !age) {
            return toast.error('Please fill in all basic fields');
        }
        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        if (parseInt(age, 10) < 13) {
            return toast.error('You must be at least 13 years old');
        }
        setStep(2);
    };

    const prevStep = () => {
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate Step 2
        if (formData.skills.length === 0) {
            return toast.error('Please select at least one skill');
        }
        if (formData.availability.length === 0) {
            return toast.error('Please select at least one availability slot');
        }

        try {
            setLoading(true);
            const user = await signup({
                ...formData,
                age: parseInt(formData.age, 10)
            });

            toast.success(`Registration successful! Welcome ${user.name}`);
            
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            toast.error(err.message || 'Registration failed. Try using a different email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container auth-container">
            <div className="glass-card auth-card" style={{ maxWidth: step === 1 ? '450px' : '550px' }}>
                <div className="auth-header">
                    <h2>Volunteer Signup</h2>
                    <p>{step === 1 ? 'Step 1: Account Information' : 'Step 2: Skills & Availability'}</p>
                </div>

                {/* Progress Indicators */}
                <div className="signup-steps">
                    <div className={`step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        {step > 1 ? <FiCheck /> : '1'}
                    </div>
                    <div className={`step-indicator ${step === 2 ? 'active' : ''}`}>
                        2
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Register As</label>
                                <select
                                    name="role"
                                    className="form-input"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    style={{ background: '#161c2d', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
                                >
                                    <option value="volunteer">Volunteer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {formData.role === 'admin' && (
                                <div className="form-group">
                                    <label className="form-label">Admin Access Code</label>
                                    <input
                                        type="password"
                                        name="adminCode"
                                        className="form-input"
                                        placeholder="Enter secure admin code"
                                        value={formData.adminCode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Password (Min. 6 characters)</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        placeholder="9876543210"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        className="form-input"
                                        placeholder="18"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '1rem' }}
                                onClick={nextStep}
                            >
                                Continue <FiArrowRight />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="form-group">
                                <label className="form-label" style={{ marginBottom: '0.8rem' }}>
                                    Select Your Skills (Choose at least one)
                                </label>
                                <div className="skills-grid">
                                    {SKILLS_OPTIONS.map(skill => (
                                        <div
                                            key={skill}
                                            className={`selectable-card ${formData.skills.includes(skill) ? 'selected' : ''}`}
                                            onClick={() => toggleSkill(skill)}
                                        >
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label className="form-label" style={{ marginBottom: '0.8rem' }}>
                                    Your Availability (Choose at least one)
                                </label>
                                <div className="availability-grid">
                                    {AVAILABILITY_OPTIONS.map(slot => (
                                        <div
                                            key={slot}
                                            className={`selectable-card ${formData.availability.includes(slot) ? 'selected' : ''}`}
                                            onClick={() => toggleAvailability(slot)}
                                        >
                                            {slot}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                    onClick={prevStep}
                                >
                                    <FiArrowLeft /> Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 2 }}
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : 'Register Profile'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                        Login instead
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;
