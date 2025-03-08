CREATE TABLE `Users` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`email` VARCHAR(255) NOT NULL UNIQUE,
	`password` VARCHAR(255) NOT NULL,
	`role` ENUM('super-admin', 'pelapor', 'admin') NOT NULL,
	`nama` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `Reports` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`title` VARCHAR(255) NOT NULL,
	`violation` VARCHAR(255) NOT NULL,
	`location` VARCHAR(255) NOT NULL,
	`date` DATE NOT NULL,
	`actors` VARCHAR(255) NOT NULL,
	`detail` TEXT(65535) NOT NULL,
	`unique_code` VARCHAR(255) UNIQUE,
	`status` ENUM('menunggu-verifikasi', 'diproses', 'ditolak', 'selesai') NOT NULL,
	`rejection_reason` TEXT(65535),
	`admin_notes` TEXT(65535),
	`admin_id` INTEGER,
	`user_id` INTEGER,
	`is_anonymous` BOOLEAN,
	PRIMARY KEY(`id`)
);


CREATE TABLE `Chats` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`report_id` INTEGER NOT NULL,
	`message` TEXT(65535) NOT NULL,
	`user_id` INTEGER NOT NULL,
	`created_at` DATETIME,
	PRIMARY KEY(`id`)
);


CREATE TABLE `Notifications` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`user_id` INTEGER NOT NULL,
	`message` VARCHAR(255) NOT NULL,
	`is_read` BOOLEAN,
	PRIMARY KEY(`id`)
);


CREATE TABLE `Report_Files` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`report_id` INTEGER,
	`file_path` VARCHAR(255),
	`file_type` ENUM('evidence', 'handling_proof'),
	PRIMARY KEY(`id`)
);


ALTER TABLE `Users`
ADD FOREIGN KEY(`id`) REFERENCES `Notifications`(`user_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `Users`
ADD FOREIGN KEY(`id`) REFERENCES `Reports`(`user_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `Users`
ADD FOREIGN KEY(`id`) REFERENCES `Reports`(`admin_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `Users`
ADD FOREIGN KEY(`id`) REFERENCES `Chats`(`user_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `Reports`
ADD FOREIGN KEY(`id`) REFERENCES `Chats`(`report_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `Reports`
ADD FOREIGN KEY(`id`) REFERENCES `Report_Files`(`report_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;