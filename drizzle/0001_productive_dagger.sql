CREATE TABLE `appointments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer,
	`doctor_name` text NOT NULL,
	`scheduled_for` text NOT NULL,
	`status` text DEFAULT 'scheduled',
	`created_at` text NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`medicine_name` text NOT NULL,
	`pharmacy_name` text NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`gender` text DEFAULT 'other',
	`age` integer NOT NULL,
	`village` text NOT NULL,
	`phone` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer,
	`diagnosis` text NOT NULL,
	`notes` text,
	`prescription` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
