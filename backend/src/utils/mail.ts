import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "a51f0872466c3e",
    pass: "e7627884c8a943",
  },
});

const sendVerification = async (email: string, link: string) => {
  await transport.sendMail({
    to: email,
    from: "verification@myapp.com",
    html: `<h1>Please click on <a href=${link}> this link </a> to verify your account.</h1>`,
  });
};

export const mail = {
  sendVerification,
};
