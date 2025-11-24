'use strict';
const express = require('express');
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const {
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
} = require('../../../utils/validationSchemas');

module.exports = function userRoutes() {
  const router = express.Router();
  router.post('/', validate(createUserSchema), userController.createUser);
  router.get('/', validate(listUsersSchema, 'query'), userController.listUsers);
  router.get('/:id', userController.getUser);
  router.put('/:id', validate(updateUserSchema), userController.updateUser);
  router.delete('/:id', userController.deleteUser);
  return router;
};
