import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAIL_TRAP_USER,
    pass: process.env.MAIL_TRAP_PASS,
  },
});

const sendVerification = async (email: string, link: string) => {
  await transport.sendMail({
    to: email,
    from: "verification@myapp.com",
    html: `<h1>Please click on <a href=${link}> this link </a> to verify your account.</h1>`,
  });
};
const sendPassReset = async (email: string, link: string) => {
  await transport.sendMail({
    to: email,
    from: "security@myapp.com",
    html: `<h1>Please click on <a href=${link}> this link </a> to update your password.</h1>`,
  });
};
const sendPasswordUpdateMessage = async (email: string) => {
  await transport.sendMail({
    to: email,
    from: "security@myapp.com",
    html: `<h1>password updated successfully, you can now use your new password</h1>`,
  });
};

export const mail = {
  sendVerification,
  sendPassReset,
  sendPasswordUpdateMessage,
};
