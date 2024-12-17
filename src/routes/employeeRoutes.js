const express = require('express');
const router = express.Router();
const { 
  addEmployee, 
  getEmployees, 
  getEmployee, 
  updateEmployee, 
  deleteEmployee 
} = require('../controllers/employeeController');

// CRUD Routes
router.post('/', addEmployee);
router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
