
-- ==========================================
-- NEXUS CRM & INVENTORY AI - DATABASE SCHEMA
-- ==========================================

-- 1. Estructura de la Base de Datos
CREATE DATABASE IF NOT EXISTS nexus_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexus_crm;

-- 2. Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 0,
    price DECIMAL(15, 2) DEFAULT 0.00,
    location VARCHAR(100),
    rfid_tag VARCHAR(100) UNIQUE,
    last_counted DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sku (sku),
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- 3. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('ADMIN', 'MANAGER', 'WAREHOUSE') DEFAULT 'WAREHOUSE',
    avatar TEXT,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Tabla de Movimientos (Kardex)
CREATE TABLE IF NOT EXISTS movements (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 5. Sesiones de Inventario (Auditoría)
CREATE TABLE IF NOT EXISTS inventory_sessions (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM('TOTAL', 'PARTIAL', 'CYCLICAL') NOT NULL,
    status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
    created_by VARCHAR(50),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- 6. Detalle de Conteos
CREATE TABLE IF NOT EXISTS inventory_counts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    expected_stock INT NOT NULL,
    counted_stock INT NOT NULL,
    difference INT AS (counted_stock - expected_stock) STORED,
    FOREIGN KEY (session_id) REFERENCES inventory_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- DATOS INICIALES DE PRUEBA
-- ==========================================

-- Insertar Usuario Administrador
INSERT INTO users (id, name, email, role, avatar) VALUES 
('u1', 'Carlos Warehouse', 'admin@nexuscrm.com', 'MANAGER', 'https://picsum.photos/seed/user1/200/200');

-- Insertar Productos Iniciales
INSERT INTO products (id, sku, name, category, stock, min_stock, price, location) VALUES
('p1', 'LAP-001', 'MacBook Pro 14"', 'Laptops', 12, 5, 1999.00, 'Shelf A1'),
('p2', 'MOU-052', 'Logitech MX Master 3S', 'Accesorios', 45, 10, 99.00, 'Shelf B2'),
('p3', 'MON-101', 'Dell UltraSharp 27"', 'Monitores', 3, 10, 549.00, 'Shelf C1'),
('p4', 'KEY-902', 'Keychron Q1 V2', 'Accesorios', 8, 15, 169.00, 'Shelf B2');
