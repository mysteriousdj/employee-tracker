USE employee_db;
INSERT INTO department (name)
 VALUES ("Engineering"),
		("Finance"),
		("Legal"),
		("Sales");
-- SELECT * FROM department;

INSERT INTO role (title, department_id, salary) 
VALUES ("Sales Lead", "Sales", 100000),
("Salesperson", "Sales", 80000),
("Lead Engineer", "Engineering", 150000),
("Softwar Engineer", "Engineering", 120000),
("Account Manager", "Finance", 160000),
("Accountant", "Finance", 125000),
("Legal Team Lead", "Legal", 250000),
("Lawyer", "Legal", 190000),

-- SELECT * FROM role;

USE employee_db;

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES  ("John", "Doe",1, NULL),
		("Mike", "Chan", 2, 1),
		("Ashley", "Rodriguez", 3, NULL),
		("Kevin", "Tupik",  4, 3),
		("Kunal", "Singh", 5, NULL),
		("Malia", "Brown", 6, 5),
		("Sarah", "Lourd", 7, NULL),
		("Tom", "Allen", 8, 7),
-- SELECT * FROM employee;