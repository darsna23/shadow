-- seeds the mock "production" database that Debezium will watch
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    legacy_ref VARCHAR(50),
    created_at TIMESTAMP DEFAULT now()
);

INSERT INTO orders (customer_name, amount, status, legacy_ref) VALUES
 ('Asha Rao', 249.99, 'completed', 'LR-1001'),
 ('Vikram Shah', 89.50, 'pending', 'LR-1002'),
 ('Nia Fernandes', 15.00, 'completed', 'LR-1003');
