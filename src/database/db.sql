CREATE DATABASE IF NOT EXISTS testDB;
USE testDB;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (name, email, password) VALUES
('John Doe', 'johndoe@gmail.com', 'password123'),
('Jane Doe', 'janedoe@gmail.com', 'password456'),
('John Smith', 'johnsmith@gmail.com', 'password789'),
('Jane Smith', 'janesmith@gmail.com', 'password101112');

INSERT INTO posts (user_id, title, content) VALUES
(1, 'Mi primer post', 'Este es mi primer post en la API.'),
(2, 'Hola mundo', 'Esta es una publicación de prueba.'),
(3, 'Node.js Rocks', 'Usar Express con MySQL es muy fácil.'),
(4, 'Seguridad en APIs', 'Aprende cómo proteger tu API en Node.js.');

SELECT * FROM users;