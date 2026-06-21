-- SmartSeller AI - PostgreSQL Database Schema DDL

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Index for user search
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    user_id INT,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    CONSTRAINT fk_products_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index for category search
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 3. Competitors Table
CREATE TABLE IF NOT EXISTS competitors (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_competitors_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Index for product competitor search
CREATE INDEX IF NOT EXISTS idx_competitors_product_id ON competitors(product_id);

-- 4. Sales Data Table
CREATE TABLE IF NOT EXISTS sales_data (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    date DATE NOT NULL,
    units_sold INT NOT NULL,
    CONSTRAINT fk_sales_data_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Index for time-series forecasting query optimization
CREATE INDEX IF NOT EXISTS idx_sales_data_product_date ON sales_data(product_id, date);

-- 5. Forecasts Table
CREATE TABLE IF NOT EXISTS forecasts (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    predicted_demand INT NOT NULL,
    CONSTRAINT fk_forecasts_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Index for forecasts lookup
CREATE INDEX IF NOT EXISTS idx_forecasts_product_id ON forecasts(product_id);

-- 6. Pricing Recommendations Table
CREATE TABLE IF NOT EXISTS pricing_recommendations (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    suggested_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_pricing_rec_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Index for pricing recommendations lookup
CREATE INDEX IF NOT EXISTS idx_pricing_rec_product_id ON pricing_recommendations(product_id);
