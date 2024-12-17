const db = require('../config/db');
const { validationResult } = require('express-validator');



// Add Employee
exports.addEmployee = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, employee_id, phone_number, manager_id, department_name } = req.body;

    const insertEmployeeQuery = `
        INSERT INTO employees (name, email, employee_id, phone_number, manager_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    const insertDepartmentQuery = `
        INSERT INTO departments (employee_id, department_name)
        VALUES (?, ?)
    `;

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ message: 'Transaction error', error: err });

        // Step 1: Validate manager_id exists (if provided)
        const checkManagerQuery = manager_id ? `SELECT id FROM employees WHERE id = ?` : null;

        const checkManagerCallback = (err, results) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ message: 'Error checking manager', error: err });
                });
            }
            if (manager_id && results.length === 0) {
                return db.rollback(() => {
                    res.status(400).json({ message: 'Manager ID does not exist.' });
                });
            }
            insertEmployee();
        };

        if (manager_id) {
            db.query(checkManagerQuery, [manager_id], checkManagerCallback);
        } else {
            insertEmployee();
        }

        // Step 2: Insert into employees table
        function insertEmployee() {
            db.query(insertEmployeeQuery, [name, email, employee_id, phone_number, manager_id], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Error adding employee', error: err });
                    });
                }

                const newEmployeeId = result.insertId; // Get the auto-generated ID of the new employee

                // Step 3: Insert into departments table
                insertDepartment(newEmployeeId);
            });
        }

        function insertDepartment(newEmployeeId) {
            db.query(insertDepartmentQuery, [newEmployeeId, department_name], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Error adding department', error: err });
                    });
                }

                // Commit transaction
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ message: 'Transaction commit error', error: err });
                        });
                    }
                    res.status(201).json({ message: 'Employee and department added successfully' });
                });
            });
        }
    });
};


// Get Employees (with departments)
exports.getEmployees = (req, res) => {
    const query = `
        SELECT 
            e.id ,
            e.name,
            e.email,
            e.employee_id,
            e.phone_number,
            e.manager_id,
            d.department_name
        FROM employees e
        LEFT JOIN departments d ON e.id = d.employee_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching employees', error: err });
        }
        res.status(200).json(results);
    });
};

// Get Employee by ID
exports.getEmployee = (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT 
            e.id,
            e.name,
            e.email,
            e.phone_number,
            e.manager_id,
            d.department_name
        FROM employees e
        LEFT JOIN departments d ON e.id = d.employee_id
        WHERE e.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching employee', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(results[0]);
    });
};

// Update Employee
exports.updateEmployee = (req, res) => {
    const { id } = req.params;
    const { name, email, phone_number, manager_id, department_name } = req.body;

    const updateEmployeeQuery = `
        UPDATE employees 
        SET name = ?, email = ?, phone_number = ?, manager_id = ?
        WHERE id = ?
    `;

    const updateDepartmentQuery = `
        UPDATE departments 
        SET department_name = ?
        WHERE employee_id = ?
    `;

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ message: 'Transaction error', error: err });

        // Update employees table
        db.query(updateEmployeeQuery, [name, email, phone_number, manager_id, id], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ message: 'Error updating employee', error: err });
                });
            }

            // Update departments table
            db.query(updateDepartmentQuery, [department_name, id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Error updating department', error: err });
                    });
                }    

                // Commit transaction
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ message: 'Transaction commit error', error: err });
                        });
                    }
                    res.status(200).json({ message: 'Employee updated successfully' });
                });
            });
        });
    });
};

// Delete Employee
exports.deleteEmployee = (req, res) => {
    const { id } = req.params;

    const deleteDepartmentQuery = `
        DELETE FROM departments 
        WHERE employee_id = ?
    `;

    const deleteEmployeeQuery = `
        DELETE FROM employees 
        WHERE id = ? and employee_id=?
    `;

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ message: 'Transaction error', error: err });

        // Delete from departments table
        db.query(deleteDepartmentQuery, [id], (err) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ message: 'Error deleting department', error: err });
                });
            }

            // Delete from employees table
            db.query(deleteEmployeeQuery, [id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Error deleting employee', error: err });
                    });
                }

                // Commit transaction
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ message: 'Transaction commit error', error: err });
                        });
                    }
                    res.status(200).json({ message: 'Employee deleted successfully' });
                });
            });
        });
    });
};