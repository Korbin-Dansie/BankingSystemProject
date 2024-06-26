USE `banking_system_project`;

/***************************************************************
* Create roles / types
***************************************************************/
SELECT '******* Create roles / types *******' as '';
CALL `banking_system_project`.`insert_user_type`('customer');
CALL `banking_system_project`.`insert_user_type`('employee');
CALL `banking_system_project`.`insert_user_type`('admin');

SELECT * from user_type;

CALL `banking_system_project`.`insert_account_type`('checkings');
CALL `banking_system_project`.`insert_account_type`('savings');

SELECT * from account_type;

/***************************************************************
* Insert test user
***************************************************************/
SELECT '******* Insert test user *******' as '';

SET @accountNumber1 = 0;
SET @accountNumber2 = 0;
SET @accountNumber3 = 0;
SET @successfulyCreateAccount = 0;

 -- password: 1
CALL `create_user`
('Korbin',
 'Dansie',
 'kd@email.com',
 '629221b4647a6cabe93c7d4626e7e32e3502a515efe3f5abe1138d16424c40d4',
 'ee730fd0992bc435',
 1,
 @accountNumber1, @successfulyCreateAccount);
 
 -- password: 2
  CALL `create_user`
('Briella',
 'Rutherford',
 'br@email.com',
 '44fd96315b55086a9cbec3fb0924004360ade4f0a8dac106a53e91e8161aa790',
 'f388482e9d75bcbd',
 1,
 @accountNumber2, @successfulyCreateAccount);
 
 -- password: 3
 CALL `create_user`
('Bradley',
 'Peterson',
 'bp@email.com',
 '3f19ab39e1fbdfbfe67c01ac1a1c110c25d724ac0daa01d62e960cecc7bf16b3',
 '2f873cdeb28f7247',
 1,
 @accountNumber3, @successfulyCreateAccount);
SELECT @accountNumber3, @successfulyCreateAccount;
SELECT * FROM `user`;

/***************************************************************
* Admin commands
***************************************************************/
SELECT '******* Check credentials (pass then fail) *******' as '';
CALL `check_credentials`(@accountNumber1, 'MySuperSecurePassword');

CALL `check_credentials`(@accountNumber1, 'NotMypassword');

SELECT '******* Change user types *******' as '';
CALL `change_user_type`(@accountNumber1, 'admin');
CALL `change_user_type`(@accountNumber2, 'employee');
CALL `change_user_type`(@accountNumber3, 'customer');
SELECT * FROM `user`;

/***************************************************************
* test transfer
***************************************************************/
SELECT '******* Deposit 200 into checking*******' as '';
SET @TransferSuccess = 0;
CALL `deposit`(@accountNumber1, 1, 200, 'A deposit', @TransferSuccess);
CALL `get_account_balance`(@accountNumber1);

SELECT '******* Transfer 9.99 into savings *******' as '';
CALL `transfer`(@accountNumber1, 1, @accountNumber1, 2, 9.99, 'A transfer', @TransferSuccess);
CALL `get_account_balance`(@accountNumber1);

SELECT '******* Withdraw 90.01 widthraw from checking *******' as '';
SET @TransferSuccess = 0;
CALL `withdraw`(@accountNumber1, 1, 90.01, 'A withdraw', @TransferSuccess);
CALL `get_account_balance`(@accountNumber1);

SELECT '******* Atempt (should fail) to withdraw to much / or transfer to same account *******' as '';
SET @TransferSuccess = 0;
CALL `withdraw`(@accountNumber1, 2, 1000000, 'Im a rich', @TransferSuccess);
CALL `get_account_balance`(@accountNumber1);
SELECT @TransferSuccess;

SELECT '******* Transfer money into another person account *******' as '';
CALL `transfer`(@accountNumber1, 1, @accountNumber2, 2, 1.00, 'Take a dollar', @TransferSuccess);
CALL `get_account_balance`(@accountNumber1);
CALL `get_account_balance`(@accountNumber2);

CALL `transfer`(@accountNumber1, 1, @accountNumber1, 1, 1.00, 'Transfer to myself', @TransferSuccess);

SELECT '******* Show transaction history *******' as '';
CALL `get_account_transaction_history`(@accountNumber1);
CALL `get_transaction_history`(@accountNumber2, 2);

SELECT * FROM `account` WHERE  account_number = @accountNumber1;

UPDATE `transaction` SET transaction_amount = 2.99 WHERE transaction_id = 2;

SELECT * FROM `account` WHERE  account_number = @accountNumber1;

DELETE FROM `transaction` WHERE transaction_id = 2;

SELECT * FROM `account` WHERE  account_number = @accountNumber1;


CALL `getAccountId`(@accountNumber1, 1, @accountIDForOne);

SELECT 'get_balance' AS '';
CALL `get_balance`(@accountNumber1, 1, @money);
SELECT @money;

SELECT 'sum_get_balance' AS '';
CALL `sum_get_balance`(@accountNumber1, 1, @money);
SELECT @money;

SELECT 'get_balance_by_account_id' AS '';
CALL `get_balance_by_account_id`(@accountIDForOne, @money);
SELECT @money;

SELECT 'sum_get_balance_by_account_id' AS '';
CALL `sum_get_balance_by_account_id`(@accountIDForOne, @money);
SELECT @money;

SELECT 'get_account_balance' AS '';
CALL `get_account_balance`(@accountNumber1);

SELECT 'sum_get_account_balance' AS '';
CALL `sum_get_account_balance`(@accountNumber1);