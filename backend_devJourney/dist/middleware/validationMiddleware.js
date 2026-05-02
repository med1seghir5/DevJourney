"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionSchema = exports.loginSchema = exports.registerSchema = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({
                success: false,
                message: `Validation Error: ${errorMessage}`
            });
        }
        next();
    };
};
exports.validate = validate;
exports.registerSchema = joi_1.default.object({
    username: joi_1.default.string().alphanum().min(3).max(30).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
exports.loginSchema = joi_1.default.object({
    identifier: joi_1.default.string().required(),
    password: joi_1.default.string().required(),
});
exports.submissionSchema = joi_1.default.object({
    challengeId: joi_1.default.string().required(),
    githubRepoLink: joi_1.default.string().uri().pattern(/^https:\/\/github\.com\/.+/).required()
        .messages({
        'string.pattern.base': 'GitHub Repo Link must be a valid https://github.com/ URL'
    }),
});
