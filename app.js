// DEPENDENCIES
const mysql = require("mysql");
const inquirer = require("inquirer");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");

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
connection.query("SELECT * FROM employee_DB.department",function(err,data) {
    if (err) throw err;
    else {
        for (var i=0;i<data.length;i++) {
            departmentArray.push(data[i].name);
        };
    };
});

let rolesArray = [];
connection.query("SELECT * FROM employee_DB.role",function(err,data) {
    if (err) throw err;
    else {
        for (var j=0;j<data.length;j++) {
            rolesArray.push(data[j].title);
        };
    };
});


function askQuestions() {
    inquirer.prompt([
        {
            type:"list",
            message:"What would you like to do?",
            choices:["View All Employees","View All Employees by DEPARTMENT","View All Employees by ROLE","Add Employee","Add Department","Add Role","Update Employee","Quit"],
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
            default:
                console.log("Thank you for using the Employee Tracker!");
                connection.end();
                break;
        }
    })
};

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