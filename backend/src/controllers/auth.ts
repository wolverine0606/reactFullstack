import { RequestHandler } from "express";
import UserModel from "../models/user";
import crypto from "crypto";
import authVerificationTokenModel from "../models/authVerificationToken";
import nodemailer from "nodemailer";
import { sendErrorRes } from "../utils/helper";
import { sign } from "jsonwebtoken";
import blacklistModel from "../models/blacklist";

export const createNewUser: RequestHandler = async (req, res, next) => {
  const { email, password, name } = req.body;
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

export const verifyEmail: RequestHandler = async (req, res) => {
  //read incoming data
  const { id, token } = req.body;
  //find the token inside db using id
  const authToken = await authVerificationTokenModel.findOne({ owner: id });
  if (!authToken) return sendErrorRes(res, "unauthorized request!", 403);
  //compare the token
  const isMatched = await authToken.compareToken(token);
  if (!isMatched) return sendErrorRes(res, "unvalid token!", 403);
  //update the user
  await UserModel.findByIdAndUpdate(id, { verified: true });
  //delete the token
  await authVerificationTokenModel.findByIdAndDelete(authToken._id);

  res.json({ message: "thanks for joining us, your email is verified" });
};

export const signIn: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return sendErrorRes(res, "user not found", 403);
  const matchPass = await user.comparePassword(password);
  if (!matchPass) return sendErrorRes(res, "password is wrong", 403);

  const payload = { id: user._id };

  const accessToken = sign(payload, "secret", {
    expiresIn: "15m",
  });
  const refreshToken = sign(payload, "secret");

  if (!user.tokens) user.tokens = [refreshToken];
  else user.tokens.push(refreshToken);

  await user.save();

  res.json({
    profile: {
      id: user._id,
      email: user.email,
      verified: user.verified,
    },
    tokens: { refresh: refreshToken, access: accessToken },
  });
};

export const sendProfile: RequestHandler = async (req, res) => {
  res.json({
    profile: req.user,
  });
};

export const blacklistById: RequestHandler = async (req, res) => {
  const { id } = req.body;
  const user = await UserModel.findById(id);
  if (!user) return sendErrorRes(res, "user not found", 403);
  const isInBlackList = await blacklistModel.findOne({ email: user.email });
  if (isInBlackList) return sendErrorRes(res, "user already in blacklist", 403);

  await blacklistModel.create({
    email: user.email,
  });
  res.json({ message: `user with email ${user.email} has added to blacklist` });
};
