"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const blacklist = new mongoose_1.Schema({
    email: { type: String, unique: true, required: true },
});
const blacklistModel = (0, mongoose_1.model)("blacklist", blacklist);
exports.default = blacklistModel;
