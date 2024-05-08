"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const uri = "mongodb://0.0.0.0:27017/smart-cycle-market";
(0, mongoose_1.connect)(uri)
    .then(() => console.log("db connected successfully"))
    .catch((err) => {
    console.log(err);
});
