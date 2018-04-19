let mysql = require('promise-mysql')
let inquirer = require('inquirer')
let ansi = require('ansicolor')
let asTable = require('as-table').configure({
    title: x => ansi.red(x),
    delimiter: ansi.black(' | '),
    dash: ansi.black('-')
})
let dbConnection = null

mysql
    .createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'bamazon'
    })
    .then(connectionMade => {
        dbConnection = connectionMade
        return runSupervisor()
    })

function runSupervisor() {
    inquirer.prompt([{
            type: 'list',
            name: 'superOptions',
            message: 'Select an option:',
            choices: ['View Product Sales by Department', 'Create New Department', 'Quit']
        }])
        .then(answers => {
            switch (answers.superOptions) {
                case 'View Product Sales by Department':
                    deptSales()
                    break
                case 'Create New Department':
                    createDept()
                    break
                case 'Quit':
                    dbConnection.end()
                    break
            }
        })
}

function createDept() {
    return inquirer.prompt([{
            type: 'input',
            name: 'name',
            message: 'Enter name of new Department:'
        },
    {
        type: 'input',
        name: 'overhead',
        message: 'Enter overhead costs:',
        validate: function (input) {
            if (isNaN(input)) {
                console.log(ansi.red(` Please enter a number!`))
                return false
            } 
            return true
        }
    }])
        .then(answers => {
            dbConnection.query(`
                INSERT INTO departments SET ?`, {
                department_name: answers.name,
                over_head_costs: answers.overhead
            }, function (err, res) {})
            return answers.name
        })
        .then(name => console.log("\n" + `The new department ${ansi.red(name)} has been created!` + "\n"))
        .then(none => runSupervisor())
}

function deptSales() {
    let totalSalesQuery = 'SELECT sum(product_sales) AS "total_sales" FROM products;'
    
    dbConnection.query(`
        SELECT 
            * 
        FROM departments dept
            LEFT JOIN products p 
                ON product_sales
            WHERE p.department_name = dept.department_name`)
}