DROP DATABASE IF EXISTS buni;
CREATE DATABASE buni;
USE buni;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS scenery;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS forms;

CREATE TABLE roles (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    permissions JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    role_id VARCHAR(255) NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

CREATE TABLE events (
    id VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    organizador VARCHAR(255) NOT NULL,
    scenery JSON NOT NULL,
    programs JSON NOT NULL,
    cupos VARCHAR(255) NOT NULL,
    horarioInicio DATETIME NOT NULL,
    horarioFin DATETIME NOT NULL,
    state VARCHAR(255) NOT NULL,
    formAssists JSON NOT NULL,
    formInscriptions JSON NOT NULL,
    assists JSON NOT NULL,
    inscriptions JSON NOT NULL,
    formConfig JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sceneries (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    state VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE programs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    state VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forms (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    fields JSON NOT NULL,
    state VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER //
CREATE TRIGGER before_event_insert
BEFORE INSERT ON events
FOR EACH ROW
BEGIN
    IF NEW.formConfig IS NULL OR JSON_LENGTH(NEW.formConfig) = 0 THEN
        SET NEW.formConfig = JSON_OBJECT(
            'inscriptions', JSON_OBJECT(
                'enabled', false,
                'startDate', '',
                'endDate', ''
            ),
            'assists', JSON_OBJECT(
                'enabled', false,
                'startDate', '',
                'endDate', ''
            )
        );
    END IF;
END //
DELIMITER ;