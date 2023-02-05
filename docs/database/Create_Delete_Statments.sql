USE `banking_system_project`;

SELECT CONCAT('DROP TABLE IF EXISTS `', table_name, '`;')
FROM information_schema.tables
WHERE table_schema = 'banking_system_project';

SELECT CONCAT('DROP PROCEDURE IF EXISTS `', routine_name, '`;')
from information_schema.routines 
WHERE routine_type = 'PROCEDURE' 
AND routine_schema = 'banking_system_project';