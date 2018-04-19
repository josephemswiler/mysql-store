# mysql-store

'Bamazon' is a CLI application that is based on an inventory tracking system. The user is able to use Node JS to query a database in MySQL to create, read, and update data. There are three files to run in Node JS:

* 'Customer View' - this view displays all products in the database to the user and then allows the user to purchase a product; if a product is purchased, the database is updated with data related to the sale

* 'Manager View' - this view allows the user to perform the following queries:
  * 'View Products for Sale'
  * 'View Low Inventory'
  * 'Add to Inventory' 
   * 'Search by Product Name'
   * 'View List of Product Names'
   * 'Return to Menu'
  * 'Add New Product'
  * 'Quit'
  
* 'Supervisor View' - this view includes a second database for departmeents and allows the user to perform the following queries:
  * 'View Product Sales by Department' - this query joins the products and departments database to calculate total profit by department
  * 'Create New Department'
  * 'Quit'
  
For additional information, see the walkthrough video below:
