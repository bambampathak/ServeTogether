const QRCode = require('qrcode');

/**
 * Generate QR code for event check-in/check-out
 * @param {Object} data - QR code data
 * @param {string} data.eventId - Event ID
 * @param {string} data.type - 'checkin' or 'checkout'
 * @returns {string} QR code data URL
 */
const generateEventQRCode = async (data) => {
    try {
        const qrData = JSON.stringify({
            eventId: data.eventId,
            type: data.type,
            timestamp: Date.now(),
            organization: 'Nayepankh Foundation'
        });

        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: {
                dark: '#2E86AB',
                light: '#ffffff'
            }
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('QR Code generation error:', error);
        throw error;
    }
};

/**
 * Generate QR code as SVG string
 * @param {Object} data - QR code data
 * @returns {string} SVG string
 */
const generateEventQRCodeSVG = async (data) => {
    try {
        const qrData = JSON.stringify({
            eventId: data.eventId,
            type: data.type,
            timestamp: Date.now(),
            organization: 'Nayepankh Foundation'
        });

        const qrCodeSVG = await QRCode.toString(qrData, {
            type: 'svg',
            width: 300,
            margin: 2,
            color: {
                dark: '#2E86AB',
                light: '#ffffff'
            }
        });

        return qrCodeSVG;
    } catch (error) {
        console.error('QR Code SVG generation error:', error);
        throw error;
    }
};

/**
 * Verify QR code data
 * @param {string} qrDataString - Scanned QR code data string
 * @returns {Object} Parsed and verified data
 */
const verifyQRCodeData = (qrDataString) => {
    try {
        const data = JSON.parse(qrDataString);

        if (!data.eventId || !data.type) {
            return { valid: false, message: 'Invalid QR code data' };
        }

        if (data.type !== 'checkin' && data.type !== 'checkout') {
            return { valid: false, message: 'Invalid QR code type' };
        }

        // Check if QR code is not too old (max 24 hours)
        const ageInHours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        if (ageInHours > 24) {
            return { valid: false, message: 'QR code has expired' };
        }

        return { valid: true, data };
    } catch (error) {
        return { valid: false, message: 'Invalid QR code format' };
    }
};

module.exports = {
    generateEventQRCode,
    generateEventQRCodeSVG,
    verifyQRCodeData
};
