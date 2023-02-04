DROP DATABASE IF EXISTS `banking_system_project`; 
CREATE DATABASE IF NOT EXISTS `banking_system_project`; 

USE `banking_system_project`;

/***************************************************************
* Create user_type
***************************************************************/
CREATE TABLE IF NOT EXISTS `user_type` (
  `user_type_id` TINYINT NOT NULL AUTO_INCREMENT,
  `user_type` VARCHAR(25) NOT NULL,
  PRIMARY KEY (`user_type_id`)
) COMMENT='customer, employee, admin';

/***************************************************************
* Create user
***************************************************************/
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_first_name` varchar(50) NOT NULL,
  `user_last_name` varchar(50) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `user_role_id` TINYINT NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `user_type_id` (`user_role_id`),
  CONSTRAINT `user_type_id` FOREIGN KEY (`user_role_id`) REFERENCES `user_type` (`user_type_id`)
	ON UPDATE CASCADE
) COMMENT='This is for all the customers, employees, and admins.';

/***************************************************************
* Create account_number
***************************************************************/
CREATE TABLE IF NOT EXISTS `account_number` (
  `account_number` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  PRIMARY KEY (`account_number`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
	ON DELETE CASCADE
    ON UPDATE CASCADE
) AUTO_INCREMENT=111111 COMMENT='For storing the users account number';

/***************************************************************
* Create account_type
***************************************************************/
CREATE TABLE IF NOT EXISTS `account_type` (
  `account_type_id` tinyint NOT NULL AUTO_INCREMENT,
  `account_type` varchar(25) NOT NULL,
  PRIMARY KEY (`account_type_id`)
) COMMENT='checking, savings';

/***************************************************************
* Create account
***************************************************************/
CREATE TABLE IF NOT EXISTS `account` (
  `account_id` int NOT NULL AUTO_INCREMENT,
  `account_number` int NOT NULL,
  `account_type_id` tinyint NOT NULL,
  PRIMARY KEY (`account_id`),
  KEY `account_number` (`account_number`),
  CONSTRAINT `account_number` FOREIGN KEY (`account_number`) REFERENCES `account_number` (`account_number`)
	ON DELETE CASCADE
	ON UPDATE CASCADE,
  KEY `account_type_id` (`account_type_id`),
  CONSTRAINT `account_type_id` FOREIGN KEY (`account_type_id`) REFERENCES `account_type` (`account_type_id`)
	ON UPDATE CASCADE
)
COMMENT='Each user has should have two accounts.\nI thought about creating a table to store just the account number (so I dont store duplicate information) but I thought it was a bit too complicated for this school assignment.';

/***************************************************************
* Create transaction
***************************************************************/
CREATE TABLE IF NOT EXISTS `transaction` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `from_account_id` int DEFAULT NULL,
  `to_account_id` int DEFAULT NULL,
  `transaction_amount` decimal(10,2) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  `transaction_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `account_id_idx` (`from_account_id`,`to_account_id`),
  CONSTRAINT `account_id` FOREIGN KEY (`from_account_id`) REFERENCES `account` (`account_id`)
	ON UPDATE CASCADE
) 
COMMENT='From	+ NULL = Widthdraw\nTo	+ NULL = Deposit';

/*******************************************************************************************************************************
* 
* CREATE SP
*
*******************************************************************************************************************************/

USE `banking_system_project`;

/***************************************************************
* Create create_user
* Takes in all required params for creating a new user then
* it creates an account number, and two accounts (checking, savings)
* it outputs the new account number
***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `create_user`(
	IN firstName VARCHAR(50),
    IN lastName VARCHAR(50),
    IN hashed_password VARCHAR(255),
    IN salt VARCHAR(255),
    IN user_role_id TINYINT,
    OUT accountNumber int
)
BEGIN
-- Create User account
	INSERT INTO `user`
	(`user_first_name`, `user_last_name`, `hashed_password`, `salt`, `user_role_id`)
	VALUES
	(firstName, lastName, hashed_password, salt, user_role_id);
-- Generate bankaccount number
	SET @newAccountNumber = 0;
	CALL create_account_number(LAST_INSERT_ID(), @newAccountNumber);
   
-- Create Two bank accounts
	
    CALL create_account(@newAccountNumber, 1);
	CALL create_account(@newAccountNumber, 2);
	    
    SELECT @newAccountNumber INTO accountNumber;
END$$
DELIMITER ;

/***************************************************************
* Create create_account_number
***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `create_account_number`(
	IN user_id int,
    OUT accountNumber int
)
BEGIN
	INSERT INTO `account_number`
	(`user_id`)
	VALUES
	(user_id);
    SELECT LAST_INSERT_ID() INTO accountNumber; 
END$$
DELIMITER ;

/***************************************************************
* Create create_account
***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `create_account`(
    IN accountNumber int,
    IN accountType tinyint
)
BEGIN
	INSERT INTO `account`
	(`account_number`, `account_type_id`)
	VALUES
	(accountNumber, accountType);
END$$
DELIMITER ;

/***************************************************************
* Create insert_user_type
***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS`insert_user_type`(
	IN user_type_name VARCHAR(25)
  )
  BEGIN
  	INSERT INTO user_type(user_type)
  	SELECT user_type_name FROM DUAL
  	WHERE NOT EXISTS (
		SELECT * FROM `user_type`
	WHERE user_type.user_type=user_type_name LIMIT 1
  	);
  END$$
DELIMITER ;

/***************************************************************
* Create insert_account_type
***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS`insert_account_type`(
	IN account_type_name VARCHAR(25)
  )
  BEGIN
  	INSERT INTO account_type(account_type)
  	SELECT account_type_name FROM DUAL
  	WHERE NOT EXISTS (
		SELECT * FROM `account_type`
	WHERE account_type.account_type=account_type_name LIMIT 1
  	);
  END$$
DELIMITER ;