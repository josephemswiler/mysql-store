DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE products
(
    id INTEGER UNSIGNED AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(50) NULL,
    department_name VARCHAR(50) NULL,
    price FLOAT(10, 2) NULL,
    stock_quantity INTEGER(10) UNSIGNED NULL,
    PRIMARY KEY (id)
);

-- init db and create products table

INSERT INTO products (
    product_name, 
    department_name, 
    price, 
    stock_quantity
    )
    VALUES 
    (
        'Circe',
        'Books',
        29.98,
        800
    );