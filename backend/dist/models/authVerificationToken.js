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
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = require("bcrypt");
const mongoose_1 = require("mongoose");
const authVerificationToken = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: 86400,
        default: Date.now,
    },
});
authVerificationToken.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("token")) {
            const salt = yield (0, bcrypt_1.genSalt)(10);
            this.token = yield (0, bcrypt_1.hash)(this.token, salt);
        }
        next();
    });
});
authVerificationToken.methods.compareToken = function (token) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, bcrypt_1.compare)(token, this.token);
    });
};
const authVerificationTokenModel = (0, mongoose_1.model)("AuthVerificationToken", authVerificationToken);
exports.default = authVerificationTokenModel;
