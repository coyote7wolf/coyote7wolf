'use strict';
const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
}).min(1);

const listUsersSchema = Joi.object({
  offset: Joi.number().integer().min(0).optional(),
  limit: Joi.number().integer().min(1).max(200).optional(),
});

module.exports = { createUserSchema, updateUserSchema, listUsersSchema };
