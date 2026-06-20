import { Link } from 'react-router-dom';
import { FiHeart, FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiLinkedin } from 'react-icons/fi';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <div className="footer-brand">
                        <span className="brand-icon">🤝</span>
                        <h3>ServeTogether</h3>
                        <p className="footer-tagline">Empowering volunteers to make a difference together</p>
                    </div>
                    <p className="footer-org">A platform by <strong>Nayepankh Foundation</strong></p>
                    <div className="footer-social">
                        <a href="#" title="Facebook"><FiFacebook /></a>
                        <a href="#" title="Instagram"><FiInstagram /></a>
                        <a href="#" title="Twitter"><FiTwitter /></a>
                        <a href="#" title="LinkedIn"><FiLinkedin /></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/events">Events</Link></li>
                        <li><Link to="/leaderboard">Leaderboard</Link></li>
                        <li><Link to="/signup">Register as Volunteer</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Resources</h4>
                    <ul>
                        <li><Link to="/certificates">My Certificates</Link></li>
                        <li><a href="#">Volunteer Guidelines</a></li>
                        <li><a href="#">FAQs</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Contact Us</h4>
                    <ul className="footer-contact">
                        <li><FiMail /> info@nayepankh.org</li>
                        <li><FiPhone /> +91 98765 43210</li>
                        <li><FiMapPin /> Nayepankh Foundation, India</li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Nayepankh Foundation. All rights reserved.</p>
                <p>Made with <FiHeart className="heart-icon" /> by ServeTogether Team</p>
            </div>
        </footer>
    );
}

export default Footer;
