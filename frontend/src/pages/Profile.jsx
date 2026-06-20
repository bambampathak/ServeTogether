import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { volunteerAPI, authAPI } from '../services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiCamera, FiSave, FiEye, FiEyeOff, FiUpload, FiStar, FiClock, FiCalendar, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SKILLS_OPTIONS = [
    'Teaching', 'Medical', 'First Aid', 'Counseling', 'Event Management',
    'Social Media', 'Photography', 'Writing', 'Graphic Design', 'Web Development',
    'Data Entry', 'Driving', 'Cooking', 'Cleaning', 'Music', 'Art & Craft',
    'Public Speaking', 'Translation', 'Legal', 'Accounting', 'Fitness Training'
];

function Profile() {
    const { user, updateProfile, loadUser } = useAuth();
    const scrollRef = useScrollAnimation();
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
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
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                phone: user.phone || '',
                age: user.age || '',
                gender: user.gender || '',
                city: user.city || '',
                skills: user.skills || [],
                availability: user.availability || { weekdays: false, weekends: false, morning: false, afternoon: false, evening: false },
                emergencyContact: user.emergencyContact || { name: '', phone: '', relation: '' }
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('emergency')) {
            const field = name.split('.')[1];
            setProfileData({
                ...profileData,
                emergencyContact: { ...profileData.emergencyContact, [field]: value }
            });
        } else if (name.startsWith('availability')) {
            const field = name.split('.')[1];
            setProfileData({
                ...profileData,
                availability: { ...profileData.availability, [field]: e.target.checked }
            });
        } else {
            setProfileData({ ...profileData, [name]: value });
        }
    };

    const handleSkillToggle = (skill) => {
        const skills = profileData.skills.includes(skill)
            ? profileData.skills.filter(s => s !== skill)
            : [...profileData.skills, skill];
        setProfileData({ ...profileData, skills });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(profileData);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await authAPI.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }
        setLoading(true);
        try {
            await volunteerAPI.uploadPhoto(file);
            await loadUser();
            toast.success('Photo uploaded successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload photo');
        } finally {
            setLoading(false);
        }
    };

    const handleIdProofUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        try {
            await volunteerAPI.uploadIdProof(file);
            toast.success('ID proof uploaded successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload ID proof');
        } finally {
            setLoading(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        try {
            await volunteerAPI.uploadResume(file);
            toast.success('Resume uploaded successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload resume');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page" ref={scrollRef}>
            <div className="page-header scroll-animate">
                <h1>My Profile</h1>
                <p>Manage your personal information and settings</p>
            </div>

            {/* Profile Summary Card */}
            <div className="profile-summary-card glass scroll-animate">
                <div className="profile-avatar-large">
                    {user?.photo ? (
                        <img src={user.photo} alt={user.name} />
                    ) : (
                        <FiUser size={48} />
                    )}
                    <label className="avatar-upload-btn" title="Change photo">
                        <FiCamera />
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                    </label>
                </div>
                <div className="profile-summary-info">
                    <h2>{user?.name}</h2>
                    <p><FiMail /> {user?.email}</p>
                    <p><FiPhone /> {user?.phone}</p>
                    <p><FiMapPin /> {user?.city}</p>
                    <div className="profile-badges">
                        <span className={`badge badge-${user?.status}`}>{user?.status}</span>
                        <span className="badge badge-role">{user?.role}</span>
                    </div>
                </div>
                <div className="profile-summary-stats">
                    <div className="mini-stat">
                        <FiClock />
                        <span>{user?.totalHours || 0} hrs</span>
                    </div>
                    <div className="mini-stat">
                        <FiCalendar />
                        <span>{user?.totalEvents || 0} events</span>
                    </div>
                    <div className="mini-stat">
                        <FiStar />
                        <span>{user?.points || 0} pts</span>
                    </div>
                    <div className="mini-stat">
                        <FiAward />
                        <span>{user?.badges?.length || 0} badges</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
                <button className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
                    Personal Info
                </button>
                <button className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>
                    Skills & Availability
                </button>
                <button className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`} onClick={() => setActiveTab('emergency')}>
                    Emergency Contact
                </button>
                <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                    Security
                </button>
                <button className={`tab-btn ${activeTab === 'uploads' ? 'active' : ''}`} onClick={() => setActiveTab('uploads')}>
                    Uploads
                </button>
            </div>

            {/* Tab Content */}
            <div className="profile-tab-content">
                {/* Personal Info */}
                {activeTab === 'personal' && (
                    <form onSubmit={handleProfileUpdate} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input type="text" id="name" name="name" value={profileData.name} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone" value={profileData.phone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="age">Age</label>
                            <input type="number" id="age" name="age" value={profileData.age} onChange={handleChange} min="16" max="80" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="gender">Gender</label>
                            <select id="gender" name="gender" value={profileData.gender} onChange={handleChange}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input type="text" id="city" name="city" value={profileData.city} onChange={handleChange} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}

                {/* Skills & Availability */}
                {activeTab === 'skills' && (
                    <form onSubmit={handleProfileUpdate} className="profile-form">
                        <div className="form-group">
                            <label>Skills</label>
                            <div className="skills-grid">
                                {SKILLS_OPTIONS.map(skill => (
                                    <button
                                        key={skill}
                                        type="button"
                                        className={`skill-tag ${profileData.skills.includes(skill) ? 'selected' : ''}`}
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
                                    <input type="checkbox" name="availability.weekdays" checked={profileData.availability.weekdays} onChange={handleChange} />
                                    Weekdays
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" name="availability.weekends" checked={profileData.availability.weekends} onChange={handleChange} />
                                    Weekends
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" name="availability.morning" checked={profileData.availability.morning} onChange={handleChange} />
                                    Morning
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" name="availability.afternoon" checked={profileData.availability.afternoon} onChange={handleChange} />
                                    Afternoon
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" name="availability.evening" checked={profileData.availability.evening} onChange={handleChange} />
                                    Evening
                                </label>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}

                {/* Emergency Contact */}
                {activeTab === 'emergency' && (
                    <form onSubmit={handleProfileUpdate} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="emergencyName">Contact Person Name</label>
                            <input type="text" id="emergencyName" name="emergency.name" value={profileData.emergencyContact.name} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="emergencyPhone">Contact Person Phone</label>
                            <input type="tel" id="emergencyPhone" name="emergency.phone" value={profileData.emergencyContact.phone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="emergencyRelation">Relationship</label>
                            <select id="emergencyRelation" name="emergency.relation" value={profileData.emergencyContact.relation} onChange={handleChange}>
                                <option value="">Select Relationship</option>
                                <option value="Parent">Parent</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Friend">Friend</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}

                {/* Security */}
                {activeTab === 'security' && (
                    <form onSubmit={handlePasswordUpdate} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <div className="input-with-icon">
                                <FiLock className="input-icon" />
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    id="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                    required
                                />
                                <button type="button" className="toggle-password" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                    {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="input-with-icon">
                                <FiLock className="input-icon" />
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Min 6 characters"
                                    required
                                />
                                <button type="button" className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                placeholder="Re-enter new password"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <FiLock /> {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}

                {/* Uploads */}
                {activeTab === 'uploads' && (
                    <div className="profile-form">
                        <div className="upload-section">
                            <h3>Profile Photo</h3>
                            <div className="upload-card">
                                {user?.photo ? (
                                    <img src={user.photo} alt="Profile" className="upload-preview" />
                                ) : (
                                    <div className="upload-placeholder"><FiUser size={48} /></div>
                                )}
                                <label className="btn btn-outline upload-btn">
                                    <FiUpload /> Upload Photo
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                                </label>
                            </div>
                        </div>
                        <div className="upload-section">
                            <h3>ID Proof</h3>
                            <div className="upload-card">
                                <div className="upload-placeholder"><FiUpload size={48} /></div>
                                <label className="btn btn-outline upload-btn">
                                    <FiUpload /> Upload ID Proof
                                    <input type="file" accept="image/*,.pdf" onChange={handleIdProofUpload} hidden />
                                </label>
                            </div>
                        </div>
                        <div className="upload-section">
                            <h3>Resume</h3>
                            <div className="upload-card">
                                <div className="upload-placeholder"><FiUpload size={48} /></div>
                                <label className="btn btn-outline upload-btn">
                                    <FiUpload /> Upload Resume
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} hidden />
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
