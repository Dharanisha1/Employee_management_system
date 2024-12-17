// src/middleware/validation.js
const { body } = require('express-validator');

const validateEmployee = [
  body('name').isAlpha().notEmpty().withMessage('Name should only contain alphabets'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('phoneNumber').isNumeric().isLength({ min: 10, max: 15 }).withMessage('Invalid phone number'),
  body('employeeId').isAlphanumeric().withMessage('Employee ID must be alphanumeric'),
];

module.exports = validateEmployee;
