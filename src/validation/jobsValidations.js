import Joi from "joi";

export const createJobSchema = Joi.object({
  title: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),
  description: Joi.string().max(500).allow("").optional(),
  priority: Joi.number().integer().valid(1, 2, 3).default(1).messages({
    "any.only": "Priority must be 1 (Low), 2 (Medium), or 3 (High)",
  }),
});