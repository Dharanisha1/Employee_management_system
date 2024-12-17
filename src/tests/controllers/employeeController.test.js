const { 
  addEmployee, 
  getEmployees, 
  getEmployee, 
  updateEmployee, 
  deleteEmployee 
} = require('../../controllers/employeeController');
const db = require('../../config/db');

// Mock the database module
jest.mock('../../config/db');

describe('Employee Controller', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    mockRequest = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        employee_id: 'EMP001',
        phone_number: '1234567890',
        manager_id: 1,
        department_name: 'IT'
      },
      params: {
        id: 1
      }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('addEmployee', () => {
    test('should successfully add an employee', () => {
      // Mock successful transaction
      db.beginTransaction.mockImplementation(callback => callback(null));
      db.query.mockImplementation((query, params, callback) => {
        if (callback) {
          callback(null, { insertId: 1 });
        }
      });
      db.commit.mockImplementation(callback => callback(null));

      addEmployee(mockRequest, mockResponse);

      expect(db.beginTransaction).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Employee and department added successfully'
      });
    });

    test('should handle transaction error', () => {
      db.beginTransaction.mockImplementation(callback => callback(new Error('Transaction failed')));

      addEmployee(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Transaction error'
        })
      );
    });
  });

  describe('getEmployees', () => {
    test('should return all employees', () => {
      const mockEmployees = [
        { id: 1, name: 'John Doe', department_name: 'IT' }
      ];

      db.query.mockImplementation((query, callback) => {
        callback(null, mockEmployees);
      });

      getEmployees(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEmployees);
    });

    test('should handle database error', () => {
      db.query.mockImplementation((query, callback) => {
        callback(new Error('Database error'));
      });

      getEmployees(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error fetching employees'
        })
      );
    });
  });

  describe('getEmployee', () => {
    test('should return employee by id', () => {
      const mockEmployee = { id: 1, name: 'John Doe', department_name: 'IT' };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, [mockEmployee]);
      });

      getEmployee(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEmployee);
    });

    test('should return 404 when employee not found', () => {
      db.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      getEmployee(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Employee not found'
      });
    });
  });

  describe('updateEmployee', () => {
    test('should successfully update employee', () => {
      db.beginTransaction.mockImplementation(callback => callback(null));
      db.query.mockImplementation((query, params, callback) => {
        if (callback) callback(null);
      });
      db.commit.mockImplementation(callback => callback(null));

      updateEmployee(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Employee updated successfully'
      });
    });
  });

  describe('deleteEmployee', () => {
    test('should successfully delete employee', () => {
      db.beginTransaction.mockImplementation(callback => callback(null));
      db.query.mockImplementation((query, params, callback) => {
        if (callback) callback(null);
      });
      db.commit.mockImplementation(callback => callback(null));

      deleteEmployee(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Employee deleted successfully'
      });
    });
  });
});
