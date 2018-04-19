let mysql = require('promise-mysql')
let inquirer = require('inquirer')
let ansi = require('ansicolor')
let asTable = require('as-table').configure({
    title: x => ansi.red(x),
    delimiter: ansi.black(' | '),
    dash: ansi.black('-')
})
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
                    lowInv()
                    break
                case 'Add to Inventory':
                    addInv()
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
        .then(prodAdded => console.log("\n" + `The new product named ${ansi.red(prodAdded)} has been added!` + "\n"))
        .then(next => runMgr())
}

function viewProd() {
    let query = 'SELECT * FROM products'
    return dbConnection.query(query)
        .then(allProd => {
            console.log("\n" + ansi.cyan(asTable(allProd)) + "\n")
        })
        .then(next => runMgr())
}

function lowInv() {
    let query = 'SELECT * FROM products WHERE stock_quantity < 5'
    return dbConnection.query(query)
        .then(lowProd => {
            console.log("\n" + ansi.cyan(asTable(lowProd)) + "\n")
        })
        .then(next => runMgr())
}

function addInv() {
    inquirer.prompt([{
            type: 'list',
            name: 'addType',
            message: 'To add inventory, select a method to find an existing product:',
            choices: ['Search by Product Name', 'View List of Product Names', 'Return to Menu']
        }])
        .then(function (answers) {
            switch (answers.addType) {
                case 'Search by Product Name':
                    searchProdNames()
                    break
                case 'View List of Product Names':
                    listProdNames()
                    break
                case 'Return to Menu':
                    runMgr()
                    break
            }
        })
}

function searchProdNames() {
    let selectedProduct = ''
    return inquirer.prompt([{
            type: 'input',
            name: 'product',
            message: 'Enter a product name to search:'
        }])
        .then(answers => {
            selectedProduct = answers.product
            let query = 'SELECT * FROM products WHERE ?'
            return dbConnection.query(query, {
                    product_name: selectedProduct
                })
                .then(searchResult => {
                    if (searchResult.length >= 1) {
                        getQuantity(selectedProduct)
                    } else {
                        console.log("\n" + `Oh no! There were no products named ${ansi.red(selectedProduct)} found. Please search again or use the "View List of Product Names" option to make your selection.` + "\n")
                        addInv()
                    }
                })
        })
}

function listProdNames() {
    let selectedProduct = ''
    let query = 'SELECT product_name FROM products'
    return dbConnection.query(query)
        .then(prodList => {
            let prodArr = []
            for (let i = 0; i < prodList.length; i++) {
                prodArr.push(prodList[i].product_name)
            }
            return prodArr
        })
        .then(arr => {
            return inquirer.prompt([{
                type: 'list',
                name: 'product',
                message: 'Select a product:',
                choices: arr
            }])
        })
        .then(selection => getQuantity(selection.product))
}

function getQuantity(selection) {
    return inquirer.prompt([{
            type: 'input',
            name: 'addQuantity',
            message: `Enter quantity of additional stock to add to ${ansi.red(selection)}:`,
            validate: function (input) {
                if (isNaN(input)) {
                    console.log(ansi.red(` Please enter a number!`))
                    return false
                } else if (input === '') {
                    console.log(ansi.red(`Please enter a quantity!`))
                    return false
                } else if (input < 0) {
                    console.log(ansi.red(` Please enter a quantity greater than 0!`))
                    return false
                }
                return true
            }
        }])
        .then(added => sumQuantityUpdate(selection, added.addQuantity))
}

function sumQuantityUpdate(product, amountAdded) {
    //get current quantity, then add user inputed quantity, then update db
    return dbConnection.query('SELECT stock_quantity FROM products WHERE ?', {
            product_name: product
        })
        .then(count => parseInt(count[0].stock_quantity) + parseInt(amountAdded))
        .then(sum => {
            dbConnection.query('UPDATE products SET ? WHERE ?', [{
                    stock_quantity: sum
                },
                {
                    product_name: product
                }
            ])
            return sum
        })
        .then(sum => console.log("\n" + `The stock quantity of ${ansi.red(product)} was increased by ${ansi.red(amountAdded)} units to a total of ${ansi.red(sum)} units!` + "\n"))
        .then(next => runMgr())
}