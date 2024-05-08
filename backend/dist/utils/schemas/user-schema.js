"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenSchema = exports.newUserSchema = void 0;
const mongoose_1 = require("mongoose");
const yup_1 = require("yup");
const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
(0, yup_1.addMethod)(yup_1.string, "email", function validateEmail(message) {
    return this.matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message,
        name: "email",
        excludeEmptyString: true,
    });
});
exports.newUserSchema = (0, yup_1.object)({
    name: (0, yup_1.string)().required("name is missing"),
    email: (0, yup_1.string)().email("invalid email!!!!!").required("email is missing"),
    password: (0, yup_1.string)()
        .required("password is missing")
        .min(8, "password must be at least 8 characters long")
        .matches(passRegex, {
        message: "password is too weak. it must contain upper and lowercase, special character and number",
    }),
});
exports.verifyTokenSchema = (0, yup_1.object)({
    id: (0, yup_1.string)().test({
        name: "valid-id",
        message: "Invalid user id",
        test: (value) => {
            return (0, mongoose_1.isValidObjectId)(value);
        },
    }),
    token: (0, yup_1.string)().required("token is missing"),
});
