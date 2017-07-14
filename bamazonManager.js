var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,

    //username
    user: "root",

    //password
    password: "root",
    database: "bamazonDB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;

    managerOptions();

});

function managerOptions() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product"
            ]
        })
        .then(function(answer) {
            switch (answer.action) {
                case "View Products for Sale":
                    viewProducts();
                    break;

                case "View Low Inventory":
                    lowInventory();
                    break;

                case "Add to Inventory":
                    addToInventory();
                    break;

                case "Add New Product":
                    newProduct();
                    break;
            }
        });
}


function viewProducts() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;

        var table = new Table({
            head: ['id', 'product_name', 'department_name', 'price', 'stock_quantity'],
            colWidths: [8, 15, 30, 15, 25]
        });

        results.forEach(function(item) {
            table.push(
                [item.id, item.product_name, item.department_name, item.price, item.stock_quantity]
            );
        });

        console.log(table.toString());
        managerOptions()


    });

}

function lowInventory() {
    connection.query("SELECT * FROM products where stock_quantity < 5", function(err, results) {
        if (err) throw err;

        var table = new Table({
            head: ['id', 'product_name', 'department_name', 'price', 'stock_quantity'],
            colWidths: [8, 15, 30, 15, 25]
        });

        results.forEach(function(item) {
            table.push(
                [item.id, item.product_name, item.department_name, item.price, item.stock_quantity]
            );
        });

        console.log(table.toString());
        managerOptions();


    });

}


function addToInventory() {
    inquirer
        .prompt([{
                name: "itemToAdd",
                type: "input",
                message: "What item would you like to add to ?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }, {
                name: "addMore",
                type: "input",
                message: "How many item would you like to add?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }

        ])
        .then(function(answer) {
            var query = "SELECT * FROM products WHERE ?";
            connection.query(query, { id: answer.itemToAdd }, function(err, res) {
                var newStockQty = res[0].stock_quantity + parseInt(answer.addMore);
                connection.query("UPDATE products SET ? WHERE ?", [{
                        stock_quantity: newStockQty
                    }, {
                        id: answer.itemToAdd
                    }],
                    function(err, results) {
                        if (err) throw error;
                        managerOptions();
                    }
                );
            });
        });

}


function newProduct() {
    inquirer
        .prompt([{
                name: "productName",
                type: "input",
                message: "Product Name?"
            }, {
                name: "departmentName",
                type: "input",
                message: "Department?"
            },
            {
                name: "price",
                type: "input",
                message: "Price?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "qty",
                type: "input",
                message: "Quantity?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }

        ])
        .then(function(answer) {
            var query = "INSERT INTO products SET ?";
            connection.query(query, { product_name: answer.productName, department_name: answer.departmentName, price: answer.price, stock_quantity: answer.qty }, function(err, res) {

                if (err) throw err;
                managerOptions();

            });
        });
}