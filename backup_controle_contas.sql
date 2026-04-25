-- MySQL dump 10.13  Distrib 8.4.8, for Linux (x86_64)
--
-- Host: localhost    Database: controle_contas
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_migrations`
--

DROP TABLE IF EXISTS `_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `applied_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_migrations`
--

LOCK TABLES `_migrations` WRITE;
/*!40000 ALTER TABLE `_migrations` DISABLE KEYS */;
INSERT INTO `_migrations` VALUES (1,'0001_user.sql','2026-04-12 19:29:20'),(2,'0002_create_lookup_tables.sql','2026-04-12 19:31:53'),(3,'0003_create_contas.sql','2026-04-12 19:31:53'),(4,'0004_pagamentos.sql','2026-04-12 23:05:55'),(5,'0005_valor_original_investimento.sql','2026-04-12 23:05:55'),(6,'0006_data_contratacao.sql','2026-04-12 23:24:42'),(7,'0007_modalidade_emprestimo.sql','2026-04-12 23:32:39'),(8,'0008_modalidade_plano.sql','2026-04-12 23:59:41'),(9,'0009_pagamentos_unique.sql','2026-04-13 11:52:58'),(10,'0010_modalidade_pagamento.sql','2026-04-13 12:29:24');
/*!40000 ALTER TABLE `_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contas`
--

DROP TABLE IF EXISTS `contas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `tipo_conta_id` tinyint unsigned NOT NULL,
  `fonte_id` tinyint unsigned NOT NULL,
  `frequencia_id` tinyint unsigned NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `data_contratacao` date DEFAULT NULL,
  `modalidade` enum('compra','divida','refinanciamento','investimento','emprestimo','plano','pagamento') NOT NULL,
  `num_parcelas` smallint unsigned NOT NULL DEFAULT '1',
  `valor_total` decimal(10,2) NOT NULL,
  `valor_unitario` decimal(10,2) NOT NULL,
  `inicio_pagamento` date NOT NULL,
  `fim_pagamento` date DEFAULT NULL,
  `valor_original` decimal(12,2) DEFAULT NULL,
  `observacao` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_contas_frequencia` (`frequencia_id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_tipo` (`tipo_conta_id`),
  KEY `idx_fonte` (`fonte_id`),
  CONSTRAINT `fk_contas_fonte` FOREIGN KEY (`fonte_id`) REFERENCES `fonte` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_contas_frequencia` FOREIGN KEY (`frequencia_id`) REFERENCES `frequencia` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_contas_tipo` FOREIGN KEY (`tipo_conta_id`) REFERENCES `tipo_conta` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_contas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contas`
--

LOCK TABLES `contas` WRITE;
/*!40000 ALTER TABLE `contas` DISABLE KEYS */;
INSERT INTO `contas` VALUES (1,1,1,1,2,'Recarga Pay','2026-03-13','emprestimo',3,1454.64,484.88,'2026-04-13','2026-06-13',1000.00,'Para inteirar no pagamento do cartão no mês de março','2026-04-12 23:35:51','2026-04-12 23:35:51'),(2,1,2,2,3,'Empréstimo Nubank','2025-10-15','emprestimo',11,1642.19,149.29,'2025-11-14','2026-09-14',1000.00,NULL,'2026-04-12 23:40:37','2026-04-12 23:40:37'),(3,1,1,2,3,'Empréstimo Nubank','2026-02-17','emprestimo',24,6362.40,265.10,'2026-03-19','2028-02-19',3000.00,NULL,'2026-04-12 23:46:31','2026-04-12 23:46:31'),(4,1,3,3,1,'Microsoft','2026-04-12','compra',12,612.00,612.00,'2026-03-10','2027-02-10',NULL,'Conta do Office 365 pessoal','2026-04-12 23:57:56','2026-04-13 02:53:37'),(5,1,4,3,3,'Pix - Germias','2026-04-11','compra',1,2.44,2.44,'2026-05-11','2026-05-11',NULL,'Pix feito para o meu pai','2026-04-13 00:03:01','2026-04-13 00:20:57'),(6,1,5,3,3,'Pix - Adilson','2026-04-11','compra',1,13.96,13.96,'2026-05-11','2026-05-11',NULL,'Doce','2026-04-13 00:04:34','2026-04-13 00:04:34'),(7,1,6,4,3,'Cinema','2026-03-24','compra',1,30.97,30.97,'2026-04-13','2026-04-13',29.50,'Compra de ingresso para o filme devoradores de estrelas ','2026-04-13 00:13:33','2026-04-13 00:13:33'),(8,1,5,4,3,'Mc Donalds','2026-03-24','compra',2,52.58,26.29,'2026-04-13','2026-05-13',46.40,NULL,'2026-04-13 00:18:20','2026-04-13 00:19:09'),(9,1,7,4,3,'99','2026-03-24','compra',1,19.70,19.70,'2026-04-13','2026-04-13',NULL,NULL,'2026-04-13 00:22:37','2026-04-13 00:22:37'),(10,1,7,4,1,'Rio Card','2026-04-26','compra',0,100.00,100.00,'2026-04-13',NULL,NULL,NULL,'2026-04-13 00:24:43','2026-04-13 00:24:43'),(11,1,8,4,3,'Ifood','2026-04-01','compra',1,30.10,30.10,'2026-04-13','2026-04-13',NULL,NULL,'2026-04-13 00:27:13','2026-04-13 00:27:13'),(13,1,10,4,3,'Duolingo - apple','2026-03-18','plano',1,269.90,269.90,'2026-04-13','2026-04-13',NULL,'Pagamento anual do plano Duolingo ','2026-04-13 00:35:07','2026-04-13 00:35:07'),(14,1,11,4,3,'Shoppe','2026-03-15','compra',6,166.44,27.74,'2026-04-13','2026-09-13',NULL,'Caixas organizadoras ','2026-04-13 00:38:03','2026-04-13 00:38:03'),(15,1,11,4,3,'Shoppe','2026-03-15','compra',5,54.53,10.91,'2026-04-13','2026-08-13',NULL,NULL,'2026-04-13 00:40:21','2026-04-13 00:40:21'),(16,1,12,4,3,'RecargaPay','2026-03-13','plano',1,200.00,200.00,'2026-04-13','2026-04-13',NULL,'Ajuda com a conta de luz ','2026-04-13 00:42:41','2026-04-13 00:42:41'),(17,1,8,4,3,'LTY','2026-03-10','compra',1,363.68,363.68,'2026-04-13','2026-04-13',NULL,'Compra de carne do mês','2026-04-13 00:43:45','2026-04-13 00:43:45'),(18,1,7,4,1,'Rio Card','2026-03-04','compra',0,80.00,80.00,'2026-04-13',NULL,NULL,NULL,'2026-04-13 00:44:51','2026-04-13 00:44:51'),(19,1,5,4,3,'Ifood','2026-03-14','compra',1,50.94,50.94,'2026-04-13','2026-04-13',NULL,'Açaí ','2026-04-13 00:46:08','2026-04-13 00:46:08'),(21,1,9,4,1,'Cílios e sobrancelhas - Fernanda ','2026-03-17','compra',0,131.24,131.24,'2026-04-13','2026-04-30',125.00,NULL,'2026-04-13 01:21:43','2026-04-13 01:22:08'),(22,1,13,4,1,'Ifood','2026-03-10','compra',2,66.13,66.13,'2026-04-13','2026-05-13',NULL,'Ração dos cachorros','2026-04-13 01:23:48','2026-04-13 01:23:48'),(23,1,11,4,3,'Shoppe','2026-03-09','compra',3,187.14,62.38,'2026-04-13','2026-06-13',NULL,'Fronhas de cama','2026-04-13 01:26:13','2026-04-13 01:26:13'),(24,1,14,4,3,'RD saúde ','2026-04-06','compra',1,70.62,70.62,'2026-04-13','2026-04-13',NULL,'Remédio ','2026-04-13 01:28:21','2026-04-13 01:28:21'),(25,1,14,4,3,'IFood ','2026-03-17','compra',1,32.09,32.09,'2026-04-13','2026-04-13',NULL,'Remédio ','2026-04-13 01:30:18','2026-04-13 01:30:18'),(26,1,8,4,3,'Recarga Pay','2026-03-14','compra',3,291.03,97.01,'2026-03-11','2026-05-11',246.57,'Compra de mercado carnaval','2026-04-13 01:35:26','2026-04-13 01:35:26'),(27,1,1,4,3,'Jim','2026-02-11','refinanciamento',9,1785.96,198.44,'2026-03-11','2026-11-11',NULL,NULL,'2026-04-13 01:38:05','2026-04-13 01:38:05'),(28,1,1,4,3,'Recarga pay','2026-03-13','compra',1,22.72,22.72,'2026-04-13','2026-04-13',NULL,NULL,'2026-04-13 01:40:13','2026-04-13 01:40:13'),(29,1,5,4,3,'Recarga Pay','2026-02-09','compra',2,14.00,7.00,'2026-03-11','2026-04-11',NULL,NULL,'2026-04-13 01:43:41','2026-04-13 01:43:41'),(30,1,1,4,3,'Jim ','2026-02-09','refinanciamento',11,2093.96,190.36,'2026-04-13','2027-02-13',NULL,NULL,'2026-04-13 01:46:15','2026-04-13 01:46:15'),(31,1,1,4,3,'Recarga pay','2026-02-08','divida',2,141.64,70.82,'2026-04-13','2026-05-13',NULL,NULL,'2026-04-13 01:49:01','2026-04-13 01:49:01'),(32,1,15,4,3,'Recarga Pay','2026-01-19','compra',3,342.30,114.10,'2026-02-11','2026-04-13',NULL,NULL,'2026-04-13 01:51:35','2026-04-13 01:51:35'),(33,1,2,4,3,'Recarga Pay','2026-04-14','compra',3,440.01,146.67,'2026-02-11','2026-04-11',379.79,'Almoço do casamento ','2026-04-13 01:53:01','2026-04-13 01:54:25'),(34,1,9,4,1,'Cílios e sobrancelhas - Fernanda ','2026-01-13','compra',3,159.33,159.33,'2026-02-11','2026-04-11',NULL,NULL,'2026-04-13 01:56:26','2026-04-13 01:56:26'),(35,1,15,4,3,'Recarga Pay','2026-01-13','compra',3,255.90,85.30,'2026-02-11','2026-04-11',216.80,'Bermudas ','2026-04-13 01:59:29','2026-04-13 01:59:29'),(36,1,1,4,3,'Jim','2025-12-12','divida',6,1788.00,298.00,'2026-04-13','2026-09-13',NULL,NULL,'2026-04-13 02:06:51','2026-04-13 02:06:51'),(37,1,16,4,3,'Recarga Pay','2026-04-09','compra',3,330.36,110.12,'2026-02-11','2026-04-11',279.00,'Camisa de pai','2026-04-13 02:11:01','2026-04-13 02:11:01'),(38,1,14,4,3,'Raia ','2026-01-09','compra',1,57.76,57.76,'2026-04-13','2026-04-13',NULL,NULL,'2026-04-13 02:12:02','2026-04-13 02:12:02'),(39,1,2,4,3,'Recarga pay ','2026-01-07','compra',3,110.61,36.87,'2026-02-11','2026-04-11',NULL,'Flores casamento ','2026-04-13 02:14:52','2026-04-13 02:14:52'),(40,1,2,4,3,'Recarga Pay','2026-04-06','compra',3,236.22,78.74,'2026-02-11','2026-04-11',NULL,NULL,'2026-04-13 02:16:14','2026-04-13 02:16:14'),(41,1,2,4,3,'Mercado livre','2026-01-05','compra',4,33.48,8.37,'2026-02-11','2026-05-11',NULL,'Farinha sem glúten ','2026-04-13 02:17:46','2026-04-13 02:17:46'),(42,1,2,4,3,'Ezf distribuidora ','2026-01-05','compra',4,205.48,51.37,'2026-02-11','2026-05-11',NULL,'Bolo','2026-04-13 02:20:00','2026-04-13 02:20:00'),(43,1,2,4,3,'Shoppe ','2026-01-04','compra',5,358.95,71.79,'2026-02-11','2026-06-11',NULL,'Doces','2026-04-13 02:21:50','2026-04-13 02:21:50'),(44,1,2,4,3,'Shoppe ','2026-01-01','compra',4,58.64,14.66,'2026-02-11','2026-05-11',NULL,'Bolo','2026-04-13 02:23:33','2026-04-13 02:23:33'),(45,1,17,4,3,'Recarga pay','2025-12-16','divida',12,747.96,62.33,'2026-01-12','2026-12-12',570.00,'Corrente de ouro','2026-04-13 02:26:21','2026-04-13 02:26:21'),(46,1,17,4,3,'Vivara','2025-12-21','compra',5,405.00,81.00,'2026-01-12','2026-05-12',NULL,'Estrela de Davi','2026-04-13 02:28:03','2026-04-13 02:28:03'),(47,1,2,4,3,'André violino ','2025-12-27','compra',5,480.00,96.00,'2026-01-12','2026-05-12',NULL,'Músico ','2026-04-13 02:29:08','2026-04-13 02:29:08'),(48,1,1,4,3,'Jim','2025-11-11','refinanciamento',7,1968.19,281.17,'2026-04-13','2026-10-13',NULL,NULL,'2026-04-13 02:31:16','2026-04-13 02:31:16'),(49,1,18,4,3,'Shoppe ','2025-11-14','compra',5,362.85,72.57,'2025-12-11','2026-04-11',NULL,'Cartucho de impressora ','2026-04-13 02:33:48','2026-04-13 02:33:48'),(50,1,14,4,3,'Shoppe ','2025-11-15','compra',6,365.58,60.93,'2025-12-11','2026-05-11',NULL,'Remédio de emagrecer ','2026-04-13 02:35:08','2026-04-13 02:35:08'),(51,1,1,4,3,'Recarga Pay','2025-11-13','refinanciamento',5,436.10,87.22,'2026-04-13','2026-08-13',NULL,NULL,'2026-04-13 02:36:16','2026-04-13 02:36:16'),(52,1,1,4,3,'Jim','2025-11-12','refinanciamento',5,1239.85,247.97,'2026-04-13','2026-08-13',NULL,NULL,'2026-04-13 02:37:01','2026-04-13 02:37:01'),(53,1,16,4,3,'Shoppe','2025-11-06','compra',9,293.31,32.59,'2025-12-11','2026-08-11',NULL,'Presente de Laura e Livia ','2026-04-13 02:38:33','2026-04-13 02:38:33'),(54,1,1,4,3,'Recarga pay','2025-10-19','compra',1,16.56,16.56,'2026-04-13','2026-04-13',NULL,NULL,'2026-04-13 02:39:45','2026-04-13 02:39:45'),(55,1,1,4,3,'59.97','2025-10-14','refinanciamento',5,885.70,177.14,'2026-04-13','2026-08-13',NULL,NULL,'2026-04-13 02:40:56','2026-04-13 02:40:56'),(56,1,1,4,3,'54.398 j','2025-09-09','refinanciamento',1,125.61,125.61,'2026-04-13','2026-04-13',NULL,NULL,'2026-04-13 02:41:54','2026-04-13 02:41:54'),(57,1,19,4,3,'Genera','2025-10-12','compra',5,133.00,26.60,'2026-04-13','2026-08-13',NULL,'Exame de ancestralidade ','2026-04-13 02:43:16','2026-04-13 02:43:16'),(58,1,9,4,3,'Britânia ','2025-09-12','compra',2,40.10,20.05,'2026-04-13','2026-05-13',NULL,'Escova de mãe ','2026-04-13 02:44:25','2026-04-13 02:44:25'),(59,1,1,4,3,'54.398 J ','2025-06-11','refinanciamento',1,92.90,92.90,'2026-04-13','2026-04-13',NULL,NULL,'2026-04-13 02:45:21','2026-04-13 02:45:21'),(60,1,10,5,1,'Uninter','2026-03-11','plano',24,199.00,199.00,'2026-04-08','2028-03-08',NULL,'Faculdade','2026-04-13 02:47:52','2026-04-13 02:47:52'),(61,1,5,3,3,'Pix - Adilson','2026-04-11','compra',1,4.65,4.65,'2026-05-11','2026-05-11',NULL,NULL,'2026-04-13 02:51:09','2026-04-13 02:51:09'),(62,1,20,3,3,'Limite convertido em Saldo','2026-04-11','compra',1,67.88,67.88,'2026-05-11','2026-05-11',NULL,NULL,'2026-04-13 02:52:49','2026-04-13 02:53:21'),(63,1,8,7,3,'Nubank pai','2026-03-20','divida',3,133.32,44.44,'2026-05-08','2026-07-08',112.94,NULL,'2026-04-13 10:50:06','2026-04-13 11:27:58'),(64,1,20,3,3,'Limite convertido em Saldo','2026-04-11','compra',1,61.70,61.70,'2026-05-11','2026-05-11',NULL,NULL,'2026-04-13 10:55:04','2026-04-13 10:55:04'),(65,1,5,3,3,'Pix - Adilson','2026-04-11','compra',1,19.40,19.40,'2026-05-11','2026-05-11',16.00,NULL,'2026-04-13 10:56:18','2026-04-13 10:56:18'),(66,1,8,3,3,'Bom frios','2026-04-10','compra',1,139.90,139.90,'2026-05-11','2026-05-11',NULL,NULL,'2026-04-13 10:57:26','2026-04-13 10:57:26'),(67,1,21,3,1,'Nubank +','2026-04-10','plano',0,29.00,29.00,'2026-02-10',NULL,NULL,NULL,'2026-04-13 10:58:32','2026-04-13 10:58:32'),(68,1,7,3,3,'Nu Tag','2026-04-10','compra',1,7.12,7.12,'2026-05-11','2026-05-11',NULL,NULL,'2026-04-13 10:59:22','2026-04-13 10:59:22'),(69,1,6,3,3,'Cinemark ','2026-04-05','compra',1,36.00,36.00,'2026-05-11','2026-05-11',NULL,NULL,'2026-04-13 11:00:55','2026-04-13 11:00:55'),(70,1,6,3,3,'Ingresso.com','2026-04-05','compra',1,45.60,45.60,'2026-05-11','2026-05-11',NULL,'Ingresso cinema ','2026-04-13 11:02:06','2026-04-13 11:02:06'),(71,1,5,3,3,'Ifood','2026-04-03','compra',1,12.03,12.03,'2026-05-11','2026-05-11',NULL,NULL,'2026-04-13 11:03:01','2026-04-13 11:03:01'),(72,1,20,3,3,'Limite convertido ','2026-04-03','compra',1,117.79,117.79,'2026-05-11','2026-05-11',NULL,NULL,'2026-04-13 11:04:14','2026-04-13 11:04:14'),(73,1,5,3,3,'IFood','2026-04-03','compra',1,7.58,7.58,'2026-05-11','2026-05-11',NULL,NULL,'2026-04-13 11:05:05','2026-04-13 11:05:05'),(74,1,5,3,3,'IFood','2026-04-03','compra',1,12.65,12.65,'2026-05-11','2026-05-11',NULL,NULL,'2026-04-13 11:05:46','2026-04-13 11:05:46'),(75,1,8,7,3,'Bom Frios','2026-04-13','compra',1,117.57,117.57,'2026-05-08','2026-05-08',NULL,NULL,'2026-04-13 20:49:00','2026-04-13 20:49:00'),(76,1,7,3,3,'Nu Tag','2026-04-13','compra',1,6.60,6.60,'2026-05-13','2026-05-13',NULL,NULL,'2026-04-13 20:54:45','2026-04-13 20:54:45'),(77,1,22,3,3,'Pagamento recebido','2026-04-12','pagamento',1,0.17,0.17,'2026-05-10','2026-05-10',NULL,NULL,'2026-04-13 20:55:57','2026-04-13 20:56:52'),(78,1,22,3,3,'Pagamento recebido','2026-04-12','pagamento',1,1.39,1.39,'2026-05-10','2026-05-10',NULL,NULL,'2026-04-13 20:57:34','2026-04-13 20:57:34'),(79,1,22,3,3,'Pagamento recebido','2026-04-12','pagamento',1,71.69,71.69,'2026-05-10','2026-05-10',NULL,NULL,'2026-04-13 20:58:02','2026-04-13 20:58:02'),(80,1,22,3,3,'Pagamento recebido','2026-04-08','pagamento',1,423.83,423.83,'2026-05-10','2026-05-10',NULL,NULL,'2026-04-13 20:58:38','2026-04-13 20:58:38'),(81,1,22,3,3,'Pagamento recebido','2026-04-04','pagamento',1,87.05,87.05,'2026-05-10','2026-05-10',NULL,NULL,'2026-04-13 20:59:17','2026-04-13 20:59:17'),(82,1,8,7,3,'hortifrut','2026-04-14','compra',1,9.17,9.17,'2026-05-08','2026-05-08',NULL,NULL,'2026-04-14 14:54:34','2026-04-14 14:54:52');
/*!40000 ALTER TABLE `contas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fonte`
--

DROP TABLE IF EXISTS `fonte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fonte` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fonte`
--

LOCK TABLES `fonte` WRITE;
/*!40000 ALTER TABLE `fonte` DISABLE KEYS */;
INSERT INTO `fonte` VALUES (1,'Aplicativo'),(3,'Cartão Nubank'),(7,'Cartão Renner'),(5,'Faculdade'),(4,'Mastercard Pai'),(2,'Nubank'),(6,'Nubank pai');
/*!40000 ALTER TABLE `fonte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `frequencia`
--

DROP TABLE IF EXISTS `frequencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `frequencia` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frequencia`
--

LOCK TABLES `frequencia` WRITE;
/*!40000 ALTER TABLE `frequencia` DISABLE KEYS */;
INSERT INTO `frequencia` VALUES (1,'Fixo'),(3,'Pontual'),(2,'Temporário');
/*!40000 ALTER TABLE `frequencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagamentos`
--

DROP TABLE IF EXISTS `pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `conta_id` int unsigned NOT NULL,
  `ano` smallint NOT NULL,
  `mes` tinyint NOT NULL,
  `valor_pago` decimal(12,2) NOT NULL,
  `num_parcelas_pagas` int NOT NULL DEFAULT '1',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pagamento` (`conta_id`,`ano`,`mes`),
  UNIQUE KEY `uq_pagamento_mes` (`conta_id`,`ano`,`mes`),
  CONSTRAINT `pagamentos_ibfk_1` FOREIGN KEY (`conta_id`) REFERENCES `contas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagamentos`
--

LOCK TABLES `pagamentos` WRITE;
/*!40000 ALTER TABLE `pagamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_conta`
--

DROP TABLE IF EXISTS `tipo_conta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_conta` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_conta`
--

LOCK TABLES `tipo_conta` WRITE;
/*!40000 ALTER TABLE `tipo_conta` DISABLE KEYS */;
INSERT INTO `tipo_conta` VALUES (22,'-'),(8,'Alimentação'),(20,'Aumento de limite'),(9,'Beleza'),(13,'Cachorro'),(12,'Conta de luz'),(2,'Divida do Casamento'),(10,'Educação'),(14,'Farmácia'),(18,'Insumos'),(11,'Itens para casa'),(17,'Joia'),(5,'Lanche'),(6,'Laser'),(3,'Licença de Aplicativo'),(7,'Mobilidade'),(1,'Pagamento de Divida'),(16,'Presente'),(15,'Roupa'),(19,'Saúde'),(21,'Telefonia'),(4,'Transferência de Pix');
/*!40000 ALTER TABLE `tipo_conta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `email_verificado` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Evelyn Santos','barsan.evelyn@gmail.com','$2b$12$6CuMgzM63mMAuF7xJKfccuVav3.eP2tPfXSj510nhFIJQh/hYXa6i',0,'2026-04-12 20:14:02','2026-04-12 20:28:35');
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

-- Dump completed on 2026-04-25  0:16:40
