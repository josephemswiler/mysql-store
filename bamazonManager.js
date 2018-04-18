let mysql = require('promise-mysql')
let inquirer = require('inquirer')
let asTable = require('as-table')
let Product = require('./product.js')
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
        return runMgr()
    })


function runMgr() {
    inquirer.prompt([{
            type: 'list',
            name: 'mgrChoice',
            message: 'Select an option:',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Quit']
        }])
        .then(answer => {
            console.log(answer.mgrChoice)
            switch (answer.mgrChoice) {
                case 'View Products for Sale':
                    viewProd()
                    break
                case 'View Low Inventory':
                    break
                case 'Add to Inventory':
                    break
                case 'Add New Product':
                    addNew()
                    break
                case 'Quit':
                    dbConnection.end()
                    break
            }
        })
}

function addNew() {
    inquirer.prompt([{
                type: 'input',
                name: 'name',
                message: 'Enter name of new product:',
                validate: function (input) {
                    if (input === '') {
                        console.log('\x1b[31m%s\x1b[0m', `Please enter a product name!`)
                        return false
                    }
                    return true
                }
            },
            {
                type: 'input',
                name: 'dept',
                message: 'Enter department of new product:',
                validate: function (input) {
                    if (input === '') {
                        console.log('\x1b[31m%s\x1b[0m', `Please enter a department!`)
                        return false
                    }
                    return true
                }
            },
            {
                type: 'input',
                name: 'price',
                message: 'Enter price of new product:',
                validate: function (input) {
                    if (isNaN(input)) {
                        console.log('\x1b[31m%s\x1b[0m', ` Please enter a number!`)
                        return false
                    } else if (input === '') {
                        console.log('\x1b[31m%s\x1b[0m', `Please enter a price!`)
                        return false
                    }
                    return true
                }
            },
            {
                type: 'input',
                name: 'quantity',
                message: 'Enter quantity of new product:',
                validate: function (input) {
                    if (isNaN(input)) {
                        console.log('\x1b[31m%s\x1b[0m', ` Please enter a number!`)
                        return false
                    } else if (input === '') {
                        console.log('\x1b[31m%s\x1b[0m', `Please enter a quantity!`)
                        return false
                    }
                    return true
                }
            }
        ])
        .then(function (answers) {
            let newProd = new Product(answers.name, answers.dept, answers.price, answers.quantity)
            let query = 'INSERT INTO products SET ?'
            dbConnection.query(query, newProd, function (err, res) {})
            return answers.name
        })
        .then(prodAdded => console.log('\x1b[31m%s\x1b[0m', `The new product of ${prodAdded} has been added!`))
        .then(next => runMgr())
}

function viewProd() {
    let query = 'SELECT * FROM products'
    return dbConnection.query(query)
    .then(allProd => {
        console.log('\x1b[31m%s\x1b[0m', asTable(allProd))
    })
    .then(next => runMgr())

}