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

SET @MainAccountNumber = 0;

CALL `create_user`
('Korbin',
 'Dansie',
 '$2a$04$e7CrQ6mc2a5N7B3tc2BkVef36Y8IV7ecc1ORNhqoZ5mOk9iwRzzmy',
 'cvHxm,$rBeiofcx$tv,m^wg3ea[pc#vbi#o4rkjDnfgdSa#;l3%9opretmcv/^VwAe',
 1,
 @MainAccountNumber);
 SELECT @MainAccountNumber;
 
/***************************************************************
* test transfer
***************************************************************/
SELECT '******* test transfer *******' as '';
SET @TransferSuccess = 0;
CALL `transfer`(@MainAccountNumber, 2, @MainAccountNumber, 1, 10.00, "Deposit 10  into 1", @TransferSuccess);
CALL `transfer`(@MainAccountNumber, 1, @MainAccountNumber, 2, 8.00, "Withdraw 8 from 1", @TransferSuccess);
SELECT @TransferSuccess;

SELECT '******* Get Balance *******' as '';
SET @balance = 0;
CALL `sum_transaction`(@MainAccountNumber, 1, @balance);
SELECT @balance;

SELECT '******* Get After deposit 200 *******' as '';
SET @TransferSuccess = 0;
CALL `deposit`(@MainAccountNumber, 1, 200, NULL, @TransferSuccess);
SELECT @TransferSuccess;
SET @balance = 0;
CALL `sum_transaction`(@MainAccountNumber, 1, @balance);
SELECT @balance;

SELECT '******* Get After withdraw 10.01 *******' as '';
SET @TransferSuccess = 0;
CALL `withdraw`(@MainAccountNumber, 1, 10.01, NULL, @TransferSuccess);
SELECT @TransferSuccess;
SET @balance = 0;
CALL `sum_transaction`(@MainAccountNumber, 1, @balance);
SELECT @balance;

SELECT '******* Summ all accounts *******' as '';
CALL `get_account_balance`(@MainAccountNumber);