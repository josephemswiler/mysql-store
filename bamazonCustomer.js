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


function runCustomer(arr) {
    let selectedId = ''
    let selectedProd = ''
    let amount = 0
    let stock = 0
    let price = 0
    let rev = 0
    let idArr = arr

    inquirer.prompt([{
            type: 'input',
            name: 'prodId',
            message: 'Enter ID of the product you would like to buy:',
            validate: function (input) {
                if (idArr.includes(parseInt(input))) {
                    return true
                } 
                console.log(ansi.red(` Please enter a valid id!`))
                return false
            }
        }])
        .then(answers => {
            selectedId = answers.prodId
            return dbConnection.query('SELECT * FROM products WHERE ?', {
                id: answers.prodId
            })
        })
        .then(product => {
            price = product[0].price
            stock = product[0].stock_quantity
            selectedProd = product[0].product_name
            rev = product[0].product_sales
            return inquirer.prompt([{
                type: 'input',
                name: 'prodAmount',
                message: `Enter the quantity of ${ansi.red(selectedProd)} you would like to buy:`,
                validate: function (input) {
                    if (isNaN(input)) {
                        console.log(ansi.red(` Please enter a number!`))
                        return false
                    } else if (input === '') {
                        console.log(ansi.red(`Please enter a quantity!`))
                        return false
                    } else if (input > stock) {
                        console.log("\n\n" + ` Oh no! There are only ${ansi.red(stock)} units of ${ansi.red(selectedProd)} in stock! Please enter a quantity less than or equal to ${ansi.red(stock)}.` + "\n")
                        return false
                    }
                    return true
                }
            }])
        })
        .then(answers => buyThings(selectedProd, answers.prodAmount, stock, price, rev))
}

function viewProd() {
    let query = 'SELECT * FROM products'
    return dbConnection.query(query)
        .then(allProd => {
            let arr = []
            console.log("\n" + ansi.cyan(asTable(allProd)) + "\n")

            for (let i = 0; i < allProd.length; i++) {
                arr.push(allProd[i].id)
            }
            return arr
        })
        .then(arr => runCustomer(arr))
}

function buyThings(prod, amount, stock, price, rev) {
    let result = stock - amount
    let cost = amount * price
    let totRev = rev + cost
    return dbConnection.query('UPDATE products SET ?, ? WHERE ?', [{
                stock_quantity: result
            },
            {
                product_sales: totRev
            },
            {
                product_name: prod
            }
        ])
        .then(data => {
            return console.log("\n" + `Congrats! You bought ${ansi.red(amount)} units of ${ansi.red(prod)} for a total cost of ${ansi.red(cost)}` + "\n")
            //here
        })
        .then(data => dbConnection.end())

}