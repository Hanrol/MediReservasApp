CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS users_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS doctors_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS appointments_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS medical_records_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'auth_app'@'%' IDENTIFIED BY 'auth_dev_123';
CREATE USER IF NOT EXISTS 'users_app'@'%' IDENTIFIED BY 'users_dev_123';
CREATE USER IF NOT EXISTS 'doctors_app'@'%' IDENTIFIED BY 'doctors_dev_123';
CREATE USER IF NOT EXISTS 'appointments_app'@'%' IDENTIFIED BY 'appointments_dev_123';
CREATE USER IF NOT EXISTS 'medical_records_app'@'%' IDENTIFIED BY 'medical_records_dev_123';

GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_app'@'%';
GRANT ALL PRIVILEGES ON users_db.* TO 'users_app'@'%';
GRANT ALL PRIVILEGES ON doctors_db.* TO 'doctors_app'@'%';
GRANT ALL PRIVILEGES ON appointments_db.* TO 'appointments_app'@'%';
GRANT ALL PRIVILEGES ON medical_records_db.* TO 'medical_records_app'@'%';
