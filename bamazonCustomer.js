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
        return viewProd()
    })


function runCustomer() {
    let selectedId = ''
    let amount = 0
    let stock = 0
    inquirer.prompt([{
            type: 'input',
            name: 'prodId',
            message: 'Enter ID of the product you would like to buy:'
        }])
        .then(answers => {
            selectedId = answers.prodId
            return dbConnection.query('SELECT product_name FROM products WHERE ?', {
                id: answers.prodId
            })
        })
        .then(product => {
            return inquirer.prompt([{
                type: 'input',
                name: 'prodAmount',
                message: `Enter the quantity of ${ansi.red(product[0].product_name)} you would like to buy:`,
                validate: function (input) {
                    if (isNaN(input)) {
                        console.log(ansi.red(` Please enter a number!`))
                        return false
                    } else if (input === '') {
                        console.log(ansi.red(`Please enter a quantity!`))
                        return false
                    }
                    return true
                }
            }])
        })
        .then(answers => {
            amount = answers.prodAmount
            return dbConnection.query('SELECT stock_quantity FROM products WHERE ?', {
                id: selectedId
            })
        })
        .then(result => {
            stock = result[0].stock_quantity

        })
}

function viewProd() {
    let query = 'SELECT * FROM products'
    return dbConnection.query(query)
        .then(allProd => {
            console.log("\n" + ansi.cyan(asTable(allProd)) + "\n")
        })
        .then(next => runCustomer())
}