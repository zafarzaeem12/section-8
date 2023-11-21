import fs from "fs";
import nodemailer from "nodemailer";
import { emailConfig } from "../Config/emailConfig.js";

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(emailConfig);

// Converting Stream to Buffer
export const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const buffers = [];
    stream.on("data", (data) => buffers.push(data));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(buffers)));
  });
};

// GetFile Content
export const getFileContent = async (filePath) => {
  const fileStream = fs.createReadStream(filePath);
  const buffer = await streamToBuffer(fileStream);
  return buffer.toString();
};

// send mail with defined transport object
export const sendEmails = (to, subject, content,attachments, next) => {
  try {
    const message = {
      from: {
        name: process.env.MAIL_FROM_NAME,
        address: process.env.MAIL_USERNAME,
      },
      to: to,
      subject: subject,
      html: content,
      attachments,

    };
    transporter.sendMail(message, next);
  } catch (error) {
    console.error(error);
  }
};
