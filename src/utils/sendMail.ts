import {config} from "dotenv";
import nodeMailer from "nodemailer";

config();

const transporter = nodeMailer.createTransport({
  host: process.env.SEND_MAIL_HOST,
  service: process.env.SEND_MAIL_SERVICE,
  port: Number(process.env.SEND_MAIL_PORT),
  secure: Boolean(process.env.SEND_MAIL_SECURE),
  auth: {
    user: process.env.SEND_MAIL_USER,
    pass: process.env.SEND_MAIL_PASS,
  },
});

export const sendVerification = async (email:string, subject:string, link:string) => {
    try {
        const mailOptions = {
            from: process.env.SEND_MAIL_USER,
            to: email,
            subject: subject,
            text: "",
            html: link,
        }

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Failed to send verification email || token",error);
        throw error;
    }
}

