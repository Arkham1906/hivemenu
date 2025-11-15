DROP DATABASE IF EXISTS hive;

CREATE DATABASE hive;

USE hive;

CREATE TABLE vendedores (
    id_vendedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    apellido_pat VARCHAR(255),
    apellido_mat VARCHAR(255),
    matricula VARCHAR(255),
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    edificio VARCHAR(255),
    carrera VARCHAR(255),
    grupo VARCHAR(255),
    cuatrimestre VARCHAR(255)
)ENGINE=InnoDB;

CREATE TABLE posts (
    id_post INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    precio DECIMAL(10,2),
    descripcion TEXT,
    status VARCHAR(255),
    vendedor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendedor_id) REFERENCES vendedores(id_vendedor) ON DELETE CASCADE
)ENGINE=InnoDB;

INSERT INTO vendedores (nombre, apellido_pat, apellido_mat, matricula, telefono, edificio, carrera, grupo, cuatrimestre) VALUES
('Andrés', 'López', 'Ramírez', 'A001', '5551111111', 'A', 'Sistemas', '1A', '1'),
('María', 'Gómez', 'Hernández', 'A002', '5552222222', 'B', 'Electrónica', '2B', '2'),
('Carlos', 'Pérez', 'Martínez', 'A003', '5553333333', 'C', 'Software', '3C', '3'),
('Fernanda', 'Torres', 'Ruiz', 'A004', '5554444444', 'D', 'Administración', '4D', '4'),
('Luis', 'Ramírez', 'Mendoza', 'A005', '5555555555', 'E', 'Industrial', '5E', '5');

INSERT INTO posts (nombre, precio, descripcion, status, vendedor_id) VALUES
('Galletas caseras', 50.00, 'Galletas artesanales hechas en casa.', 'Disponible', 1),
('Accesorios de resina', 120.00, 'Accesorios personalizados hechos de resina.', 'Disponible', 2),
('Playeras estampadas', 180.00, 'Playeras personalizadas con diseño.', 'Disponible', 3),
('Pulseras tejidas', 45.00, 'Pulseras tejidas a mano con hilo.', 'Disponible', 4),
('Carteras de piel', 250.00, 'Carteras hechas a mano con cuero genuino.', 'Disponible', 5);
