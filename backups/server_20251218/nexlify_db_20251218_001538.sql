-- MySQL dump 10.19  Distrib 10.3.35-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: nexlify_io
-- ------------------------------------------------------
-- Server version	10.3.35-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_keys`
--

DROP TABLE IF EXISTS `api_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `api_keys` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key_prefix` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `last_used` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `revoked_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_hash` (`key_hash`),
  KEY `idx_api_keys_tenant` (`tenant_id`),
  CONSTRAINT `fk_api_keys_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_keys`
--

LOCK TABLES `api_keys` WRITE;
/*!40000 ALTER TABLE `api_keys` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_log_proofs`
--

DROP TABLE IF EXISTS `audit_log_proofs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_log_proofs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audit_log_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anchor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leaf_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proof` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `positions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `audit_log_id` (`audit_log_id`),
  KEY `idx_audit_log_proofs_anchor` (`anchor_id`),
  CONSTRAINT `fk_audit_log_proofs_anchor` FOREIGN KEY (`anchor_id`) REFERENCES `blockchain_anchors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_audit_log_proofs_audit_log` FOREIGN KEY (`audit_log_id`) REFERENCES `audit_logs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log_proofs`
--

LOCK TABLES `audit_log_proofs` WRITE;
/*!40000 ALTER TABLE `audit_log_proofs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_log_proofs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actor_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `method` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_body` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `response_status` int(11) DEFAULT NULL,
  `changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `event_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `anchor_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_tenant` (`tenant_id`),
  KEY `idx_audit_logs_tenant_timestamp` (`tenant_id`,`timestamp`),
  KEY `idx_audit_logs_action` (`action`),
  KEY `idx_audit_logs_actor` (`actor_id`),
  KEY `idx_audit_logs_event_hash` (`event_hash`),
  KEY `fk_audit_logs_anchor` (`anchor_id`),
  CONSTRAINT `fk_audit_logs_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_audit_logs_anchor` FOREIGN KEY (`anchor_id`) REFERENCES `blockchain_anchors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_audit_logs_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blockchain_anchors`
--

DROP TABLE IF EXISTS `blockchain_anchors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blockchain_anchors` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `merkle_root` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tx_hash` varchar(66) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `block_number` int(11) DEFAULT NULL,
  `chain_id` int(11) DEFAULT NULL,
  `event_count` int(11) NOT NULL,
  `status` enum('pending','confirmed','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `anchored_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `merkle_root` (`merkle_root`),
  KEY `idx_blockchain_anchors_tx_hash` (`tx_hash`),
  KEY `idx_blockchain_anchors_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blockchain_anchors`
--

LOCK TABLES `blockchain_anchors` WRITE;
/*!40000 ALTER TABLE `blockchain_anchors` DISABLE KEYS */;
/*!40000 ALTER TABLE `blockchain_anchors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modules` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_i18n_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description_i18n_key` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manifest` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('available','deprecated','removed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_i18n_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body_i18n_key` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_user_read` (`user_id`,`read_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `risk_history`
--

DROP TABLE IF EXISTS `risk_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `risk_history` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `risk_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_risk_history_risk` (`risk_id`),
  KEY `idx_risk_history_timestamp` (`timestamp`),
  KEY `fk_risk_history_actor` (`actor_id`),
  CONSTRAINT `fk_risk_history_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_risk_history_risk` FOREIGN KEY (`risk_id`) REFERENCES `risks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `risk_history`
--

LOCK TABLES `risk_history` WRITE;
/*!40000 ALTER TABLE `risk_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `risk_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `risks`
--

DROP TABLE IF EXISTS `risks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `risks` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detector_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_i18n_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description_i18n_key` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `severity` enum('low','medium','high','critical') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','acknowledged','mitigated','resolved','false_positive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `category` enum('legal','payroll','security','ops','finance','compliance') COLLATE utf8mb4_unicode_ci NOT NULL,
  `likelihood` decimal(3,2) NOT NULL,
  `impact_eur` int(11) NOT NULL,
  `entities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `evidence` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `recommended_actions_i18n_key` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_to` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detected_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `acknowledged_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolution_notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_risks_tenant` (`tenant_id`),
  KEY `idx_risks_tenant_status` (`tenant_id`,`status`),
  KEY `idx_risks_tenant_severity` (`tenant_id`,`severity`),
  KEY `idx_risks_module` (`module_id`),
  KEY `idx_risks_detected_at` (`detected_at`),
  KEY `fk_risks_assigned_to` (`assigned_to`),
  KEY `fk_risks_acknowledged_by` (`acknowledged_by`),
  KEY `fk_risks_resolved_by` (`resolved_by`),
  CONSTRAINT `fk_risks_acknowledged_by` FOREIGN KEY (`acknowledged_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_risks_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_risks_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_risks_resolved_by` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_risks_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `risks`
--

LOCK TABLES `risks` WRITE;
/*!40000 ALTER TABLE `risks` DISABLE KEYS */;
/*!40000 ALTER TABLE `risks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `revoked_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_sessions_user` (`user_id`),
  KEY `idx_sessions_expires_at` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_modules`
--

DROP TABLE IF EXISTS `tenant_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenant_modules` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive','error') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `installed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `activated_at` timestamp NULL DEFAULT NULL,
  `deactivated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tenant_modules_tenant_module` (`tenant_id`,`module_id`),
  KEY `fk_tenant_modules_module` (`module_id`),
  CONSTRAINT `fk_tenant_modules_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tenant_modules_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_modules`
--

LOCK TABLES `tenant_modules` WRITE;
/*!40000 ALTER TABLE `tenant_modules` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenants` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan` enum('essential','professional','enterprise') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'essential',
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `stripe_customer_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_subscription_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','suspended','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_tenants_slug` (`slug`),
  KEY `idx_tenants_stripe_customer` (`stripe_customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('ae1b13a8-6425-4d20-8c2d-c554f62fb7b1','lballanti.lb@gmail.com','lballanti-lb-gmail-com-mjaknlg9','enterprise',NULL,'cus_TciVP7zxpRCaOl','sub_1SfTguBMT9gV68TItHLtXtkr','active','2025-12-17 22:17:09','2025-12-17 23:11:12',NULL);
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_permissions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `granted_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_permissions_user_perm` (`user_id`,`permission`),
  KEY `fk_user_permissions_granted_by` (`granted_by`),
  CONSTRAINT `fk_user_permissions_granted_by` FOREIGN KEY (`granted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
INSERT INTO `user_permissions` VALUES ('040f33ed-cb3e-434d-9230-45ce523d12ab','7eb92fd9-f11f-4884-bf93-af4a4df1112b','settings.write','2025-12-17 22:17:09',NULL),('190f9e41-b564-4032-b896-b2f71ee74cbe','7eb92fd9-f11f-4884-bf93-af4a4df1112b','billing.manage','2025-12-17 22:17:09',NULL),('1e63c1db-cf03-4e3c-a257-c9ced6983485','7eb92fd9-f11f-4884-bf93-af4a4df1112b','billing.read','2025-12-17 22:17:09',NULL),('328efde7-b16f-478b-b4ad-f9254b4999fe','7eb92fd9-f11f-4884-bf93-af4a4df1112b','settings.read','2025-12-17 22:17:09',NULL),('4eccb800-04d8-4a8b-a8ba-5033a0489abe','7eb92fd9-f11f-4884-bf93-af4a4df1112b','modules.manage','2025-12-17 22:17:09',NULL),('819f1d25-ac02-47cc-8ea2-e1a35c894a7d','7eb92fd9-f11f-4884-bf93-af4a4df1112b','risks.read','2025-12-17 22:17:09',NULL),('94846b62-16a6-4553-a32c-d7bc0cd7ede5','7eb92fd9-f11f-4884-bf93-af4a4df1112b','modules.configure','2025-12-17 22:17:09',NULL),('96674f2a-fcfd-44b7-a6cc-3b821c372e62','7eb92fd9-f11f-4884-bf93-af4a4df1112b','users.delete','2025-12-17 22:17:09',NULL),('a8095b54-56c2-46b5-9a57-35a56dfb7ecc','7eb92fd9-f11f-4884-bf93-af4a4df1112b','users.read','2025-12-17 22:17:09',NULL),('a891d3b7-0098-4213-b85f-614ac9fba4af','7eb92fd9-f11f-4884-bf93-af4a4df1112b','users.write','2025-12-17 22:17:09',NULL),('b905cafd-0b3c-4c9b-a1ba-c88171d49cb1','7eb92fd9-f11f-4884-bf93-af4a4df1112b','modules.read','2025-12-17 22:17:09',NULL),('c03fe7c7-7a45-4d97-a3c4-90a86969e2af','7eb92fd9-f11f-4884-bf93-af4a4df1112b','risks.update','2025-12-17 22:17:09',NULL),('c38c3c1d-6e8e-478e-bbc2-ffd00040678d','7eb92fd9-f11f-4884-bf93-af4a4df1112b','audit.read','2025-12-17 22:17:09',NULL),('cf6a83ce-bfc8-4b8d-bf6e-6b8e3be7ca05','7eb92fd9-f11f-4884-bf93-af4a4df1112b','audit.export','2025-12-17 22:17:09',NULL),('f7e746f8-4f85-488f-909a-ffd2b3631206','7eb92fd9-f11f-4884-bf93-af4a4df1112b','risks.escalate','2025-12-17 22:17:09',NULL),('f86979d5-d54b-48c4-90a9-d2a0cf5f2a48','7eb92fd9-f11f-4884-bf93-af4a4df1112b','risks.acknowledge','2025-12-17 22:17:09',NULL),('f9495b16-d23e-4ab8-828c-ea10d93ca379','7eb92fd9-f11f-4884-bf93-af4a4df1112b','risks.resolve','2025-12-17 22:17:09',NULL);
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','auditor','manager','viewer','module_operator') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'viewer',
  `status` enum('pending','active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `mfa_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `mfa_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email_tenant` (`email`,`tenant_id`),
  KEY `idx_users_tenant` (`tenant_id`),
  KEY `idx_users_google` (`google_id`),
  CONSTRAINT `fk_users_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('7eb92fd9-f11f-4884-bf93-af4a4df1112b','ae1b13a8-6425-4d20-8c2d-c554f62fb7b1','lballanti.lb@gmail.com','$2a$10$IX9v82QUmbIs9Lf6B5z2eO1S1UXxLFfwTZR.QPc.Z4Hrazp.VQhwi','Lorenzo Ballanti Moran','admin','active',0,NULL,NULL,NULL,'2025-12-17 22:17:09','2025-12-17 22:17:09',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-18  0:15:39
