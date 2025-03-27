import inquirer from 'inquirer';
import db from './db/connection.js';
import consoleTable from 'console.table';
import figlet from 'figlet';
import chalk from 'chalk';

let bannerInit = true;

function displayBanner() {
    console.log(
        chalk.green(
            figlet.textSync('Employee Tracker', { font: 'Standard' })
        )
    );
}

// Call this function before starting your app


function mainMenu() {
    
    if(bannerInit){
    displayBanner();
}

    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Delete a department',
                'Delete a role',
                'Delete an employee',
                'View department budget',
                'Exit'
            ]
        }
    ]).then(answer => {
        switch (answer.action) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Delete a department':
                deleteDepartment(); 
                break;
            case 'Delete a role': 
                deleteRole(); 
                break;
            case 'Delete an employee':
                deleteEmployee(); 
                break;
            case 'View department budget':
                viewDepartmentBudget();
                break;
            default:
                bannerInit = true;
                db.end();
                console.log('Goodbye!');
        }
    });
}

// Function to view all departments
function viewDepartments() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        bannerInit = false;
        mainMenu();
    });
}

// Function to view all roles
function viewRoles() {
    db.query(
        `SELECT role.id, role.title, department.name AS department, role.salary 
         FROM role 
         JOIN department ON role.department = department.id`, 
        (err, res) => {
            if (err) throw err;
            console.table(res.rows);
            bannerInit = false;
            mainMenu();
        }
    );
}

// Function to view all employees
function viewEmployees() {
    db.query(
        `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,
         CONCAT(manager.first_name, ' ', manager.last_name) AS manager
         FROM employee
         JOIN role ON employee.role_id = role.id
         JOIN department ON role.department = department.id
         LEFT JOIN employee manager ON employee.manager_id = manager.id`,
        (err, res) => {
            if (err) throw err;
            console.table(res.rows);
            bannerInit = false;
            mainMenu();
        }
    );
}

// Function to add a department
function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the department name:'
        }
    ]).then(answer => {
        db.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err) => {
            if (err) throw err;
            console.log('Department added!');
            bannerInit = false;
            mainMenu();
        });
    });
}

// Function to add a role
function addRole() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the role title:'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the role salary:'
            },
            {
                type: 'list',
                name: 'department',
                message: 'Select the department:',
                choices: res.rows.map(dept => ({ name: dept.name, value: dept.id }))
            }
        ]).then(answer => {
            db.query('INSERT INTO role (title, salary, department) VALUES ($1, $2, $3)',
                [answer.title, answer.salary, answer.department], 
                (err) => {
                    if (err) throw err;
                    console.log('Role added!');
                    bannerInit = false;
                    mainMenu();
                });
        });
    });
}

// Function to add an employee
function addEmployee() {
    db.query('SELECT * FROM role', (err, roles) => {
        if (err) throw err;

        db.query('SELECT * FROM employee', (err, employees) => {
            if (err) throw err;

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: 'Enter the employee first name:'
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: 'Enter the employee last name:'
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'Select the employee role:',
                    choices: roles.rows.map(role => ({ name: role.title, value: role.id }))
                },
                {
                    type: 'list',
                    name: 'manager_id',
                    message: 'Select the employee manager:',
                    choices: [{ name: 'None', value: null }, ...employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))]
                }
            ]).then(answer => {
                db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
                    [answer.first_name, answer.last_name, answer.role_id, answer.manager_id], 
                    (err) => {
                        if (err) throw err;
                        console.log('Employee added!');
                        bannerInit = false;
                        mainMenu();
                    });
            });
        });
    });
}

function updateEmployeeRole() {
    db.query('SELECT id, first_name, last_name FROM employee', (err, employees) => {
        if (err) throw err;

        db.query('SELECT id, title FROM role', (err, roles) => {
            if (err) throw err;

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: 'Select the employee to update:',
                    choices: employees.rows.map(emp => ({
                        name: `${emp.first_name} ${emp.last_name}`,
                        value: emp.id
                    }))
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'Select the new role:',
                    choices: roles.rows.map(role => ({
                        name: role.title,
                        value: role.id
                    }))
                }
            ]).then(answer => {
                db.query('UPDATE employee SET role_id = $1 WHERE id = $2',
                    [answer.role_id, answer.employee_id],
                    (err) => {
                        if (err) throw err;
                        console.log('Employee role updated successfully!');
                        bannerInit = false;
                        mainMenu();
                    });
            });
        });
    });
}

function deleteDepartment() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the department to delete:',
                choices: res.rows.map(dept => ({ name: dept.name, value: dept.id }))
            }
        ]).then(answer => {
            db.query('DELETE FROM department WHERE id = $1', [answer.department_id], (err) => {
                if (err) throw err;
                console.log('Department deleted successfully!');
                bannerInit = false;
                mainMenu();
            });
        });
    });
}

function deleteRole() {
    db.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the role to delete:',
                choices: res.rows.map(role => ({ name: role.title, value: role.id }))
            }
        ]).then(answer => {
            db.query('DELETE FROM role WHERE id = $1', [answer.role_id], (err) => {
                if (err) throw err;
                console.log('Role deleted successfully!');
                bannerInit = false;
                mainMenu();
            });
        });
    });
}

function deleteEmployee() {
    db.query('SELECT id, first_name, last_name FROM employee', (err, res) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select the employee to delete:',
                choices: res.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))
            }
        ]).then(answer => {
            db.query('DELETE FROM employee WHERE id = $1', [answer.employee_id], (err) => {
                if (err) throw err;
                console.log('Employee deleted successfully!');
                bannerInit = false;
                mainMenu();
            });
        });
    });
}

function viewDepartmentBudget() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'department_id',
                message: 'Select a department to view its total budget:',
                choices: res.rows.map(dept => ({ name: dept.name, value: dept.id }))
            }
        ]).then(answer => {
            const query = `
                SELECT department.name AS department, SUM(role.salary) AS total_budget
                FROM employee
                JOIN role ON employee.role_id = role.id
                JOIN department ON role.department = department.id
                WHERE department.id = $1
                GROUP BY department.name;
            `;

            db.query(query, [answer.department_id], (err, result) => {
                if (err) throw err;

                if (result.rows.length === 0) {
                    console.log(`No employees found in this department.`);
                } else {
                    console.table(result.rows);
                }
                bannerInit = false;
                mainMenu();
            });
        });
    });
}



mainMenu();
