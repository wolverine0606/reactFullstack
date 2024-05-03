import { RequestHandler } from "express";
import UserModel from "../models/user";
import crypto from "crypto";
import authVerificationTokenModel from "../models/authVerificationToken";
import nodemailer from "nodemailer";
import { sendErrorRes } from "../utils/helper";

export const createNewUser: RequestHandler = async (req, res, next) => {
  const { email, password, name } = req.body;
  if (!name) return sendErrorRes(res, "name is missing", 422);
  if (!email) return sendErrorRes(res, "email is missing", 422);

  if (!password) return sendErrorRes(res, "password is missing", 422);
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) return sendErrorRes(res, "email is already in use", 401);
  const user = await UserModel.create({ email, password, name });

  user.comparePassword(password);

  const token = crypto.randomBytes(36).toString("hex");

  await authVerificationTokenModel.create({ owner: user._id, token });

  const link = `http://localhost:8000/verify?id=${user._id}&token=${token}`;

  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "a51f0872466c3e",
      pass: "e7627884c8a943",
    },
  });
  await transport.sendMail({
    to: user.email,
    from: "verification@myapp.com",
    html: `<h1>Please click on <a href=${link}> this link </a> to verify your account.</h1>`,
  });

  res.json({ message: "Please check your inbox." });
};
