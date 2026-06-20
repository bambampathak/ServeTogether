const PDFDocument = require('pdfkit');

/**
 * Generates a CSV format string for volunteer records
 * @param {Array} volunteers 
 * @returns {String} csv content
 */
function generateCSVReport(volunteers) {
    const headers = ['Name', 'Email', 'Phone', 'Age', 'Skills', 'Availability', 'Status', 'Registration Date'];
    const rows = volunteers.map(v => [
        `"${v.name.replace(/"/g, '""')}"`,
        `"${v.email.replace(/"/g, '""')}"`,
        `"${v.phone.replace(/"/g, '""')}"`,
        v.age,
        `"${(v.skills || []).join(', ').replace(/"/g, '""')}"`,
        `"${(v.availability || []).join(', ').replace(/"/g, '""')}"`,
        `"${v.status}"`,
        `"${new Date(v.createdAt).toLocaleDateString()}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Generates a demographic/summary PDF report using PDFKit and pipes to response
 * @param {Array} volunteers 
 * @param {Object} res HTTP response
 */
function generatePDFReport(volunteers, res) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    // Header styling
    doc.fillColor('#2E86AB').fontSize(24).text('NayePankh Foundation', { align: 'center' });
    doc.fillColor('#333333').fontSize(14).text('Volunteer Demographics Report', { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // Summary calculations
    const total = volunteers.length;
    const pending = volunteers.filter(v => v.status === 'pending').length;
    const approved = volunteers.filter(v => v.status === 'approved').length;
    const rejected = volunteers.filter(v => v.status === 'rejected').length;

    // Draw Stats Grid box
    doc.rect(40, doc.y, 515, 60).fillAndStroke('#f0f8ff', '#2E86AB');
    
    // Y position for stats text
    const statsY = doc.y + 15;
    doc.fillColor('#333333').fontSize(11);
    
    // Columns inside stats box
    doc.text(`Total: ${total}`, 60, statsY, { width: 100 });
    doc.text(`Approved: ${approved}`, 180, statsY, { width: 100 });
    doc.text(`Pending: ${pending}`, 300, statsY, { width: 100 });
    doc.text(`Rejected: ${rejected}`, 420, statsY, { width: 100 });

    doc.y = statsY + 35; // reset cursor
    doc.moveDown(2);

    // Table Header
    doc.fillColor('#2E86AB').fontSize(12).text('Volunteer Registrations', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    doc.fillColor('#333333').fontSize(9).font('Helvetica-Bold');
    doc.text('Name', 45, tableTop, { width: 120 });
    doc.text('Email', 165, tableTop, { width: 140 });
    doc.text('Phone', 305, tableTop, { width: 90 });
    doc.text('Age', 395, tableTop, { width: 30 });
    doc.text('Status', 425, tableTop, { width: 50 });
    doc.text('Date Registered', 475, tableTop, { width: 80 });

    doc.moveTo(40, tableTop + 12).lineTo(555, tableTop + 12).stroke('#ccc');
    doc.moveDown(0.5);
    
    // Reset font to normal
    doc.font('Helvetica').fontSize(9);

    volunteers.forEach((v, index) => {
        const rowY = doc.y;
        
        // Alternate row coloring
        if (index % 2 === 1) {
            doc.rect(40, rowY - 2, 515, 14).fill('#f9f9f9');
        }

        doc.fillColor('#333');
        doc.text(v.name, 45, rowY, { width: 120, lineBreak: false });
        doc.text(v.email, 165, rowY, { width: 140, lineBreak: false });
        doc.text(v.phone, 305, rowY, { width: 90, lineBreak: false });
        doc.text(v.age.toString(), 395, rowY, { width: 30, lineBreak: false });

        // Color status appropriately
        let statusColor = '#f18f01'; // pending
        if (v.status === 'approved') statusColor = '#2e7d32';
        if (v.status === 'rejected') statusColor = '#c62828';
        doc.fillColor(statusColor).font('Helvetica-Bold');
        doc.text(v.status.toUpperCase(), 425, rowY, { width: 50, lineBreak: false });

        doc.fillColor('#333').font('Helvetica');
        doc.text(new Date(v.createdAt).toLocaleDateString(), 475, rowY, { width: 80, lineBreak: false });
        
        doc.moveDown(1.2);

        // Check if page needs to break
        if (doc.y > 750) {
            doc.addPage();
            doc.font('Helvetica-Bold').fontSize(9);
            const nextTableTop = 40;
            doc.text('Name', 45, nextTableTop, { width: 120 });
            doc.text('Email', 165, nextTableTop, { width: 140 });
            doc.text('Phone', 305, nextTableTop, { width: 90 });
            doc.text('Age', 395, nextTableTop, { width: 30 });
            doc.text('Status', 425, nextTableTop, { width: 50 });
            doc.text('Date Registered', 475, nextTableTop, { width: 80 });
            doc.moveTo(40, nextTableTop + 12).lineTo(555, nextTableTop + 12).stroke('#ccc');
            doc.font('Helvetica').fontSize(9);
            doc.y = nextTableTop + 18;
        }
    });

    // Add footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fillColor('#999').fontSize(8).text(
            `Page ${i + 1} of ${pageCount} | ServeTogether Volunteer Management System`,
            40,
            doc.page.height - 30,
            { align: 'center' }
        );
    }

    doc.end();
}

/**
 * Generates an appreciation certificate for an approved volunteer
 * @param {Object} volunteer 
 * @param {Object} res HTTP response
 */
function generateVolunteerCertificate(volunteer, res) {
    const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 0
    });
    doc.pipe(res);

    const width = doc.page.width;
    const height = doc.page.height;

    // Draw dark border
    doc.rect(20, 20, width - 40, height - 40).lineWidth(8).stroke('#2E86AB');
    // Draw thin inner gold/accent border
    doc.rect(30, 30, width - 60, height - 60).lineWidth(2).stroke('#F18F01');

    // Add corner decorations (little accent corners)
    const drawCorners = () => {
        doc.rect(35, 35, 30, 30).fill('#2E86AB');
        doc.rect(width - 65, 35, 30, 30).fill('#2E86AB');
        doc.rect(35, height - 65, 30, 30).fill('#2E86AB');
        doc.rect(width - 65, height - 65, 30, 30).fill('#2E86AB');
    };
    drawCorners();

    // Top logo area
    doc.fillColor('#2E86AB').fontSize(28).font('Helvetica-Bold').text('NayePankh Foundation', 0, 70, { align: 'center' });
    doc.fillColor('#F18F01').fontSize(12).font('Helvetica').text('EMPOWERING COMMUNITIES • SPREADING SMILES', 0, 105, { align: 'center', characterSpacing: 1.5 });
    
    doc.moveDown(2);
    
    // Certificate Title
    doc.fillColor('#333333').fontSize(36).font('Helvetica-Bold').text('CERTIFICATE OF REGISTRATION', 0, 150, { align: 'center' });
    
    doc.moveDown(1);
    doc.fillColor('#666666').fontSize(14).font('Helvetica-Oblique').text('This is to certify that', 0, 210, { align: 'center' });
    
    doc.moveDown(0.8);
    // Volunteer Name (Highlight)
    doc.fillColor('#2E86AB').fontSize(26).font('Helvetica-Bold').text(volunteer.name, 0, 240, { align: 'center' });
    
    // Line under the name
    doc.moveTo(width / 2 - 150, 275).lineTo(width / 2 + 150, 275).lineWidth(1).stroke('#cccccc');

    // Body text
    doc.fillColor('#666666').fontSize(12).font('Helvetica')
        .text('has successfully registered and been accepted as an active volunteer with the', 0, 295, { align: 'center' });
    doc.text('NayePankh Foundation. We deeply appreciate their commitment to support our operations and drive positive impact.', 0, 315, { align: 'center' });

    // Details/Signatures section
    const detailsY = 370;

    // Issue Date
    doc.fillColor('#333333').font('Helvetica-Bold').fontSize(10).text('Date of Acceptance:', 150, detailsY);
    doc.font('Helvetica').text(new Date(volunteer.createdAt).toLocaleDateString(), 150, detailsY + 15);

    // Cert ID
    const shortId = volunteer._id.toString().substring(18).toUpperCase();
    doc.font('Helvetica-Bold').text('Certificate ID:', 380, detailsY);
    doc.font('Helvetica').text(`NP-VOL-${new Date(volunteer.createdAt).getFullYear()}-${shortId}`, 380, detailsY + 15);

    // Authorized Signature Placeholder
    doc.font('Helvetica-Bold').text('Authorized Signatory', 600, detailsY);
    doc.moveTo(580, detailsY + 12).lineTo(720, detailsY + 12).lineWidth(1).stroke('#999999');
    doc.font('Helvetica').fontSize(9).text('President, NayePankh', 600, detailsY + 15);

    doc.end();
}

module.exports = {
    generateCSVReport,
    generatePDFReport,
    generateVolunteerCertificate
};
