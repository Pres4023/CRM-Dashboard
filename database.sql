
-- ==========================================
-- NEXUS CRM & INVENTORY AI - DATABASE
-- ==========================================

CREATE DATABASE IF NOT EXISTS nexus_crm;
USE nexus_crm;

-- Tabla de Usuarios/Personal
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('ADMIN', 'MANAGER', 'WAREHOUSE', 'SELLER', 'SUPPLIER') DEFAULT 'WAREHOUSE',
    avatar TEXT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 10,
    price DECIMAL(15, 2) NOT NULL,
    location VARCHAR(100),
    rfid_tag VARCHAR(100) UNIQUE,
    last_counted DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Cotizaciones
CREATE TABLE IF NOT EXISTS quotations (
    id VARCHAR(36) PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30),
    total DECIMAL(15, 2) NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    user_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Ítems de Cotización
CREATE TABLE IF NOT EXISTS quotation_items (
    id VARCHAR(36) PRIMARY KEY,
    quotation_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Historial de Movimientos
CREATE TABLE IF NOT EXISTS movements (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL,
    reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Datos de Ejemplo para Testing
INSERT IGNORE INTO users (id, name, email, role, avatar) VALUES 
('u1', 'Administrador Nexus', 'admin@nexus.com', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos');

INSERT IGNORE INTO products (id, sku, name, category, stock, min_stock, price, location, rfid_tag) VALUES 
('p1', 'NX-001', 'Laptop Pro 16', 'Electrónica', 15, 5, 1200.00, 'Pasillo A-1', 'RFID-1001'),
('p2', 'NX-002', 'Monitor 4K Ultra', 'Electrónica', 3, 10, 450.00, 'Pasillo A-2', 'RFID-1002'),
('p3', 'NX-003', 'Teclado Mecánico RGB', 'Periféricos', 45, 15, 89.00, 'Pasillo B-1', 'RFID-1003');
