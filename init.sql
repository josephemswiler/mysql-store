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

-- insert into products

DROP TABLE IF EXISTS departments;

CREATE TABLE departments
(
    department_id INTEGER UNSIGNED AUTO_INCREMENT NOT NULL,
    department_name VARCHAR(50) NULL,
    over_head_costs FLOAT(10, 2) DEFAULT 0 NULL,
    PRIMARY KEY (department_id)
);

-- create departments table

ALTER TABLE products
    ADD COLUMN product_sales FLOAT(10, 2) DEFAULT 0 AFTER stock_quantity;

-- to add column with default value of 0

ALTER TABLE products DROP COLUMN product_sales;

-- to delete column 

INSERT INTO departments (
    department_name
    )
    VALUES (
        ''
    );

INSERT INTO departments SET {
        department_name: name
    };

--to add departments

SELECT
	d.*,
    sum(p.product_sales) as product_sales,
    sum(product_sales) - d.over_head_costs as total_profit
FROM
    departments d
       LEFT JOIN
       products p ON p.department_name = d.department_name
       WHERE p.product_sales IS NOT NULL
GROUP BY d.department_name, d.department_id, d.over_head_costs
ORDER BY d.department_id ASC;

--join sum product_sales & total_profit alias