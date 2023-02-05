USE `banking_system_project`;

/***************************************************************
* Create roles / types
***************************************************************/
SELECT '******* Create roles / types *******' as ' ';
CALL `banking_system_project`.`insert_user_type`('customer');
CALL `banking_system_project`.`insert_user_type`('employee');
CALL `banking_system_project`.`insert_user_type`('admin');

CALL `banking_system_project`.`insert_account_type`('checkings');
CALL `banking_system_project`.`insert_account_type`('savings');

/***************************************************************
* Insert test user
***************************************************************/
SELECT '******* Insert test user *******' as ' ';

SET @accountNumber1 = 0;
SET @accountNumber2 = 0;
SET @accountNumber3 = 0;

CALL `create_user`
('Korbin',
 'Dansie',
 'MySuperSecurePassword',
 'MySuperSecureSalt',
 1,
 @accountNumber1);
  CALL `create_user`
('Briella',
 'Rutherford',
 'FinalTestPersonPassword',
 'FinalTestSalt',
 1,
 @accountNumber2);
 CALL `create_user`
('Bradley',
 'Peterson',
 'SomeOtherPassword',
 'SomeOtherSalt',
 1,
 @accountNumber3);

/***************************************************************
* Admin commands
***************************************************************/
SELECT '******* Check credentials (pass then fail) *******' as '';
CALL `check_credentials`(@accountNumber1, 'MySuperSecurePassword');

CALL `check_credentials`(@accountNumber1, 'NotMypassword');

SELECT '******* Check users *******' as '';
CALL `change_user_type`(@accountNumber1, 'admin');
CALL `change_user_type`(@accountNumber2, 'employee');
CALL `change_user_type`(@accountNumber3, 'customer');

SELECT * FROM `user`;

/***************************************************************
* test transfer
***************************************************************/
SELECT '******* Deposit 200 *******' as '';
SET @TransferSuccess = 0;
CALL `deposit`(@accountNumber1, 1, 200, "A deposit", @TransferSuccess);

SELECT '******* Transfer 9.99 *******' as '';
CALL `transfer`(@accountNumber1, 1, @accountNumber1, 2, 9.99, "A transfer", @TransferSuccess);
CALL `get_account_balance`(@accountNumber1);

SELECT '******* Withdraw 90.01 *******' as '';
SET @TransferSuccess = 0;
CALL `withdraw`(@accountNumber1, 1, 90.01, "A withdraw", @TransferSuccess);
CALL `get_account_balance`(@accountNumber1);

SELECT '******* Atempt (should fail) to withdraw a million dollars *******' as '';
SET @TransferSuccess = 0;
CALL `withdraw`(@accountNumber1, 2, 1000000, "Im a rich", @TransferSuccess);
CALL `get_account_balance`(@accountNumber1);

SELECT '******* Transfer money into another person account *******' as '';
CALL `transfer`(@accountNumber1, 1, @accountNumber2, 2, 1.00, "Take a dollar", @TransferSuccess);
CALL `get_account_balance`(@accountNumber1);
CALL `get_account_balance`(@accountNumber2);

CALL `transfer`(@accountNumber1, 1, @accountNumber1, 1, 1.00, "Transfer to myself", @TransferSuccess);

SELECT '******* Show transaction history *******' as '';
CALL `get_account_transaction_history`(@accountNumber1);
CALL `get_transaction_history`(@accountNumber2, 2);