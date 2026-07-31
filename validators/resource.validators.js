// Note: middleware/validation.js uses .validateAsync(req.body)
// This suggests it expects a Joi schema.
const Joi = require("joi");

const authValidator = {
  register: Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required().trim(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("super_admin", "admin", "editor"),
  }),
  login: Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().required(),
  }),
};

const projectValidator = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  content: Joi.string(),
  image: Joi.string(),
  githubLink: Joi.string().uri().allow(""),
  liveLink: Joi.string().uri().allow(""),
  stack: Joi.array().items(Joi.string()),
  category: Joi.string().required(),
  featured: Joi.boolean(),
  order: Joi.number(),
  isActive: Joi.boolean(),
});

const blogValidator = Joi.object({
  title: Joi.string().required().trim(),
  content: Joi.string().required(),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()),
  coverImage: Joi.string(),
  published: Joi.boolean(),
});

const skillValidator = Joi.object({
  name: Joi.string().required().trim(),
  category: Joi.string().required(),
  level: Joi.string().valid("Beginner", "Intermediate", "Advanced", "Expert"),
  icon: Joi.string().allow(""),
  order: Joi.number(),
  isActive: Joi.boolean(),
});

// Generic validator for simpler resources
const genericValidator = Joi.object().unknown(true);

module.exports = {
  authValidator,
  projectValidator,
  blogValidator,
  skillValidator,
  genericValidator,
};
