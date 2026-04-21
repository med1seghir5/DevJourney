import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const submissionSchema = Joi.object({
  challengeId: Joi.string().required(),
  githubRepoLink: Joi.string().uri().pattern(/^https:\/\/github\.com\/.+/).required()
    .messages({
      'string.pattern.base': 'GitHub Repo Link must be a valid https://github.com/ URL'
    }),
});
