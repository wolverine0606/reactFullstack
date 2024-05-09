//import 'dotenv/config'
import { RequestHandler } from "express";
import UserModel from "src/models/user";
import crypto from "crypto";
import authVerificationTokenModel from "src/models/authVerificationToken";
import { sendErrorRes } from "src/utils/helper";
import { sign, verify } from "jsonwebtoken";
import blacklistModel from "src/models/blacklist";
import { mail } from "src/utils/mail";
import PasswordResetTokenModel from "src/models/passwordResetToken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const VERIFICATION_LINK = process.env.VERIFICATION_LINK;
const PASSRESET_LINK = process.env.PASSRESET_LINK;

export const createNewUser: RequestHandler = async (req, res) => {
  const { email, password, name } = req.body;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) return sendErrorRes(res, "email is already in use", 401);
  const user = await UserModel.create({ email, password, name });

  user.comparePassword(password);

  const token = crypto.randomBytes(36).toString("hex");

  await authVerificationTokenModel.create({ owner: user._id, token });

  const link = `${VERIFICATION_LINK}?id=${user._id}&token=${token}`;
  mail.sendVerification(user.email, link);

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

  const accessToken = sign(payload, JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = sign(payload, JWT_SECRET);

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

export const generateVerificationLink: RequestHandler = async (req, res) => {
  //read incoming data
  const { id } = req.user;
  const token = crypto.randomBytes(36).toString("hex");
  const link = `${VERIFICATION_LINK}?id=${id}&token=${token}`;

  await authVerificationTokenModel.findOneAndDelete({ owner: id });

  await authVerificationTokenModel.create({ owner: id, token });

  await mail.sendVerification(req.user.email, link);

  res.json({ message: "check your inbox" });
};

export const refreshVerificationToken: RequestHandler = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) sendErrorRes(res, "Unauthorized request!", 403);

  const payload = verify(refreshToken, JWT_SECRET) as {
    id: string;
  };

  if (!payload.id) return sendErrorRes(res, "Unauthorized request!", 401);

  const user = await UserModel.findOne({
    _id: payload.id,
    tokens: refreshToken,
  });

  if (!user) {
    await UserModel.findByIdAndUpdate(payload.id, { tokens: [] });
    return sendErrorRes(res, "Unauthorized request!", 401);
  }
  const newAccessToken = sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "15m",
  });
  const newRefreshToken = sign({ id: user._id }, JWT_SECRET);

  const filtered = user.tokens.filter((t) => t !== refreshToken);

  user.tokens = filtered;
  user.tokens.push(newRefreshToken);

  await user.save();

  res.json({
    tokens: { refresh: newRefreshToken, access: newAccessToken },
  });
};

export const signOut: RequestHandler = async (req, res) => {
  const { refreshToken } = req.body;

  const user = await UserModel.findOne({
    _id: req.user.id,
    tokens: { $in: [refreshToken] },
  });

  if (!user) return sendErrorRes(res, "Unauthorized request!", 401);

  const filtered = user.tokens.filter((t) => t !== refreshToken);

  user.tokens = filtered;

  await user.save();

  res.json({
    message: "User signed out successfully!",
  });
};

export const generateForgetPassToken: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) return sendErrorRes(res, "User not found!", 404);
  // delete all the previous tokens
  await PasswordResetTokenModel.findOneAndDelete({ owner: user._id });
  const token = crypto.randomBytes(36).toString("hex");
  await PasswordResetTokenModel.create({ owner: user._id, token });
  const passResetLink = `${PASSRESET_LINK}?id=${user._id}&token=${token}`;
  // send email
  mail.sendPassReset(user.email, passResetLink);
  res.json({ message: "prease check your email" });
};

export const GrandValid: RequestHandler = (req, res) => {
  res.json({ valid: true });
};

export const updatePassword: RequestHandler = async (req, res) => {
  const { id, password } = req.body;

  const user = await UserModel.findById(id);

  if (!user) return sendErrorRes(res, "User not found!", 404);

  const matched = await user.comparePassword(password);
  if (matched)
    return sendErrorRes(
      res,
      "Your new password cannot be same as old password.",
      422
    );

  user.password = password;
  await user.save();
  console.log("user saved");

  const a = await PasswordResetTokenModel.findOneAndDelete({
    owner: user._id,
  });
  console.log(a);

  console.log("token deleted");

  await mail.sendPasswordUpdateMessage(user.email);
  console.log("mail sent");

  res.json({ message: "Password updated successfully!" });
};
