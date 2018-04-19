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
            }
        ])
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
    return dbConnection
        .query(`SELECT
                    d.*,
                    sum(p.product_sales) as product_sales,
                    sum(product_sales) - d.over_head_costs as total_profit
                FROM 
                    departments d
                LEFT JOIN products p ON p.department_name = d.department_name
                    WHERE p.product_sales IS NOT NULL
                GROUP BY d.department_name, d.department_id, d.over_head_costs
                ORDER BY d.department_id ASC;`)
        .then(table => {
            console.log("\n" + ansi.cyan(asTable(table)) + "\n")
        })
        .then(none => runSupervisor())
}