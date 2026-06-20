const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} options.text - Plain text body (fallback)
 */
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'ServeTogether <noreply@nayepankh.org>',
            to: options.to,
            subject: options.subject,
            text: options.text || '',
            html: options.html || options.text || ''
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Email sending error: ${error.message}`);
        return { success: false, error: error.message };
    }
};

/**
 * Send registration success email
 */
const sendRegistrationEmail = async (volunteer) => {
    const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #2E86AB, #A23B72); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to ServeTogether!</h1>
        <p style="color: #f0f0f0; margin: 10px 0;">Nayepankh Foundation Volunteer System</p>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #2E86AB;">Hello ${volunteer.name},</h2>
        <p>Thank you for registering as a volunteer with Nayepankh Foundation!</p>
        <p>Your registration is currently <strong>pending approval</strong>. Our admin team will review your application and notify you once it's approved.</p>
        <div style="background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Your Registration Details:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Name: ${volunteer.name}</li>
            <li>Email: ${volunteer.email}</li>
            <li>Phone: ${volunteer.phone}</li>
            <li>City: ${volunteer.city}</li>
          </ul>
        </div>
        <p>Once approved, you'll be able to browse and register for upcoming events.</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background: #2E86AB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>ServeTogether - Nayepankh Foundation | Making a difference together</p>
      </div>
    </div>
  `;

    return sendEmail({
        to: volunteer.email,
        subject: 'Welcome to ServeTogether - Nayepankh Foundation!',
        html
    });
};

/**
 * Send approval status email
 */
const sendApprovalEmail = async (volunteer, status) => {
    const isApproved = status === 'approved';
    const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background: ${isApproved ? '#2E86AB' : '#dc3545'}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">${isApproved ? '🎉 Registration Approved!' : 'Registration Update'}</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #2E86AB;">Hello ${volunteer.name},</h2>
        <p>${isApproved
            ? 'Congratulations! Your volunteer registration has been <strong>approved</strong>. You can now browse events and start volunteering!'
            : 'We regret to inform you that your volunteer registration has been <strong>rejected</strong>. This may be due to capacity limitations or other reasons. You can contact us for more information.'}</p>
        ${isApproved ? `<a href="${process.env.CLIENT_URL}/events" style="background: #2E86AB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Browse Events</a>` : ''}
      </div>
    </div>
  `;

    return sendEmail({
        to: volunteer.email,
        subject: isApproved ? 'ServeTogether - Your Registration is Approved!' : 'ServeTogether - Registration Status Update',
        html
    });
};

/**
 * Send event registration confirmation email
 */
const sendEventRegistrationEmail = async (volunteer, event) => {
    const eventDateStr = new Date(event.date).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background: #2E86AB; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Event Registration Confirmed!</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #2E86AB;">Hello ${volunteer.name},</h2>
        <p>You have successfully registered for the following event:</p>
        <div style="background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2E86AB; margin: 0;">${event.title}</h3>
          <ul style="margin: 10px 0;">
            <li>Date: ${eventDateStr}</li>
            <li>Time: ${event.time}</li>
            <li>Location: ${event.location.address}, ${event.location.city}</li>
            <li>Category: ${event.category}</li>
          </ul>
        </div>
        <p>Please arrive on time and bring your ID proof.</p>
        <a href="${process.env.CLIENT_URL}/events/${event._id}" style="background: #2E86AB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Event Details</a>
      </div>
    </div>
  `;

    return sendEmail({
        to: volunteer.email,
        subject: `ServeTogether - Registered for ${event.title}`,
        html
    });
};

/**
 * Send event reminder email
 */
const sendEventReminderEmail = async (volunteer, event) => {
    const eventDateStr = new Date(event.date).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background: #F18F01; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">⏰ Event Reminder</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #2E86AB;">Hello ${volunteer.name},</h2>
        <p>This is a reminder that you have an upcoming event:</p>
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffc107;">
          <h3 style="color: #856404; margin: 0;">${event.title}</h3>
          <ul style="margin: 10px 0; color: #856404;">
            <li>Date: ${eventDateStr}</li>
            <li>Time: ${event.time}</li>
            <li>Location: ${event.location.address}, ${event.location.city}</li>
          </ul>
        </div>
        <p>Please make sure to arrive on time!</p>
      </div>
    </div>
  `;

    return sendEmail({
        to: volunteer.email,
        subject: `ServeTogether - Reminder: ${event.title} is coming up!`,
        html
    });
};

/**
 * Send thank you email after event
 */
const sendThankYouEmail = async (volunteer, event, hours) => {
    const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background: #2E86AB; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Thank You for Volunteering!</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #2E86AB;">Hello ${volunteer.name},</h2>
        <p>Thank you for your dedication and service at <strong>${event.title}</strong>!</p>
        <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Hours Volunteered: ${hours}</strong></p>
          <p style="margin: 5px 0;">Your certificate will be generated and available in your dashboard soon.</p>
        </div>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background: #2E86AB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
      </div>
    </div>
  `;

    return sendEmail({
        to: volunteer.email,
        subject: `ServeTogether - Thank you for volunteering at ${event.title}!`,
        html
    });
};

/**
 * Send certificate available email
 */
const sendCertificateEmail = async (volunteer, certificate) => {
    const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background: #A23B72; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎓 Certificate Available!</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #2E86AB;">Hello ${volunteer.name},</h2>
        <p>Your certificate for <strong>${certificate.eventName}</strong> is now available!</p>
        <p>Certificate ID: <strong>${certificate.certificateId}</strong></p>
        <a href="${process.env.CLIENT_URL}/certificates" style="background: #A23B72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Certificate</a>
      </div>
    </div>
  `;

    return sendEmail({
        to: volunteer.email,
        subject: `ServeTogether - Your certificate for ${certificate.eventName} is ready!`,
        html
    });
};

module.exports = {
    sendEmail,
    sendRegistrationEmail,
    sendApprovalEmail,
    sendEventRegistrationEmail,
    sendEventReminderEmail,
    sendThankYouEmail,
    sendCertificateEmail
};
