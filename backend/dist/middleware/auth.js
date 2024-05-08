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
exports.isAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = __importDefault(require("../models/user"));
const helper_1 = require("../utils/helper");
const isAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authToken = req.headers.authorization;
        if (!authToken)
            return (0, helper_1.sendErrorRes)(res, "unauthorized request", 403);
        const token = authToken.split("Bearer ")[1];
        const payload = (0, jsonwebtoken_1.verify)(token, "secret");
        const user = yield user_1.default.findById(payload.id);
        if (!user)
            return (0, helper_1.sendErrorRes)(res, "unauthorized request", 403);
        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified,
        };
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.TokenExpiredError) {
            return (0, helper_1.sendErrorRes)(res, "session expired", 401);
        }
        if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
            return (0, helper_1.sendErrorRes)(res, `unauthorized access ${err}`, 403);
        }
        next(err);
    }
});
exports.isAuth = isAuth;
