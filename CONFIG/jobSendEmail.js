const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false,
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
    },
});

// Email content
const emailSubject = `Exciting Job Opportunity: ${job_title} at ${company_name}`;
const emailHtml = `
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; max-width: 600px; font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #007bff; font-weight: bold; margin-bottom: 16px;">
            Subject: ${emailSubject}
        </h2>
        <p>Dear ${emails.join(", ")},</p>
        <p>
            I hope this message finds you well. I am excited to share an incredible job opportunity
            that could be a great fit for you or someone in your network.
        </p>
        <p style="font-weight: bold;">Here are the key details about the role:</p>
        <div>
            <p><strong>Job Title:</strong> ${job_title}</p>
            <p><strong>Company:</strong> ${company_name}</p>
            <p><strong>Qualification:</strong> ${qualification}</p>
            <p><strong>Job Function:</strong> ${job_function}</p>
            <p><strong>Salary:</strong> ₹${salary.s_min} - ₹${salary.s_max}</p>
        </div>
        <p>
            We are looking for a motivated individual who is ready to contribute to ${company_name}’s
            success and take on challenging and rewarding projects.
        </p>
        <p>
            If you are interested in exploring this opportunity further, please reply to this email or
            contact us at ${admin?.mobile}. Feel free to share this information with anyone
            who might be interested.
        </p>
        <p>Looking forward to hearing from you!</p>
        <p style="margin-top: 24px; font-weight: bold;">
            Best regards,<br />
            ${admin?.name?.first_name} ${admin?.name?.last_name}<br />
            ${admin?.mobile}
        </p>
    </div>
`;

// Email options
const mailOptions = {
    from: 'your-email@gmail.com',
    to: emails,
    subject: emailSubject,
    html: emailHtml, // This will render the HTML in the email
    text: `Subject: ${emailSubject}\n\nDear ${emails.join(", ")},\n\n...`, // Plain text version (optional)
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Error sending email:', error);
    } else {
        console.log('Email sent:', info.response);
    }
});
