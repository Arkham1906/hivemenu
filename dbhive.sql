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