function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <p>&copy; {new Date().getFullYear()} NayePankh Foundation. All Rights Reserved.</p>
                <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Empowering volunteers to serve and grow together. Built with ❤️ for community impact.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
