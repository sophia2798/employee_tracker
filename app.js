// DEPENDENCIES
const mysql = require("mysql");
const inquirer = require("inquirer");

// CREATE VARIABLE FOR MYSQL CONNECTION
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "hegt.hegt",
    database: "employee_DB"
});

// CONNECTION AND CONNECTION ID
connection.connect(function (err) {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    askQuestions();
});

// SET EMTPY GLOBAL ARRAYS TO USE FOR LISTS
let departmentArray = [];
let departmentWithID = [];
connection.query("SELECT * FROM employee_DB.department",function(err,data) {
    if (err) throw err;
    else {
        for (var i=0;i<data.length;i++) {
            departmentArray.push(data[i].name);
            let id = data[i].id + '. ' + data[i].name;
            departmentWithID.push(id);
        };
    };
});

let rolesArray = [];
let rolesWithID = [];
connection.query("SELECT * FROM employee_DB.role",function(err,data) {
    if (err) throw err;
    else {
        for (var j=0;j<data.length;j++) {
            rolesArray.push(data[j].title);
            let id = data[j].id + '. ' + data[j].title;
            rolesWithID.push(id);
        };
    };
});

let employeesWithID = ["N/A"];
connection.query("SELECT * FROM employee_DB.employee",function(err,data){
    if (err) throw err;
    else {
        for (var k=0;k<data.length;k++) {
        let id = data[k].id + '. ' + data[k].first_name + ' ' + data[k].last_name;
        employeesWithID.push(id);
        }
    };
})

// MAIN QUESTION FUNCTION 
function askQuestions() {
    inquirer.prompt([
        {
            type:"list",
            message:"What would you like to do?",
            choices:["View All Employees","View All Employees by DEPARTMENT","View All Employees by ROLE","Add Employee","Add Department","Add Role","Update Employee Role","Quit"],
            name:"action"
        },
        {
            type:"list",
            message:"Which department would you like to view?",
            choices:departmentArray,
            name:"employee_department",
            when:function(answers){
                if (answers.action === "View All Employees by DEPARTMENT") {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        {
            type:"list",
            message:"Which role would you like to view?",
            choices:rolesArray,
            name:"employee_role",
            when:function(answers){
                if (answers.action === "View All Employees by ROLE") {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        {
            type:"input",
            message:"What is the name of the new department?",
            name:"new_department",
            when:function(answers){
                if (answers.action === "Add Department") {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        {
            type:"input",
            message:"What is the title of the new role?",
            name:"role_title",
            when:function(answers){
                if (answers.action === "Add Role") {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        {
            type:"number",
            message:"What is the salary of the new role?",
            name:"role_salary",
            when:function(answers){
                if (answers.action === "Add Role") {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        {
            type:"list",
            message:"To what department does the new role belong?",
            choices:departmentWithID,
            name:"role_department",
            when:function(answers){
                if (answers.action === "Add Role") {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        {
            type:"input",
            message:"What is the new employee's first name?",
            name:"first_name",
            when:function(answers){
                if (answers.action === "Add Employee") {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        {
            type:"input",
            message:"What is the new employee's last name?",
            name:"last_name",
            when:function(answers){
                if (answers.action === "Add Employee") {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        {
            type:"list",
            message:"What is the new employee's role?",
            choices:rolesWithID,
            name:"new_employee_role",
            when:function(answers){
                if (answers.action === "Add Employee") {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        {
            type:"list",
            message:"Please input the ID of the employee's manager (optional)",
            name:"employee_manager",
            choices:employeesWithID,
            when:function(answers){
                if (answers.action === "Add Employee") {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        {
            type:"list",
            message:"Which employee's role would you like to update?",
            name:"change_employee_role",
            choices:employeesWithID,
            when:function(answers){
                if (answers.action === "Update Employee Role") {
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        {
            type:"list",
            message:"What is their updated role?",
            choices:rolesWithID,
            name:"updated_employee_role",
            when:function(answers){
                if(answers.action === "Update Employee Role" && answers.change_employee_role !== "") {
                    return true;
                }
                else {
                    return false;
                }
            }
         }
    ]).then(function(answers){
        switch (answers.action) {
            case "View All Employees":
                allEmployees();
                break;
            case "View All Employees by DEPARTMENT":
                allEmployeeDepartment(answers.employee_department);
                break;
            case "View All Employees by ROLE":
                allEmployeeRole(answers.employee_role);
                break;
            case "Add Department":
                addDepartment(answers.new_department);
                break;
            case "Add Role":
                let relatedID = answers.role_department.replace(/\D/g, "");
                addRole(answers.role_title,answers.role_salary,relatedID);
                break;
            case "Add Employee":
                let manager = "";
                let roleID = answers.new_employee_role.replace(/\D/g, "");
                if (answers.employee_manager === "N/A") {
                    manager = null;
                }
                else {
                    manager = answers.employee_manager.replace(/\D/g, "");
                }
                addEmployee(answers.first_name,answers.last_name,roleID,manager);
                break;
            case "Update Employee Role":
                let RoleID = answers.updated_employee_role.replace(/\D/g, "");
                let employeeID = answers.change_employee_role.replace(/\D/g, "");
                updateEmployeeRole(RoleID,employeeID);
                break;
            default:
                console.log("Thank you for using the Employee Tracker!");
                connection.end();
                break;
        }
    })
};


// QUERY FUNCTIONS
function allEmployees() {
    connection.query("SELECT employee.first_name AS First_Name, employee.last_name AS Last_Name, role.title AS Role, role.salary AS Salary, department.name AS Department, CONCAT(e.first_name,' ',e.last_name) AS Manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee e ON employee.manager_id = e.id ORDER BY employee.id",function(err,data){
        if (err) throw err;
        console.table(data);
        askQuestions();
    });
};

function allEmployeeDepartment(department) {
    connection.query("SELECT employee.first_name AS First_Name, employee.last_name AS Last_Name, role.title AS Role, role.salary AS Salary, department.name AS Department, CONCAT(e.first_name,' ',e.last_name) AS Manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee e ON employee.manager_id = e.id WHERE department.name = ?",department,function(err,data){
        if (err) throw err;
        console.table(data);
        askQuestions();
    });
};

function allEmployeeRole(role) {
    connection.query("SELECT employee.first_name AS First_Name, employee.last_name AS Last_Name, role.title AS Role, role.salary AS Salary, department.name AS Department, CONCAT(e.first_name,' ',e.last_name) AS Manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee e ON employee.manager_id = e.id WHERE role.title = ?",role,function(err,data){
        if (err) throw err;
        if (data.length === 0) {
            console.log("No one currently holds this role");
            askQuestions();
        }
        else {
        console.table(data);
        askQuestions();
        }
    });
};

function addDepartment(name) {
    connection.query("INSERT INTO employee_DB.department (name) VALUE (?)",name,function(err,data) {
        if (err) throw err;
        if (name.length > 30) {
            console.log("The department name is too long. Please try again.");
            askQuestions();
        }
        else {
            console.log(`You have successfully added the ${name} department!`);
            askQuestions();
        }
    })
};

function addRole(title,salary,department_id) {
    connection.query("INSERT INTO employee_DB.role (title,salary,department_id) VALUE (?,?,?)",[title,salary,department_id],function(err,data) {
        if (err) throw err;
        if (title.length > 30) {
            console.log("The role title is too long. Please try again.");
            askQuestions();
        }
        else {
            console.log(`You have successfully added the ${title} role!`);
            askQuestions();
        }
    })
};

function addEmployee(first,last,role_id,manager_id) {
    connection.query("INSERT INTO employee_DB.employee (first_name, last_name, role_id, manager_id) VALUE (?,?,?,?)",[first,last,role_id,manager_id],function(err,data) {
        if (err) throw err;
        if (first.length > 30 || last.length > 30) {
            console.log("The new employee's name is too long. Please try again.");
            askQuestions();
        }
        else {
            console.log(`You have successfully added the ${first} ${last} as a new employee!`);
            askQuestions();
        }
    })
};


function updateEmployeeRole(role_id,employee_id) {
    connection.query(`UPDATE employee_DB.employee SET role_id = ? WHERE id = ?`,[role_id,employee_id],function(err,data){
        if (err) throw err;
        else {
            console.log("You have successfully updated this employee's role!");
            askQuestions();
        }
    })
};