USE `banking_system_project`;

CALL `banking_system_project`.`insert_user_type`('customer');
CALL `banking_system_project`.`insert_user_type`('employee');
CALL `banking_system_project`.`insert_user_type`('admin');

CALL `banking_system_project`.`insert_account_type`('checkings');
CALL `banking_system_project`.`insert_account_type`('savings');


SET @MainAccountNumber = 0;
CALL `create_user`
('Korbin',
 'Dansie',
 '$2a$04$e7CrQ6mc2a5N7B3tc2BkVef36Y8IV7ecc1ORNhqoZ5mOk9iwRzzmy',
 'cvHxm,$rBeiofcx$tv,m^wg3ea[pc#vbi#o4rkjDnfgdSa#;l3%9opretmcv/^VwAe',
 1,
 @MainAccountNumber);
 
 SELECT @MainAccountNumber FROM DUAL;