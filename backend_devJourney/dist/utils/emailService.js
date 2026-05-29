"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail', // ou un autre service d'envoi
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendOTP = async (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Verification Code - DevJourney',
        text: `Your verification code is: ${otp}. This code expires in 10 minutes.`,
        html: `<p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong>.</p><p>This code expires in 10 minutes.</p>`,
    };
    console.log(`\n==============================================`);
    console.log(`📩  VERIFICATION E-MAIL READY`);
    console.log(`📧  RECIPIENT: ${to}`);
    console.log(`🔑  OTP CODE: ${otp}`);
    console.log(`==============================================\n`);
    try {
        if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('votre_email')) {
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ OTP Email sent successfully :', info.response);
        }
        else {
            console.log('⚠️  EMAIL NOT SENT: Your SMTP credentials are not configured in .env');
            console.log('💡  To test, use the OTP code displayed in the console above.');
        }
    }
    catch (error) {
        console.error('❌ Error sending OTP email:', error);
        // Only block registration if we are supposed to send a real email
        if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('votre_email')) {
            throw new Error('Error sending OTP email');
        }
    }
};
exports.sendOTP = sendOTP;
