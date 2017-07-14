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

    stock();

});

function stock() {
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
        customerChoise();

    });

}

function customerChoise() {
    // prompt 
    inquirer
        .prompt([{
            name: "id",
            type: "input",
            message: "What is the ID of the product you would like to buy?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }, {
            name: "quantity",
            type: "input",
            message: "how many items of the product you would like to buy?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }])
        .then(function(answer) {
            var query = "SELECT * FROM products WHERE ?";
            connection.query(query, { id: answer.id }, function(err, res) {
                if (res[0].stock_quantity >= answer.quantity) {
                    var total = res[0].price * answer.quantity
                    console.log("---------------------------" + "\nYour Total: " + " " + total + "$" + "\nWe have palced your order" + "\nThanks" + "\n---------------------------");
                    var newStockQty = res[0].stock_quantity - answer.quantity;
                    connection.query(
                        "UPDATE products SET ? WHERE ?", [{
                            stock_quantity: newStockQty
                        }, {
                            id: answer.id
                        }],
                        function(err, results) {
                            if (err) throw error;
                            stock();
                        });


                } else {
                    console.log("Insufficient quantity!");
                    stock();
                    
                };
            });
        });
}
