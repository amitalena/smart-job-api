const CONTACTUS = require("../models/ContactUsModel.js");
const config = require("../../config");
const transporter = require("../../CONFIG/emailConfig.js");
//------------------< CREATE CONTACT US >------------------//
exports.submitContact = async (req, res) => {
    try {
        const applicantId = req.user?.id;
        // Extract data from the request body
        const { first_name, last_name, email, contact, subject, message } = req.body;

        // Validate input (subject and message are required fields)
        if (!subject || !message) {
            return res.status(400).json({ message: "Subject and message are required" });
        }

        // Save form data to the database
        const contactForm = await CONTACTUS.create({
            name: {
                first_name,
                last_name,
            },
            contact,
            email,
            subject,
            message,
            applicantId: applicantId,
            submittedAt: new Date(), // Add a timestamp for tracking submissions
        });

        // HTML content for the email
        const emailContent = `
            <div style="font-family: Arial, sans-serif; color: #232323; background: #fdfdfd; border-radius:10px; font-size: 11px; padding:10px; line-height: 1.3;">
                <p>Dear <b>${first_name} ${last_name}</b>,</p>
                <p>Thank you for reaching out to us. We have received your message and will get back to you shortly. Below are the details you provided:</p>
               
                <p><strong>Name:</strong> ${first_name} ${last_name}</p>
                <p><strong>Contact:</strong> ${contact}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong> ${message}</p>

                <p>If you have any urgent concerns, feel free to reach out to us directly at <span style="font-size: 11px;">${contact}</span> or reply to this email.</p>
                <p><strong>Best regards,</strong></p>
                <p>${first_name} ${last_name} <br>Contact: ${contact} <br>Email: ${email} </p>
            </div>
        `;

        // Send an email acknowledgment to the applicant
        await transporter.sendMail({
            from: config.EMAIL_FROM,
            to: email, // Use the provided email from the form
            subject: `Thank You for Contacting Us: ${subject}`,
            html: emailContent, // Use the HTML content instead of plain text
        });

        // Respond to the client
        return res.status(200).json({
            message: "Contact form submitted successfully",
            data: contactForm,
        });
    } catch (error) {
        // Handle other errors
        console.error("Error submitting contact form:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


//------------------< ALL CONTACT US >------------------//
exports.getAllContact = async (req, res) => {
    try {
        const getData = await CONTACTUS.find({});

        if (!getData || getData.length === 0) {
            return res.status(404).json({ message: 'No data exists in contact database', status: false, data: null });
        } else {
            return res.status(200).json({ message: 'All data retrieved successfully', status: true, data: getData });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', status: false, data: null });
    }
}
//------------------< SINGLE CONTACT US >------------------//
exports.getSingleContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contactus = await CONTACTUS.findById(id);
        if (!contactus) {
            return res.status(404).json({
                message: 'Contact us not found',
                status: false,
                data: null,
            });
        }
        res.status(200).json({
            message: 'Single data retrieved successfully',
            status: true,
            data: contactus,
        });
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({
            message: 'Internal server error',
            status: false,
            data: null,
        });
    }
};

//------------------< DELETE CONTACT US >------------------//
exports.deleteContact = async (req, res) => {
    const id = req.params.id;
    try {
        const contactus = await CONTACTUS.findById(id);
        if (!contactus) {
            return res.status(404).json({ message: 'No data exists in contact database for this id', status: false, data: null });
        }

        const deletedata = await CONTACTUS.findByIdAndDelete(id);
        if (!deletedata) {
            return res.status(404).json({ message: 'Failed to delete data from contact database for this id', status: false, data: null });
        }

        return res.status(200).json({ message: 'Data deleted successfully', status: true, data: contactus });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', status: false, data: null });
    }
};
