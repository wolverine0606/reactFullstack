"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signOut = exports.refreshVerificationToken = exports.generateVerificationLink = exports.blacklistById = exports.sendProfile = exports.signIn = exports.verifyEmail = exports.createNewUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const crypto_1 = __importDefault(require("crypto"));
const authVerificationToken_1 = __importDefault(require("../models/authVerificationToken"));
const helper_1 = require("../utils/helper");
const jsonwebtoken_1 = require("jsonwebtoken");
const blacklist_1 = __importDefault(require("../models/blacklist"));
const mail_1 = require("../utils/mail");
const createNewUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = req.body;
    const existingUser = yield user_1.default.findOne({ email });
    if (existingUser)
        return (0, helper_1.sendErrorRes)(res, "email is already in use", 401);
    const user = yield user_1.default.create({ email, password, name });
    user.comparePassword(password);
    const token = crypto_1.default.randomBytes(36).toString("hex");
    yield authVerificationToken_1.default.create({ owner: user._id, token });
    const link = `http://localhost:8000/verify.html?id=${user._id}&token=${token}`;
    mail_1.mail.sendVerification(user.email, link);
    res.json({ message: "Please check your inbox." });
});
exports.createNewUser = createNewUser;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, token } = req.body;
    const authToken = yield authVerificationToken_1.default.findOne({ owner: id });
    if (!authToken)
        return (0, helper_1.sendErrorRes)(res, "unauthorized request!", 403);
    const isMatched = yield authToken.compareToken(token);
    if (!isMatched)
        return (0, helper_1.sendErrorRes)(res, "unvalid token!", 403);
    yield user_1.default.findByIdAndUpdate(id, { verified: true });
    yield authVerificationToken_1.default.findByIdAndDelete(authToken._id);
    res.json({ message: "thanks for joining us, your email is verified" });
});
exports.verifyEmail = verifyEmail;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_1.default.findOne({ email });
    if (!user)
        return (0, helper_1.sendErrorRes)(res, "user not found", 403);
    const matchPass = yield user.comparePassword(password);
    if (!matchPass)
        return (0, helper_1.sendErrorRes)(res, "password is wrong", 403);
    const payload = { id: user._id };
    const accessToken = (0, jsonwebtoken_1.sign)(payload, "secret", {
        expiresIn: "15m",
    });
    const refreshToken = (0, jsonwebtoken_1.sign)(payload, "secret");
    if (!user.tokens)
        user.tokens = [refreshToken];
    else
        user.tokens.push(refreshToken);
    yield user.save();
    res.json({
        profile: {
            id: user._id,
            email: user.email,
            verified: user.verified,
        },
        tokens: { refresh: refreshToken, access: accessToken },
    });
});
exports.signIn = signIn;
const sendProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        profile: req.user,
    });
});
exports.sendProfile = sendProfile;
const blacklistById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const user = yield user_1.default.findById(id);
    if (!user)
        return (0, helper_1.sendErrorRes)(res, "user not found", 403);
    const isInBlackList = yield blacklist_1.default.findOne({ email: user.email });
    if (isInBlackList)
        return (0, helper_1.sendErrorRes)(res, "user already in blacklist", 403);
    yield blacklist_1.default.create({
        email: user.email,
    });
    res.json({ message: `user with email ${user.email} has added to blacklist` });
});
exports.blacklistById = blacklistById;
const generateVerificationLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const token = crypto_1.default.randomBytes(36).toString("hex");
    const link = `http://localhost:8000/verify.html?id=${id}&token=${token}`;
    yield authVerificationToken_1.default.findOneAndDelete({ owner: id });
    yield authVerificationToken_1.default.create({ owner: id, token });
    yield mail_1.mail.sendVerification(req.user.email, link);
    res.json({ message: "check your inbox" });
});
exports.generateVerificationLink = generateVerificationLink;
const refreshVerificationToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { refreshToken } = req.body;
    console.log(refreshToken);
    if (!refreshToken)
        (0, helper_1.sendErrorRes)(res, "Unauthorized request!", 403);
    const payload = (0, jsonwebtoken_1.verify)(refreshToken, "secret");
    if (!payload.id)
        return (0, helper_1.sendErrorRes)(res, "Unauthorized request!", 401);
    const user = yield user_1.default.findOne({
        _id: payload.id,
        tokens: refreshToken,
    });
    if (!user) {
        yield user_1.default.findByIdAndUpdate(payload.id, { tokens: [] });
        return (0, helper_1.sendErrorRes)(res, "Unauthorized request!", 401);
    }
    const newAccessToken = (0, jsonwebtoken_1.sign)({ id: user._id }, "secret", {
        expiresIn: "15m",
    });
    const newRefreshToken = (0, jsonwebtoken_1.sign)({ id: user._id }, "secret");
    const filtered = user.tokens.filter((t) => t !== refreshToken);
    console.log(filtered);
    user.tokens = filtered;
    user.tokens.push(newRefreshToken);
    yield user.save();
    res.json({
        tokens: { refresh: newRefreshToken, access: newAccessToken },
    });
});
exports.refreshVerificationToken = refreshVerificationToken;
const signOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    const user = yield user_1.default.findOne({
        id: req.user.id,
        tokens: refreshToken,
    });
    if (!user)
        return (0, helper_1.sendErrorRes)(res, "Unauthorized request!", 401);
    const filtered = user.tokens.filter((t) => t !== refreshToken);
    user.tokens = filtered;
    yield user.save();
    res.json({
        message: "User signed out successfully!",
    });
});
exports.signOut = signOut;
