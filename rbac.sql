/*
 Navicat Premium Data Transfer

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 80027
 Source Host           : localhost:3306
 Source Schema         : rbac

 Target Server Type    : MySQL
 Target Server Version : 80027
 File Encoding         : 65001

 Date: 06/02/2025 14:37:38
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for application_schema
-- ----------------------------
DROP TABLE IF EXISTS `application_schema`;
CREATE TABLE `application_schema`  (
  `application_id` int(0) NOT NULL,
  `schema_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`application_id`, `schema_id`) USING BTREE,
  INDEX `IDX_15335b03bc903d19cfcb077ff2`(`application_id`) USING BTREE,
  INDEX `IDX_c224eef6c63bc030c3dbb143cc`(`schema_id`) USING BTREE,
  CONSTRAINT `FK_15335b03bc903d19cfcb077ff2d` FOREIGN KEY (`application_id`) REFERENCES `ontology_application` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_c224eef6c63bc030c3dbb143cc5` FOREIGN KEY (`schema_id`) REFERENCES `ontology_schema` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for dataset
-- ----------------------------
DROP TABLE IF EXISTS `dataset`;
CREATE TABLE `dataset`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `type` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `files` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `label` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dataset
-- ----------------------------
INSERT INTO `dataset` VALUES (13, '文件', NULL, 'fcc8e4a8379aa7ff1b0f8eb73e18d0fd.jsonl', '飞行器', '飞行器');
INSERT INTO `dataset` VALUES (14, 'api', 'title,abstract,url,type,category', NULL, 'bing资讯', 'https://api.msn.com/news/feed/pages/channelfeed?timeOut=10000&apikey=0QfOX3Vn51YCzitbLaRkTTBadtWpgTN8NZLW0C1SEM&cm=zh-cn&User=a-EDD29C0861EECFA2A1521A4DFFFFFFFF&newsSkip=24&$skip=1');

-- ----------------------------
-- Table structure for design_col
-- ----------------------------
DROP TABLE IF EXISTS `design_col`;
CREATE TABLE `design_col`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sort` int(0) NOT NULL,
  `type` json NULL,
  `length` int(0) NULL DEFAULT NULL,
  `primary` tinyint(0) NULL DEFAULT NULL,
  `nullable` tinyint(0) NULL DEFAULT NULL,
  `unique` tinyint(0) NULL DEFAULT NULL,
  `default` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `tableId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_9d68aa9c91c3eafeb94eeb2c0e5`(`tableId`) USING BTREE,
  CONSTRAINT `FK_9d68aa9c91c3eafeb94eeb2c0e5` FOREIGN KEY (`tableId`) REFERENCES `design_table` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for design_control
-- ----------------------------
DROP TABLE IF EXISTS `design_control`;
CREATE TABLE `design_control`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `required` tinyint(0) NULL DEFAULT NULL,
  `disabled` tinyint(0) NULL DEFAULT NULL,
  `readonly` tinyint(0) NULL DEFAULT NULL,
  `hide` tinyint(0) NULL DEFAULT NULL,
  `primary` tinyint(0) NOT NULL,
  `sort` int(0) NOT NULL,
  `col` json NULL,
  `type` json NOT NULL,
  `group` json NULL,
  `pageId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_e47b37df862d74e39d54d17acc3`(`pageId`) USING BTREE,
  CONSTRAINT `FK_e47b37df862d74e39d54d17acc3` FOREIGN KEY (`pageId`) REFERENCES `design_page` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for design_module
-- ----------------------------
DROP TABLE IF EXISTS `design_module`;
CREATE TABLE `design_module`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for design_page
-- ----------------------------
DROP TABLE IF EXISTS `design_page`;
CREATE TABLE `design_page`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `moduleId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_ba2c0903999794b6aa84886cf10`(`moduleId`) USING BTREE,
  CONSTRAINT `FK_ba2c0903999794b6aa84886cf10` FOREIGN KEY (`moduleId`) REFERENCES `design_module` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for design_page_relation
-- ----------------------------
DROP TABLE IF EXISTS `design_page_relation`;
CREATE TABLE `design_page_relation`  (
  `fromPageId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `toPageId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`fromPageId`, `toPageId`) USING BTREE,
  INDEX `IDX_a4e7fb1fab5198f676d18d2ee9`(`fromPageId`) USING BTREE,
  INDEX `IDX_14d9d88c1d57c4f6b685ae33c5`(`toPageId`) USING BTREE,
  CONSTRAINT `FK_14d9d88c1d57c4f6b685ae33c54` FOREIGN KEY (`toPageId`) REFERENCES `design_page` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_a4e7fb1fab5198f676d18d2ee9f` FOREIGN KEY (`fromPageId`) REFERENCES `design_page` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for design_table
-- ----------------------------
DROP TABLE IF EXISTS `design_table`;
CREATE TABLE `design_table`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `transform` json NULL,
  `moduleId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_8fa8f94fa5cf732303e33f1d7d1`(`moduleId`) USING BTREE,
  CONSTRAINT `FK_8fa8f94fa5cf732303e33f1d7d1` FOREIGN KEY (`moduleId`) REFERENCES `design_module` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ontology_application
-- ----------------------------
DROP TABLE IF EXISTS `ontology_application`;
CREATE TABLE `ontology_application`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `rating` int(0) NULL DEFAULT NULL,
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `category` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ontology_property
-- ----------------------------
DROP TABLE IF EXISTS `ontology_property`;
CREATE TABLE `ontology_property`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `enDescription` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `isPrimary` tinyint(0) NULL DEFAULT NULL,
  `enName` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `type` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `group` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9517 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ontology_property
-- ----------------------------
INSERT INTO `ontology_property` VALUES (9492, NULL, NULL, '研发单位', 1, NULL, 'string', '7.其他');
INSERT INTO `ontology_property` VALUES (9493, NULL, NULL, '气动布局', 1, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9494, NULL, NULL, '武器装备', NULL, NULL, 'string', '5.装备使用');
INSERT INTO `ontology_property` VALUES (9495, '使用情况', NULL, '使用情况', 0, NULL, 'monolingualtext', '5.装备使用');
INSERT INTO `ontology_property` VALUES (9496, NULL, NULL, '发动机数量', 1, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9497, NULL, NULL, '发动机', 1, NULL, 'wikibase-item', '4.发动机动力系统');
INSERT INTO `ontology_property` VALUES (9498, NULL, NULL, '空重', 1, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9499, NULL, NULL, '最大飞行速度', 1, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9500, NULL, NULL, '最大起飞重量', 1, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9501, NULL, NULL, '飞行速度', 1, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9502, NULL, NULL, '最大航程', 1, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9503, NULL, NULL, '乘员', 1, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9504, NULL, NULL, '研发单位', NULL, NULL, 'string', '7.其他');
INSERT INTO `ontology_property` VALUES (9505, NULL, NULL, '发动机数量', NULL, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9506, NULL, NULL, '飞行速度', NULL, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9507, NULL, NULL, '空重', NULL, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9508, NULL, NULL, '发动机', NULL, NULL, 'wikibase-item', '4.发动机动力系统');
INSERT INTO `ontology_property` VALUES (9509, NULL, NULL, '最大起飞重量', NULL, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9510, NULL, NULL, '最大飞行速度', NULL, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9511, NULL, NULL, '最大航程', NULL, NULL, 'string', '2.性能参数');
INSERT INTO `ontology_property` VALUES (9512, '三视图', NULL, '三视图', 0, NULL, 'commonsMedia', '3.三视图');
INSERT INTO `ontology_property` VALUES (9513, '基本信息', NULL, '基本信息', 0, NULL, 'monolingualtext', '1.基本信息');
INSERT INTO `ontology_property` VALUES (9514, '立体剖视图', NULL, '立体剖视图', 0, NULL, 'commonsMedia', '6.立体剖视图');
INSERT INTO `ontology_property` VALUES (9515, '视频', NULL, '视频', 0, NULL, 'commonsMedia', '视频');
INSERT INTO `ontology_property` VALUES (9516, NULL, NULL, 'url', NULL, NULL, 'string', NULL);

-- ----------------------------
-- Table structure for ontology_qualify
-- ----------------------------
DROP TABLE IF EXISTS `ontology_qualify`;
CREATE TABLE `ontology_qualify`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `label` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `enName` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `enDescription` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `type` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ontology_qualify_property
-- ----------------------------
DROP TABLE IF EXISTS `ontology_qualify_property`;
CREATE TABLE `ontology_qualify_property`  (
  `propertyId` int(0) NOT NULL,
  `qualifyId` int(0) NOT NULL,
  PRIMARY KEY (`propertyId`, `qualifyId`) USING BTREE,
  INDEX `IDX_2f9d494bd1f157d7a4b18b2535`(`propertyId`) USING BTREE,
  INDEX `IDX_b4dba9576718ec687e4bbdb9fc`(`qualifyId`) USING BTREE,
  CONSTRAINT `FK_2f9d494bd1f157d7a4b18b25352` FOREIGN KEY (`propertyId`) REFERENCES `ontology_property` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_b4dba9576718ec687e4bbdb9fc7` FOREIGN KEY (`qualifyId`) REFERENCES `ontology_qualify` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ontology_schema
-- ----------------------------
DROP TABLE IF EXISTS `ontology_schema`;
CREATE TABLE `ontology_schema`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `router` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `icon` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `sort` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `parentId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `value` int(0) NULL DEFAULT 1,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `color` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `parent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `label` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `collection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_16cf37d5711e15bdc49419b6227`(`parentId`) USING BTREE,
  CONSTRAINT `FK_16cf37d5711e15bdc49419b6227` FOREIGN KEY (`parentId`) REFERENCES `ontology_schema` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ontology_schema
-- ----------------------------
INSERT INTO `ontology_schema` VALUES ('327991d8-5d75-46b9-909f-65daa8bf5eb2', NULL, NULL, NULL, NULL, 'E4.327991d8-5d75-46b9-909f-65daa8bf5eb2', 1, 'article', NULL, NULL, 'article', NULL, NULL);
INSERT INTO `ontology_schema` VALUES ('E4', NULL, NULL, NULL, NULL, 'E4', 1, '其他', NULL, NULL, '其他', NULL, NULL);
INSERT INTO `ontology_schema` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', NULL, NULL, NULL, NULL, 'dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 1, '飞行器', NULL, NULL, '飞行器', NULL, NULL);

-- ----------------------------
-- Table structure for ontology_schema_application
-- ----------------------------
DROP TABLE IF EXISTS `ontology_schema_application`;
CREATE TABLE `ontology_schema_application`  (
  `schemaId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `applicationId` int(0) NOT NULL,
  PRIMARY KEY (`schemaId`, `applicationId`) USING BTREE,
  INDEX `IDX_bc8828cc7da567fb99c52926a8`(`schemaId`) USING BTREE,
  INDEX `IDX_a9db72b6b1ab3c06b807b1b66e`(`applicationId`) USING BTREE,
  CONSTRAINT `FK_a9db72b6b1ab3c06b807b1b66e1` FOREIGN KEY (`applicationId`) REFERENCES `ontology_application` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_bc8828cc7da567fb99c52926a86` FOREIGN KEY (`schemaId`) REFERENCES `ontology_schema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ontology_schema_property
-- ----------------------------
DROP TABLE IF EXISTS `ontology_schema_property`;
CREATE TABLE `ontology_schema_property`  (
  `schemaId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `propertyId` int(0) NOT NULL,
  PRIMARY KEY (`schemaId`, `propertyId`) USING BTREE,
  INDEX `IDX_561afe7a3d5bac2c675d2aaa71`(`schemaId`) USING BTREE,
  INDEX `IDX_0f06870cfdc06bbdb73550ae18`(`propertyId`) USING BTREE,
  CONSTRAINT `FK_0f06870cfdc06bbdb73550ae180` FOREIGN KEY (`propertyId`) REFERENCES `ontology_property` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_561afe7a3d5bac2c675d2aaa716` FOREIGN KEY (`schemaId`) REFERENCES `ontology_schema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ontology_schema_property
-- ----------------------------
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9492);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9493);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9494);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9495);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9496);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9497);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9498);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9499);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9500);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9501);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9502);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9503);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9504);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9505);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9506);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9507);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9508);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9509);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9510);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9511);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9512);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9513);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9514);
INSERT INTO `ontology_schema_property` VALUES ('dd2a65f6-5aa4-44db-b9e6-41c65bc75c82', 9515);
INSERT INTO `ontology_schema_property` VALUES ('327991d8-5d75-46b9-909f-65daa8bf5eb2', 9516);

-- ----------------------------
-- Table structure for ontology_schema_tag
-- ----------------------------
DROP TABLE IF EXISTS `ontology_schema_tag`;
CREATE TABLE `ontology_schema_tag`  (
  `schemaId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tagId` int(0) NOT NULL,
  PRIMARY KEY (`schemaId`, `tagId`) USING BTREE,
  INDEX `IDX_3bfd95cc06afd1ebae902243a3`(`schemaId`) USING BTREE,
  INDEX `IDX_44865993a3286ad3a3f55809d9`(`tagId`) USING BTREE,
  CONSTRAINT `FK_3bfd95cc06afd1ebae902243a3e` FOREIGN KEY (`schemaId`) REFERENCES `ontology_schema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_44865993a3286ad3a3f55809d99` FOREIGN KEY (`tagId`) REFERENCES `ontology_tag` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ontology_tag
-- ----------------------------
DROP TABLE IF EXISTS `ontology_tag`;
CREATE TABLE `ontology_tag`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `type` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 842 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ontology_type_value
-- ----------------------------
DROP TABLE IF EXISTS `ontology_type_value`;
CREATE TABLE `ontology_type_value`  (
  `schemaId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `propertyId` int(0) NOT NULL,
  PRIMARY KEY (`schemaId`, `propertyId`) USING BTREE,
  INDEX `IDX_8cfb0bbbb55188caf1a68ede0a`(`schemaId`) USING BTREE,
  INDEX `IDX_568b9b5d75bd3865d279766916`(`propertyId`) USING BTREE,
  CONSTRAINT `FK_568b9b5d75bd3865d279766916f` FOREIGN KEY (`propertyId`) REFERENCES `ontology_property` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_8cfb0bbbb55188caf1a68ede0ae` FOREIGN KEY (`schemaId`) REFERENCES `ontology_schema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for system_action
-- ----------------------------
DROP TABLE IF EXISTS `system_action`;
CREATE TABLE `system_action`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `menuId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort` int(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_3ed34464adf967339c44f99ff80`(`menuId`) USING BTREE,
  CONSTRAINT `FK_3ed34464adf967339c44f99ff80` FOREIGN KEY (`menuId`) REFERENCES `system_menu` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_action
-- ----------------------------
INSERT INTO `system_action` VALUES ('113ed106-2cdd-a596-de50-4b80de1fb83e', '删除', 'delete', 'fto-trash-2', '32cbc14a-632e-24d0-8d8f-2032c2c7a5e0', 4);
INSERT INTO `system_action` VALUES ('19d1fde7-f3f4-4ce9-e6cc-6b77a5fe1ac4', '修改', 'edit', 'fto-edit', '32cbc14a-632e-24d0-8d8f-2032c2c7a5e0', 3);
INSERT INTO `system_action` VALUES ('2711f0e9-5f7c-54dc-cf78-f96ef2fcaf19', '新增根节点', 'add-root', 'fto-plus', '4a305e03-c1b9-1ab7-b9ac-3408dced0194', 5);
INSERT INTO `system_action` VALUES ('28ce1bf4-830a-76ab-c73c-10a7207f92ed', '修改', 'edit', 'fto-edit', '4a305e03-c1b9-1ab7-b9ac-3408dced0194', 3);
INSERT INTO `system_action` VALUES ('2afc1b90-0c7f-ae5b-589b-5da8dc78f49a', '查看', 'info', 'fto-eye', '32cbc14a-632e-24d0-8d8f-2032c2c7a5e0', 1);
INSERT INTO `system_action` VALUES ('346594b7-0db7-8790-8869-be827d50a104', '删除', 'delete', 'fto-trash-2', '10f15681-0d11-78db-bc92-76d43298a5f8', 5);
INSERT INTO `system_action` VALUES ('4ea3022d-b867-afd6-b4bc-5f91bb1e77e0', '查看', 'info', '', '47c99575-24ac-d6d5-5353-f000e29e3115', 1);
INSERT INTO `system_action` VALUES ('54ccd3ee-0f78-e4aa-8643-a92dc2849000', '查看', 'info', 'fto-eye', '90d5153c-3241-0ef6-27a8-6d00012d1838', 1);
INSERT INTO `system_action` VALUES ('5521f580-6d08-ea1a-5046-553dc822bcc5', '1', 'info', '1', 'ecb74912-91e9-5fb0-c737-de74aa65d454', 1);
INSERT INTO `system_action` VALUES ('590ac302-cdca-72c7-60c5-0444b4585899', '查看', 'info', 'fto-eye', '10f15681-0d11-78db-bc92-76d43298a5f8', 1);
INSERT INTO `system_action` VALUES ('59504c1a-2a01-9431-9fcc-7adcca5e4903', '查看', 'info', 'fto-inbox', '29db4c9b-7e43-fe4e-e249-9a10c4a853e6', 1);
INSERT INTO `system_action` VALUES ('629d4d09-73b6-2aa0-4e58-7108f4660a50', '新增', 'add', 'fto-plus', 'f97d223d-b777-3dfa-c76a-d24244eba25e', 2);
INSERT INTO `system_action` VALUES ('6dd07b1d-d431-9bf4-62d5-5db3dc99bddb', '查看', 'info', 'fto-eye', '4a305e03-c1b9-1ab7-b9ac-3408dced0194', 1);
INSERT INTO `system_action` VALUES ('75056496-6ca6-1346-7a60-be72cab7d72b', '删除', 'delete', 'fto-trash-2', 'f97d223d-b777-3dfa-c76a-d24244eba25e', 4);
INSERT INTO `system_action` VALUES ('7adad23f-636d-6bee-0f37-7d29d5b29585', '操作设置', 'actions', 'fto-list', '10f15681-0d11-78db-bc92-76d43298a5f8', 4);
INSERT INTO `system_action` VALUES ('811047d2-ac97-96a5-686d-59d5a54fcc62', '新增', 'add', 'fto-plus', '32cbc14a-632e-24d0-8d8f-2032c2c7a5e0', 2);
INSERT INTO `system_action` VALUES ('8eedb227-6be9-7571-ed0b-9e181c6e6716', '修改', 'edit', 'fto-edit', 'f97d223d-b777-3dfa-c76a-d24244eba25e', 3);
INSERT INTO `system_action` VALUES ('9067e591-16f5-b7a7-9336-a09a8b10fa5e', '查看', 'info', 'fto-eye', 'e2203f49-23da-5372-a260-ba8f71dc9e08', 1);
INSERT INTO `system_action` VALUES ('9b76a100-df1c-88ad-1ce8-7c71b5797896', '查看', 'info', 'fto-eye', '29ecd267-2707-8c74-d508-730526ddd7ee', 1);
INSERT INTO `system_action` VALUES ('ab68fba9-7a34-a35f-022c-80141bf447de', '查看', 'info', 'fto-inbox', '595449e7-a0f5-0ed4-c67b-98cf0a6f9d1a', 1);
INSERT INTO `system_action` VALUES ('ad39e8cf-2816-9176-ce7f-83fcb84c3cd1', '权限设置', 'permission', 'fto-list', 'f97d223d-b777-3dfa-c76a-d24244eba25e', 5);
INSERT INTO `system_action` VALUES ('bf9ba14b-b7db-3adb-662a-a88e417e70e8', '修改', 'edit', 'fto-edit', '10f15681-0d11-78db-bc92-76d43298a5f8', 3);
INSERT INTO `system_action` VALUES ('c3ee3f62-3a8a-b8a6-0fb7-4f25138253d2', '查看', 'info', '', '06e43b64-1fa6-64b1-8eae-4e33f2ec3b41', 1);
INSERT INTO `system_action` VALUES ('cac38734-fa4c-0775-96f2-c4146a4dcbe0', '新增', 'add', 'fto-plus', '10f15681-0d11-78db-bc92-76d43298a5f8', 2);
INSERT INTO `system_action` VALUES ('e1497f04-16fa-9bee-c77e-fd4afab4ef86', '删除', 'delete', 'fto-trash-2', '4a305e03-c1b9-1ab7-b9ac-3408dced0194', 4);
INSERT INTO `system_action` VALUES ('f50bd17d-2436-47f3-2f9a-d914ff2ad834', '查看', 'info', 'fto-eye', 'f97d223d-b777-3dfa-c76a-d24244eba25e', 1);
INSERT INTO `system_action` VALUES ('fb5680c4-47cb-78f9-c107-656f42886e3c', '新增', 'add', 'fto-plus', '4a305e03-c1b9-1ab7-b9ac-3408dced0194', 2);

-- ----------------------------
-- Table structure for system_menu
-- ----------------------------
DROP TABLE IF EXISTS `system_menu`;
CREATE TABLE `system_menu`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `router` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `sort` int(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_d7fcb6cbe5c416b793101e32a3f`(`parentId`) USING BTREE,
  CONSTRAINT `FK_d7fcb6cbe5c416b793101e32a3f` FOREIGN KEY (`parentId`) REFERENCES `system_menu` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_menu
-- ----------------------------
INSERT INTO `system_menu` VALUES ('0009d7da-3efc-2ea1-3be1-2542c7b6c070', '系统管理', '', 'ado-setting', NULL, '0009d7da-3efc-2ea1-3be1-2542c7b6c070', 11);
INSERT INTO `system_menu` VALUES ('06e43b64-1fa6-64b1-8eae-4e33f2ec3b41', '知识库', 'entity', 'fto-inbox', NULL, '06e43b64-1fa6-64b1-8eae-4e33f2ec3b41', 5);
INSERT INTO `system_menu` VALUES ('10f15681-0d11-78db-bc92-76d43298a5f8', '菜单管理', 'menus', 'fto-menu', '0009d7da-3efc-2ea1-3be1-2542c7b6c070', '0009d7da-3efc-2ea1-3be1-2542c7b6c070.10f15681-0d11-78db-bc92-76d43298a5f8', 4);
INSERT INTO `system_menu` VALUES ('29db4c9b-7e43-fe4e-e249-9a10c4a853e6', '应用', 'applications', 'fto-inbox', NULL, '29db4c9b-7e43-fe4e-e249-9a10c4a853e6', 9);
INSERT INTO `system_menu` VALUES ('29ecd267-2707-8c74-d508-730526ddd7ee', '抽取', 'extraction', 'fto-filter', NULL, '29ecd267-2707-8c74-d508-730526ddd7ee', 4);
INSERT INTO `system_menu` VALUES ('32cbc14a-632e-24d0-8d8f-2032c2c7a5e0', '用户管理', 'users', 'ado-team', '0009d7da-3efc-2ea1-3be1-2542c7b6c070', '0009d7da-3efc-2ea1-3be1-2542c7b6c070.32cbc14a-632e-24d0-8d8f-2032c2c7a5e0', 1);
INSERT INTO `system_menu` VALUES ('47c99575-24ac-d6d5-5353-f000e29e3115', '本体建模', 'ontology', 'fto-triangle', NULL, '47c99575-24ac-d6d5-5353-f000e29e3115', 2);
INSERT INTO `system_menu` VALUES ('4a305e03-c1b9-1ab7-b9ac-3408dced0194', '组织管理', 'organization', 'ado-apartment', '0009d7da-3efc-2ea1-3be1-2542c7b6c070', '0009d7da-3efc-2ea1-3be1-2542c7b6c070.4a305e03-c1b9-1ab7-b9ac-3408dced0194', 3);
INSERT INTO `system_menu` VALUES ('595449e7-a0f5-0ed4-c67b-98cf0a6f9d1a', '构建', 'algorithm', 'fto-inbox', NULL, '595449e7-a0f5-0ed4-c67b-98cf0a6f9d1a', 10);
INSERT INTO `system_menu` VALUES ('90d5153c-3241-0ef6-27a8-6d00012d1838', '首页', 'dashboard', 'ado-home', NULL, '90d5153c-3241-0ef6-27a8-6d00012d1838', 1);
INSERT INTO `system_menu` VALUES ('e2203f49-23da-5372-a260-ba8f71dc9e08', '图编辑', 'graph', 'fto-compass', NULL, 'e2203f49-23da-5372-a260-ba8f71dc9e08', 6);
INSERT INTO `system_menu` VALUES ('ecb74912-91e9-5fb0-c737-de74aa65d454', '数据集', 'dataset', 'fto-compass', NULL, 'ecb74912-91e9-5fb0-c737-de74aa65d454', 3);
INSERT INTO `system_menu` VALUES ('f97d223d-b777-3dfa-c76a-d24244eba25e', '角色管理', 'roles', 'ado-user', '0009d7da-3efc-2ea1-3be1-2542c7b6c070', '0009d7da-3efc-2ea1-3be1-2542c7b6c070.f97d223d-b777-3dfa-c76a-d24244eba25e', 2);

-- ----------------------------
-- Table structure for system_organization
-- ----------------------------
DROP TABLE IF EXISTS `system_organization`;
CREATE TABLE `system_organization`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `sort` int(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_86110f24fd2d3afdba313c5060d`(`parentId`) USING BTREE,
  CONSTRAINT `FK_86110f24fd2d3afdba313c5060d` FOREIGN KEY (`parentId`) REFERENCES `system_organization` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_organization
-- ----------------------------
INSERT INTO `system_organization` VALUES ('3c06d515-c615-1513-cd94-bae100f24852', '数据采集部门', 'department', 'icon', '4980001f-45af-4a92-a68a-e1e5b128a637', '3c06d515-c615-1513-cd94-bae100f24852', 2);
INSERT INTO `system_organization` VALUES ('4980001f-45af-4a92-a68a-e1e5b128a637', '知识图谱公司', 'root', 'icon', NULL, '4980001f-45af-4a92-a68a-e1e5b128a637', 1);

-- ----------------------------
-- Table structure for system_role
-- ----------------------------
DROP TABLE IF EXISTS `system_role`;
CREATE TABLE `system_role`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `organizationId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_af72a2809e8b6fdf8da0955bf03`(`organizationId`) USING BTREE,
  CONSTRAINT `FK_af72a2809e8b6fdf8da0955bf03` FOREIGN KEY (`organizationId`) REFERENCES `system_organization` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_role
-- ----------------------------
INSERT INTO `system_role` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '系统管理员', '4980001f-45af-4a92-a68a-e1e5b128a637');
INSERT INTO `system_role` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', '访客', '4980001f-45af-4a92-a68a-e1e5b128a637');

-- ----------------------------
-- Table structure for system_role_action
-- ----------------------------
DROP TABLE IF EXISTS `system_role_action`;
CREATE TABLE `system_role_action`  (
  `roleId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `actionId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`roleId`, `actionId`) USING BTREE,
  INDEX `FK_a0ec504b9c427ffcc85e212594c`(`actionId`) USING BTREE,
  INDEX `IDX_25439811e232662e2dc087330d`(`roleId`) USING BTREE,
  INDEX `IDX_a0ec504b9c427ffcc85e212594`(`actionId`) USING BTREE,
  CONSTRAINT `FK_25439811e232662e2dc087330d9` FOREIGN KEY (`roleId`) REFERENCES `system_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_a0ec504b9c427ffcc85e212594c` FOREIGN KEY (`actionId`) REFERENCES `system_action` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_role_action
-- ----------------------------
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '113ed106-2cdd-a596-de50-4b80de1fb83e');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '19d1fde7-f3f4-4ce9-e6cc-6b77a5fe1ac4');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '2711f0e9-5f7c-54dc-cf78-f96ef2fcaf19');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '28ce1bf4-830a-76ab-c73c-10a7207f92ed');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '2afc1b90-0c7f-ae5b-589b-5da8dc78f49a');
INSERT INTO `system_role_action` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', '2afc1b90-0c7f-ae5b-589b-5da8dc78f49a');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '346594b7-0db7-8790-8869-be827d50a104');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '4ea3022d-b867-afd6-b4bc-5f91bb1e77e0');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '54ccd3ee-0f78-e4aa-8643-a92dc2849000');
INSERT INTO `system_role_action` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', '54ccd3ee-0f78-e4aa-8643-a92dc2849000');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '5521f580-6d08-ea1a-5046-553dc822bcc5');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '590ac302-cdca-72c7-60c5-0444b4585899');
INSERT INTO `system_role_action` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', '590ac302-cdca-72c7-60c5-0444b4585899');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '59504c1a-2a01-9431-9fcc-7adcca5e4903');
INSERT INTO `system_role_action` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', '59504c1a-2a01-9431-9fcc-7adcca5e4903');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '629d4d09-73b6-2aa0-4e58-7108f4660a50');
INSERT INTO `system_role_action` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', '629d4d09-73b6-2aa0-4e58-7108f4660a50');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '6dd07b1d-d431-9bf4-62d5-5db3dc99bddb');
INSERT INTO `system_role_action` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', '6dd07b1d-d431-9bf4-62d5-5db3dc99bddb');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '75056496-6ca6-1346-7a60-be72cab7d72b');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '7adad23f-636d-6bee-0f37-7d29d5b29585');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '811047d2-ac97-96a5-686d-59d5a54fcc62');
INSERT INTO `system_role_action` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', '811047d2-ac97-96a5-686d-59d5a54fcc62');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '8eedb227-6be9-7571-ed0b-9e181c6e6716');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '9067e591-16f5-b7a7-9336-a09a8b10fa5e');
INSERT INTO `system_role_action` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', '9067e591-16f5-b7a7-9336-a09a8b10fa5e');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', '9b76a100-df1c-88ad-1ce8-7c71b5797896');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', 'ab68fba9-7a34-a35f-022c-80141bf447de');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', 'ad39e8cf-2816-9176-ce7f-83fcb84c3cd1');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', 'bf9ba14b-b7db-3adb-662a-a88e417e70e8');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', 'c3ee3f62-3a8a-b8a6-0fb7-4f25138253d2');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', 'cac38734-fa4c-0775-96f2-c4146a4dcbe0');
INSERT INTO `system_role_action` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', 'cac38734-fa4c-0775-96f2-c4146a4dcbe0');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', 'e1497f04-16fa-9bee-c77e-fd4afab4ef86');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', 'f50bd17d-2436-47f3-2f9a-d914ff2ad834');
INSERT INTO `system_role_action` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', 'f50bd17d-2436-47f3-2f9a-d914ff2ad834');
INSERT INTO `system_role_action` VALUES ('365612aa-3646-c1ab-f026-07e25a874c01', 'fb5680c4-47cb-78f9-c107-656f42886e3c');
INSERT INTO `system_role_action` VALUES ('e88d7417-2981-c495-2d40-65a57b03748c', 'fb5680c4-47cb-78f9-c107-656f42886e3c');

-- ----------------------------
-- Table structure for system_user
-- ----------------------------
DROP TABLE IF EXISTS `system_user`;
CREATE TABLE `system_user`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `account` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_user
-- ----------------------------
INSERT INTO `system_user` VALUES ('48c55613-5042-0fe9-9c9a-1743822125ee', 'admin', 'admin123', 'admin@xxhc.com', '15888888888', '管理员');

-- ----------------------------
-- Table structure for system_user_organization
-- ----------------------------
DROP TABLE IF EXISTS `system_user_organization`;
CREATE TABLE `system_user_organization`  (
  `userId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `organizationId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`userId`, `organizationId`) USING BTREE,
  INDEX `FK_68941b8e6cc24f7f5cc3898edb4`(`organizationId`) USING BTREE,
  INDEX `IDX_9a2b15d16e0199fd81dec2407b`(`userId`) USING BTREE,
  INDEX `IDX_68941b8e6cc24f7f5cc3898edb`(`organizationId`) USING BTREE,
  CONSTRAINT `FK_68941b8e6cc24f7f5cc3898edb4` FOREIGN KEY (`organizationId`) REFERENCES `system_organization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_9a2b15d16e0199fd81dec2407b2` FOREIGN KEY (`userId`) REFERENCES `system_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_user_organization
-- ----------------------------
INSERT INTO `system_user_organization` VALUES ('48c55613-5042-0fe9-9c9a-1743822125ee', '4980001f-45af-4a92-a68a-e1e5b128a637');

-- ----------------------------
-- Table structure for system_user_role
-- ----------------------------
DROP TABLE IF EXISTS `system_user_role`;
CREATE TABLE `system_user_role`  (
  `userId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`userId`, `roleId`) USING BTREE,
  INDEX `FK_4c2ae6cf44ed3a1e1040122db4b`(`roleId`) USING BTREE,
  INDEX `IDX_4c2ae6cf44ed3a1e1040122db4`(`roleId`) USING BTREE,
  INDEX `IDX_8b51fc7bf87d9a9aada9c50454`(`userId`) USING BTREE,
  CONSTRAINT `FK_4c2ae6cf44ed3a1e1040122db4b` FOREIGN KEY (`roleId`) REFERENCES `system_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_8b51fc7bf87d9a9aada9c504544` FOREIGN KEY (`userId`) REFERENCES `system_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_user_role
-- ----------------------------
INSERT INTO `system_user_role` VALUES ('48c55613-5042-0fe9-9c9a-1743822125ee', '365612aa-3646-c1ab-f026-07e25a874c01');

SET FOREIGN_KEY_CHECKS = 1;
