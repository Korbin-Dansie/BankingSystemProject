CREATE DATABASE IF NOT EXISTS `banking_system_project`;
USE `banking_system_project`;

SET foreign_key_checks = 0;
DROP TABLE IF EXISTS `transaction`; -- Handles Transactions
DROP TABLE IF EXISTS `account`; -- Is the sub accounts linked to a account number
DROP TABLE IF EXISTS `account_type`; -- Savings or Checkings
DROP TABLE IF EXISTS `account_number`; -- The account number assosiated with a user
DROP TABLE IF EXISTS `user`; -- All people in our db that includes customer and employees
DROP TABLE IF EXISTS `user_type`; -- Customer, Employee, Admin
SET foreign_key_checks = 1;

DROP PROCEDURE IF EXISTS `insert_account_type`; -- Create a new sub type of bank account 
DROP PROCEDURE IF EXISTS `insert_user_type`; -- Create a new user type

DROP PROCEDURE IF EXISTS `create_user`; -- Create a user, account number, and two sub accounts
DROP PROCEDURE IF EXISTS `change_user_type`; -- Create a new user type using a string
DROP PROCEDURE IF EXISTS `create_account`; -- Create a sub account
DROP PROCEDURE IF EXISTS `create_account_number`; -- Create a account number

DROP PROCEDURE IF EXISTS `getUserRole`; -- Gets if account number is an customer, employee, or admin
DROP PROCEDURE IF EXISTS `setUserRole`; -- updates the account numbers user role


DROP PROCEDURE IF EXISTS `getAccountID`; -- Returns account.account_id
DROP PROCEDURE IF EXISTS `getAccountName`; -- Returns firstName and lastName

DROP PROCEDURE IF EXISTS `get_balance`; -- Returns balance from account number and type
DROP PROCEDURE IF EXISTS `get_balance_by_account_id`; -- Returns balance from account_id
DROP PROCEDURE IF EXISTS `get_account_balance`; -- Returns table of all the accounts balances (uses a cursor)

DROP PROCEDURE IF EXISTS `transfer`; -- Transfer money from one user to another
DROP PROCEDURE IF EXISTS `user_transfer`; -- Used by customers to transfer money between themselves
DROP PROCEDURE IF EXISTS `deposit`; -- Deposit money into an account
DROP PROCEDURE IF EXISTS `withdraw`; -- Withdraw money from an account
DROP PROCEDURE IF EXISTS `get_transaction_history`; -- Return a table of all the transaction a sub account has done
DROP PROCEDURE IF EXISTS `get_account_transaction_history`; -- Returns all the transactions a user has done

DROP PROCEDURE IF EXISTS `check_credentials`; -- check if account number and hashed_password match
DROP PROCEDURE IF EXISTS `check_accountNumber`; -- See if an account exists at that account number
DROP PROCEDURE IF EXISTS `get_salt`; -- Get the salt from the user with the account number
DROP PROCEDURE IF EXISTS `change_password`; -- Get the salt from the user with the account number

DROP TRIGGER IF EXISTS `trigger_add_new_transaction`; -- Updates account amount on new row added
DROP TRIGGER IF EXISTS `trigger_update_new_transaction`; -- Updates account amount on new row added
DROP TRIGGER IF EXISTS `trigger_delete_new_transaction`; -- Updates account amount on new row added

-- Currently un-used
DROP PROCEDURE IF EXISTS `sum_get_balance`; -- Returns balance from account number and type by summing from transactions history
DROP PROCEDURE IF EXISTS `sum_get_balance_by_account_id`; -- Returns balance from account_id by summing from transactions history
DROP PROCEDURE IF EXISTS `sum_get_account_balance`; -- Returns table of all the accounts balances (uses a cursor) by summing from transactions history


/***************************************************************
 * Create user_type
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `user_type` (
  `user_type_id` TINYINT NOT NULL AUTO_INCREMENT,
  `user_type` VARCHAR(25) NOT NULL,
  PRIMARY KEY (`user_type_id`)
) COMMENT = 'customer, employee, admin';
/***************************************************************
 * Create user
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_first_name` varchar(50) NOT NULL,
  `user_last_name` varchar(50) NOT NULL,
  `email`			varchar(50) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `user_role_id` TINYINT NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `user_type_id` (`user_role_id`),
  CONSTRAINT `user_type_id` FOREIGN KEY (`user_role_id`) REFERENCES `user_type` (`user_type_id`) ON UPDATE CASCADE
) COMMENT = 'This is for all the customers, employees, and admins.';
/***************************************************************
 * Create account_number
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `account_number` (
  `account_number` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  PRIMARY KEY (`account_number`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) AUTO_INCREMENT = 111111 COMMENT = 'For storing the users account number';
/***************************************************************
 * Create account_type
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `account_type` (
  `account_type_id` tinyint NOT NULL AUTO_INCREMENT,
  `account_type` varchar(25) NOT NULL,
  PRIMARY KEY (`account_type_id`)
) COMMENT = 'checking, savings';
/***************************************************************
 * Create account
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `account` (
  `account_id` int NOT NULL AUTO_INCREMENT,
  `account_number` int NOT NULL,
  `account_type_id` tinyint NOT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`account_id`),
  KEY `account_number` (`account_number`),
  CONSTRAINT `account_number` FOREIGN KEY (`account_number`) REFERENCES `account_number` (`account_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  KEY `account_type_id` (`account_type_id`),
  CONSTRAINT `account_type_id` FOREIGN KEY (`account_type_id`) REFERENCES `account_type` (`account_type_id`) ON UPDATE CASCADE
) COMMENT = 'Each user has should have two accounts.\nI thought about creating a table to store just the account number (so I dont store duplicate information) but I thought it was a bit too complicated for this school assignment.';
/***************************************************************
 * Create transaction
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `transaction` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `from_account_id` int DEFAULT NULL,
  `to_account_id` int DEFAULT NULL,
  `transaction_amount` decimal(10, 2) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  `transaction_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `account_id_idx` (`from_account_id`, `to_account_id`),
  CONSTRAINT `account_id` FOREIGN KEY (`from_account_id`) REFERENCES `account` (`account_id`) ON UPDATE CASCADE
) COMMENT = 'From	+ NULL = Widthdraw\nTo	+ NULL = Deposit';
/*******************************************************************************************************************************
 * 
 * CREATE PROCEDURES
 *
 *******************************************************************************************************************************/
/***************************************************************
 * Create insert_account_type
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `insert_account_type`(IN account_type_name VARCHAR(25)) BEGIN
INSERT INTO account_type(account_type)
SELECT account_type_name
FROM DUAL
WHERE NOT EXISTS (
    SELECT *
    FROM `account_type`
    WHERE account_type.account_type = account_type_name
    LIMIT 1
  );
END
$$ DELIMITER ;
/***************************************************************
 * Create insert_user_type
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `insert_user_type`(IN user_type_name VARCHAR(25)) BEGIN
INSERT INTO user_type(user_type)
SELECT user_type_name
FROM DUAL
WHERE NOT EXISTS (
    SELECT *
    FROM `user_type`
    WHERE user_type.user_type = user_type_name
    LIMIT 1
  );
END
$$ DELIMITER ;
/***************************************************************
 * Create create_user
 * Takes in all required params for creating a new user then
 * it creates an account number, and two accounts (checking, savings)
 * it outputs the new account number
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `create_user`(
  IN firstName			VARCHAR(50),
  IN lastName			VARCHAR(50),
  IN email				VARCHAR(50),
  IN hashed_password 	VARCHAR(255),
  IN salt				VARCHAR(255),
  IN user_role_id 		TINYINT,
  OUT accountNumber 	INT,
  OUT result			INT
) 
BEGIN -- Create User account
 DECLARE nCount INT DEFAULT 0;
 SET result = 0;
 SELECT Count(*) INTO nCount FROM `user` as u WHERE u.email = email;
 IF nCount > 0 THEN
	SET result = 1;
 ELSE 
 	SET result = 0;
	INSERT INTO `user` (
		`user_first_name`,
		`user_last_name`,
		`email`,
		`hashed_password`,
		`salt`,
		`user_role_id`
	)
	VALUES (
		firstName,
		lastName,
		email,
		hashed_password,
		salt,
		user_role_id
	);
	-- Generate bankaccount number
	SET @newAccountNumber = 0;
	CALL create_account_number(LAST_INSERT_ID(), @newAccountNumber);
	-- Create Two bank accounts
	CALL create_account(@newAccountNumber, 1);
	CALL create_account(@newAccountNumber, 2);
	SELECT @newAccountNumber INTO accountNumber;
	END IF;
END
$$ DELIMITER ;
/***************************************************************
 * Create change_user_type
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `change_user_type`(IN accountNumber INT, IN userType VARCHAR(255)) BEGIN
UPDATE `user` as u
  INNER JOIN account_number as an ON an.user_id = u.user_id
SET user_role_id = (
    SELECT user_type_id
    FROM user_type
    where user_type = userType
  )
WHERE an.account_number = accountNumber
LIMIT 1;
END
$$ DELIMITER ;
/***************************************************************
 * Create create_account
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `create_account`(
  IN accountNumber int,
  IN accountType tinyint
) BEGIN
INSERT INTO `account` (`account_number`, `account_type_id`)
VALUES (accountNumber, accountType);
END
$$ DELIMITER ;
/***************************************************************
 * Create create_account_number
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `create_account_number`(IN user_id int, OUT accountNumber int) BEGIN
INSERT INTO `account_number` (`user_id`)
VALUES (user_id);
SELECT LAST_INSERT_ID() INTO accountNumber;
END
$$ DELIMITER ;

/***************************************************************
 * Create getUserRole
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `getUserRole`(IN account_number INT)
BEGIN
	SELECT ut.user_type
    FROM account_number AS an
    INNER JOIN `user` AS u ON an.user_id = u.user_id
    INNER JOIN `user_type` AS ut ON u.user_role_id = ut.user_type_id
    WHERE an.account_number = account_number
    LIMIT 1;
END
$$ DELIMITER ;
/***************************************************************
 * Create setUserRole
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `setUserRole`(IN account_number INT, IN user_type_id TINYINT)
BEGIN
	UPDATE `user` AS u
		INNER JOIN `account_number` AS an ON an.user_id = u.user_id
    SET u.user_role_id = user_type_id
    WHERE an.account_number = account_number
    LIMIT 1;
END
$$ DELIMITER ;

/***************************************************************
 * Create getAccountId
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `getAccountID`(
  IN account_number INT,
  IN account_type TINYINT,
  OUT account_ID INT
) BEGIN
SELECT a.account_id
FROM `account` AS a
WHERE a.account_number = account_number
  AND a.account_type_id = account_type INTO account_ID;
END
$$ DELIMITER ;
/***************************************************************
 * Create getAccountName
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `getAccountName`(
  IN account_number INT
) BEGIN
SELECT u.user_first_name AS firstName, u.user_last_name AS lastName
FROM `user` AS u
INNER JOIN account_number AS an ON an.user_id = u.user_id
WHERE an.account_number = account_number;
END
$$ DELIMITER ;

/***************************************************************
 * Create sum_get_balance
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `sum_get_balance`(
  IN accountNumber INT,
  IN accountType TINYINT,
  OUT balance DECIMAL(10, 2)
) BEGIN
DECLARE accountID INT DEFAULT 0;
DECLARE deposits DECIMAL(10, 2) DEFAULT 20;
DECLARE withdraws DECIMAL(10, 2) DEFAULT 1;
CALL `getAccountID`(accountNumber, accountType, accountID);
CALL `sum_get_balance_by_account_id`(accountID, balance);
END
$$ DELIMITER ;
/***************************************************************
 * Create sum_get_balance_by_account_id
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `sum_get_balance_by_account_id`(
  IN accountID INT,
  OUT balance DECIMAL(10, 2)
) BEGIN
DECLARE deposits DECIMAL(10, 2) DEFAULT 0;
DECLARE withdraws DECIMAL(10, 2) DEFAULT 0;
SELECT SUM(tt.transaction_amount)
FROM `transaction` AS tt
WHERE tt.to_account_id = accountID INTO deposits;
SELECT SUM(ft.transaction_amount)
FROM `transaction` AS ft
WHERE ft.from_account_id = accountID INTO withdraws;
IF deposits IS NULL THEN
SET deposits = 0;
END IF;
IF withdraws IS NULL THEN
SET withdraws = 0;
END IF;
-- Withdraws need to be negitive
SELECT deposits - withdraws INTO balance;
END
$$ DELIMITER ;
/***************************************************************
 * Create sum_get_account_balance
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `sum_get_account_balance`(
	IN accountNumber INT
) BEGIN
DECLARE amount DECIMAL(10, 2) DEFAULT 0;
DECLARE finished INTEGER DEFAULT 0;
DECLARE _id INT;
-- Store account.account_id
DECLARE _typeid TINYINT;
-- Store account.account_type_id
DECLARE cur_balance CURSOR FOR
SELECT a.account_id,
  a.account_type_id
FROM `account` AS a
WHERE a.account_number = accountNumber;
DECLARE CONTINUE HANDLER FOR NOT FOUND
SET finished = 1;
-- Create temp table
DROP TEMPORARY TABLE IF EXISTS balance_table;
CREATE TEMPORARY TABLE balance_table(account_type TINYINT, balance DECIMAL(10, 2));
-- Loop through each sub-account
OPEN cur_balance;
getBalance: LOOP FETCH cur_balance INTO _id,
_typeid;
IF finished = 1 THEN LEAVE getBalance;
END IF;
-- Call balance and insert it into current row
CALL `banking_system_project`.`sum_get_balance_by_account_id`(_id, amount);
INSERT INTO balance_table(account_type, balance)
VALUES (_typeid, amount);
END LOOP getBalance;
CLOSE cur_balance;
-- Insert the balance of sub account into temp table
SELECT *
FROM balance_table;
DROP TEMPORARY TABLE balance_table;
END
$$ DELIMITER ;

/***************************************************************
 * Create get_balance
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `get_balance`(
  IN accountNumber INT,
  IN accountType TINYINT,
  OUT balance DECIMAL(10, 2)
) BEGIN
DECLARE accountID INT DEFAULT 0;
CALL `getAccountID`(accountNumber, accountType, accountID);
CALL `get_balance_by_account_id`(accountID, balance);
END
$$ DELIMITER ;

/***************************************************************
 * Create get_balance_by_account_id
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `get_balance_by_account_id`(
  IN accountID INT,
  OUT balance DECIMAL(10, 2)
) 
BEGIN
	SELECT a.amount FROM `account` as a
	WHERE a.account_id = accountID
	INTO balance;
END
$$ DELIMITER ;
/***************************************************************
 * Create get_account_balance
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `get_account_balance`(IN accountNumber INT) 
BEGIN
	SELECT a.account_type_id as `account_type`, a.amount as `balance`
    FROM
    `account` as a
    WHERE a.account_number = accountNumber;
END
$$ DELIMITER ;
/***************************************************************
 * Create transfer
 * If values are not put in then the transfer is a 
 * deposit / withdraw at the bank. 
 * Returns 1 for true. Returns 0 if there is an error 
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `transfer`(
  IN fromAccountNumber INT,
  IN fromAccountType TINYINT,
  IN toAccountNumber INT,
  IN toAccountType TINYINT,
  IN amount DECIMAL(10, 2),
  IN memo VARCHAR(255),
  OUT result TINYINT
) 
BEGIN
DECLARE fromAccountId INT;
DECLARE toAccountId INT;
DECLARE balance DECIMAL(10, 2);
CALL `getAccountID`(
  fromAccountNumber,
  fromAccountType,
  fromAccountId
);
CALL `getAccountID`(toAccountNumber, toAccountType, toAccountId);
-- Check the balance of the from account
CALL `get_balance_by_account_id`(fromAccountId, balance);
-- If amount is greater than from account balance return 0. If there is no from account then its a deposit
-- or trying to tranfer money to the same account
IF (
  (
    (amount > balance)
    AND (fromAccountId IS NOT NULL)
  )
  OR fromAccountId = toAccountId
  OR (amount <= 0)
) THEN
SELECT 0 INTO result;
ELSE -- Transfer the money
INSERT INTO `transaction` (
    `from_account_id`,
    `to_account_id`,
    `transaction_amount`,
    `memo`
  )
VALUES (
    fromAccountId,
    toAccountId,
    amount,
    memo
  );
SELECT 1 INTO result;
END IF;
END
$$ DELIMITER ;
/***************************************************************
 * CREATE user_transfer
 * A more restrictive transfer used by customers
 * It makes sure that users cannt transfer to an account that 
 * does not exist, and cannot transfer $0
 ***************************************************************/
 DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `user_transfer`(
  IN fromAccountNumber INT,
  IN fromAccountType TINYINT,
  IN toAccountNumber INT,
  IN toAccountType TINYINT,
  IN amount DECIMAL(10, 2),
  IN memo VARCHAR(255),
  OUT result TINYINT)
BEGIN
	DECLARE fromAccountId INT DEFAULT 0;
    DECLARE toAccountId	INT DEFAULT 0;
    
	-- Make sure fromAccount exists
    CALL `banking_system_project`.`getAccountID`(
    fromAccountNumber,
    fromAccountType,
    fromAccountId
    );

    -- Make sure toAccount exists
	CALL `banking_system_project`.`getAccountID`(
    toAccountNumber,
    toAccountType,
    toAccountId
    );
    
    IF(fromAccountId IS NULL OR toAccountId IS NULL) THEN
    SET result = 0;
    ELSE 
    CALL `banking_system_project`.`transfer`(
    fromAccountNumber,
    fromAccountType,
    toAccountNumber,
    toAccountType,
	amount,
    memo,
    result
    );
    END IF;
END
$$ DELIMITER ;

/***************************************************************
 * Create deposit
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `deposit`(
  IN toAccountNumber INT,
  IN toAccountType TINYINT,
  IN amount DECIMAL(10, 2),
  IN memo VARCHAR(255),
  OUT result TINYINT
) 
  BEGIN 
	CALL `banking_system_project`.`transfer`(
	NULL,
	NULL,
	toAccountNumber,
	toAccountType,
	amount,
	memo,
	result
);
END
$$ DELIMITER ;
/***************************************************************
 * Create withdraw
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `withdraw`(
  IN fromAccountNumber INT,
  IN fromAccountType TINYINT,
  IN amount DECIMAL(10, 2),
  IN memo VARCHAR(255),
  OUT result TINYINT
) 
BEGIN 
  CALL `banking_system_project`.`transfer`(
  fromAccountNumber,
  fromAccountType,
  NULL,
  NULL,
  amount,
  memo,
  result
);
END
$$ DELIMITER ;
/***************************************************************
 * Create get_transaction_history
  * if updated make sure to update get_account_transaction_history
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `get_transaction_history`(
  IN accountNumber INT,
  IN accountType TINYINT
) BEGIN
SELECT a.account_type_id,
  -- Determines if the amount is a deposit (1) or withdraw (0)
  CASE
    WHEN a.account_id = t.to_account_id THEN 1
    ELSE 0
  END AS 'isDeposit',
  t.transaction_amount,
  t.memo,
  t.transaction_time,
  other_a.account_number AS other_account_number
FROM account_number AS an
  INNER JOIN `account` as a ON a.account_number = an.account_number
  INNER JOIN `transaction` as t ON (
    (t.from_account_id = a.account_id)
    OR (t.to_account_id = a.account_id)
  )    
  LEFT JOIN `account` as other_a ON #Left join to get deposit and withdraws. Join on the other account_id number
	(t.from_account_id = other_a.account_id AND !(t.from_account_id = a.account_id))
    OR (t.to_account_id = other_a.account_id AND !(t.to_account_id = a.account_id))
WHERE an.account_number = accountNumber
  AND a.account_type_id = accountType
ORDER BY t.transaction_id DESC;
END
$$ DELIMITER ;
/***************************************************************
 * Create get_account_transaction_history
 * returns a table of all the transactions for a user
 * if updated make sure to update get_transaction_history
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `get_account_transaction_history`(IN accountNumber INT) BEGIN
SELECT a.account_type_id,
  -- Determines if the amount is a deposit (1) or withdraw (0)
  CASE
    WHEN a.account_id = t.to_account_id THEN 1
    ELSE 0
  END AS 'isDeposit',
  t.transaction_amount,
  t.memo,
  t.transaction_time,
  other_a.account_number AS other_account_number
FROM account_number AS an
  INNER JOIN `account` as a ON a.account_number = an.account_number
  INNER JOIN `transaction` as t ON (
    (t.from_account_id = a.account_id)
    OR (t.to_account_id = a.account_id))
    LEFT JOIN `account` as other_a ON #Left join to get deposit and withdraws. Join on the other account_id number
	(t.from_account_id = other_a.account_id AND !(t.from_account_id = a.account_id))
    OR (t.to_account_id = other_a.account_id AND !(t.to_account_id = a.account_id))
WHERE an.account_number = accountNumber  
ORDER BY t.transaction_id DESC;

END
$$ DELIMITER ;
/***************************************************************
 * Create check_credentials
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `check_credentials`(
  IN accountNumber INT,
  IN hashed_password VARCHAR(255)
) BEGIN
SELECT EXISTS(
    SELECT *
    FROM `user` AS u
      INNER JOIN `account_number` AS an ON u.user_id = an.user_id
    WHERE an.account_number = accountNumber
      AND u.hashed_password = hashed_password
  ) AS result;
END
$$ DELIMITER ;

/***************************************************************
 * Create check_accountNumber
 * returns a row of result
 * 0 = No user found, 1 = User found
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `check_accountNumber`(IN accountNumber INT)
BEGIN
SELECT EXISTS(
    SELECT *
    FROM `user` AS u
      INNER JOIN `account_number` AS an ON u.user_id = an.user_id
    WHERE an.account_number = accountNumber
  ) AS result;
END
$$ DELIMITER ;

/***************************************************************
 * Create get_salt
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `get_salt`(IN accountNumber INT) BEGIN
SELECT u.salt
FROM `user` AS u
  INNER JOIN account_number AS an ON u.user_id = an.user_id
WHERE an.account_number = accountNumber;
END 
$$ DELIMITER ;
/***************************************************************
 * Create change_password
 ***************************************************************/
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `change_password`(IN accountNumber INT, IN hashed_password VARCHAR(255), IN salt VARCHAR(255)) 
BEGIN
	UPDATE `user` AS u
    INNER JOIN `account_number` AS an ON an.user_id = u.user_id
    SET u.hashed_password = hashed_password, u.salt = salt
    WHERE an.account_number = accountNumber
    LIMIT 1;
END 
$$ DELIMITER ;

/*******************************************************************************************************************************
 * 
 * CREATE TRIGGERS
 *
 *******************************************************************************************************************************/
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS `trigger_add_new_transaction` 
AFTER INSERT
ON `transaction` FOR EACH ROW
BEGIN
	-- Add to the to account
	UPDATE `account` AS `a`
    SET 
    a.amount = a.amount + NEW.transaction_amount
    WHERE a.account_id = NEW.to_account_id;
    
    -- Sub from the from account
	UPDATE `account` AS `a`
    SET 
    a.amount = a.amount - NEW.transaction_amount
    WHERE a.account_id = NEW.from_account_id;
END 
$$ 

CREATE TRIGGER IF NOT EXISTS `trigger_update_new_transaction`
BEFORE UPDATE
ON `transaction` FOR EACH ROW
BEGIN 
	-- Might add this to only trigger on change of to/from account, OR amount 
    -- https://stackoverflow.com/questions/4097949/mysql-trigger-question-only-trigger-when-a-column-is-changed
	-- Add the orignal amount back to the original from_account
	UPDATE `account` AS `a`
    SET 
    a.amount = a.amount + OLD.transaction_amount
    WHERE a.account_id = OLD.from_account_id;
    
    -- Subtract the orignal amount from the original to_account
	UPDATE `account` AS `a`
    SET 
    a.amount = a.amount - OLD.transaction_amount
    WHERE a.account_id = OLD.to_account_id;
    
    -- Subtract the new amount from the new from_account
	UPDATE `account` AS `a`
    SET 
    a.amount = a.amount - NEW.transaction_amount
    WHERE a.account_id = NEW.from_account_id;
    
	-- Add the new amount from the new to_account
	UPDATE `account` AS `a`
    SET 
    a.amount = a.amount + NEW.transaction_amount
    WHERE a.account_id = NEW.to_account_id;
END 
$$

CREATE TRIGGER IF NOT EXISTS `trigger_delete_new_transaction`
BEFORE DELETE
ON `transaction` FOR EACH ROW
BEGIN 
	-- Add the orignal amount back to the original from_account
	UPDATE `account` AS `a`
    SET 
    a.amount = a.amount + OLD.transaction_amount
    WHERE a.account_id = OLD.from_account_id;
    
    -- Subtract the orignal amount from the original to_account
	UPDATE `account` AS `a`
    SET 
    a.amount = a.amount - OLD.transaction_amount
    WHERE a.account_id = OLD.to_account_id;
END 
$$
