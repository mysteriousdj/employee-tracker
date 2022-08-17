const connection = require('./config/connections');
const inquirer = require('inquirer');
const cTable = require('console.table');

// const viewAllDepartments = ()=>{
//  connection.query('SELECT * FROM department', function(error,results){
//   console.table(results)
// }) 
// }

const promptUser = () => {
    inquirer.prompt([
        {
            name: 'choices',
            type: 'list',
            message: 'What would you like to do?',
            choices:[
                'View All Employees',
                'Add Employee',
                'Update Employee Role',
                'View All Roles',
                'Add Role',
                'View All Departments',
                'Add Department',
                'Quit' 
                //Bonus
                // 'View Employees by manager'
                // 'View All Employees By Department',
                // 'View Department Budgets',
                // 'Update Employee Manager',
                // 'Remove Employee',
                // 'Remove Role',
                // 'Remove Department',
                
            ]
        }
    ])
    .then((answers) => {
        const {choices} = answers;
            if(choices === 'View All Employees'){
                viewAllEmployees();
            }
            if (choices === 'Add Employee'){
                addEmployee();
            }
            if (choices === 'Update Employee Role'){
                updateEmployeeRoles();
            }
            if (choices === 'View All Roles') {
                viewAllRoles();
            }
            if (choices === 'Add Role') {
                addRole();
            }
            if (choices === 'View All Departments') {
                viewAllDepartments();
            }
            if (choices === 'Add Department') {
                addDepartment();
            }
            if (choices === 'Quit') {
                connection.end();
            }
    });
};

const viewAllEmployees = () => {
  connection.query(`
  SELECT employee.id, employee.first_name, employee.last_name, role.title, 
  department.name AS 'department', 
  role.salary
  FROM employee, role, department 
  WHERE department.id = role.department_id 
  AND role.id = employee.role_id
  ORDER BY employee.id ASC`, function(err, results){
    if(err) console.log(err)

    console.table(results)
      promptUser();
    });
  };

  const viewAllRoles = () => {
    connection.query(`SELECT role.id, role.title, department.name AS department, role.salary
    FROM role INNER JOIN department ON role.department_id = department.id;`, function(err, results){

    if(err) console.log(err)

    console.table(results);
        promptUser();
    });
};

const viewAllDepartments = () => {
  connection.query('SELECT * FROM department', function(error,results){
    console.table(results)
  })
  };

  const addEmployee = () => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'fistName',
        message: "What is the employee's first name?",
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
      }
    ])
      .then(answer => {
      const crit = [answer.fistName, answer.lastName]
      const roleSql = `SELECT role.id, role.title FROM role`;
      connection.promise().query(roleSql, (error, data) => {
        if (error) throw error; 
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
        inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: "What is the employee's role?",
                choices: roles
              }
            ])
              .then(roleChoice => {
                const role = roleChoice.role;
                crit.push(role);
                const managerSql =  `SELECT * FROM employee`;
                connection.promise().query(managerSql, (error, data) => {
                  if (error) throw error;
                  const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                  inquirer.prompt([
                    {
                      type: 'list',
                      name: 'manager',
                      message: "Who is the employee's manager?",
                      choices: managers
                    }
                  ])
                    .then(managerChoice => {
                      const manager = managerChoice.manager;
                      crit.push(manager);
                      const sql =   `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`;
                      connection.query(sql, crit, (error) => {
                      if (error) throw error;
                      console.log("Employee has been added!")
                      viewAllEmployees();
                });
              });
            });
          });
       });
    });
  };
  
  const addRole = () => {
    const sql = 'SELECT * FROM department'
    connection.promise().query(sql, (error, response) => {
        if (error) throw error;
        let deptNamesArray = [];
        response.forEach((department) => {deptNamesArray.push(department.department_name);});
        deptNamesArray.push('Create Department');
        inquirer
          .prompt([
            {
              name: 'departmentName',
              type: 'list',
              message: 'Which department is this new role in?',
              choices: deptNamesArray
            }
          ])
          .then((answer) => {
            if (answer.departmentName === 'Create Department') {
              this.addDepartment();
            } else {
              addRoleResume(answer);
            }
          });
  
        const addRoleResume = (departmentData) => {
          inquirer
            .prompt([
              {
                name: 'newRole',
                type: 'input',
                message: 'What is the name of the role?',
              },
              {
                name: 'salary',
                type: 'input',
                message: 'What is the salary of the role?',
              }
            ])
            .then((answer) => {
              let createdRole = answer.newRole;
              let departmentId;
  
              response.forEach((department) => {
                if (departmentData.departmentName === department.department_name) {departmentId = department.id;}
              });
  
              let sql =   `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
              let crit = [createdRole, answer.salary, departmentId];
  
              connection.promise().query(sql, crit, (error) => {
                if (error) throw error;
                console.log(`Added` + answer.newRoleResume + `to the database`);
                viewAllRoles();
              });
            });
        };
      });
    };
  
  const addDepartment = () => {
      inquirer
        .prompt([
          {
            name: 'newDepartment',
            type: 'input',
            message: 'What is the name of the department?',
            validate: validate.validateString
          }
        ])
        .then((answer) => {
          let sql =     `INSERT INTO department (department_name) VALUES (?)`;
          connection.query(sql, answer.newDepartment, (error, response) => {
            if (error) throw error;
            console.log((`Added` + answer.newDepartment + ` to the database`));
            viewAllDepartments();
          });
        });
  };
  
  const updateEmployeeRole = () => {
    let sql =       `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                    FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let employeeNamesArray = [];
      response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

      let sql =     `SELECT role.id, role.title FROM role`;
      connection.promise().query(sql, (error, response) => {
        if (error) throw error;
        let rolesArray = [];
        response.forEach((role) => {rolesArray.push(role.title);});

        inquirer
          .prompt([
            {
              name: 'chosenEmployee',
              type: 'list',
              message: 'Which employee has a new role?',
              choices: employeeNamesArray
            },
            {
              name: 'chosenRole',
              type: 'list',
              message: 'What is their new role?',
              choices: rolesArray
            }
          ])
          .then((answer) => {
            let newTitleId, employeeId;

            response.forEach((role) => {
              if (answer.chosenRole === role.title) {
                newTitleId = role.id;
              }
            });

            response.forEach((employee) => {
              if (
                answer.chosenEmployee ===
                `${employee.first_name} ${employee.last_name}`
              ) {
                employeeId = employee.id;
              }
            });

            let sqls =    `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
            connection.query(
              sqls,
              [newTitleId, employeeId],
              (error) => {
                if (error) throw error;
                console.log(`------------------------------------------------------------------------------------`);
                console.log(`Employee Role Updated`);
                console.log(`------------------------------------------------------------------------------------`);
                promptUser();
              }
            );
          });
      });
    });
  };

  promptUser();

  