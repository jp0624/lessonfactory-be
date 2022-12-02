To run server on port 3000:

node server

MySQL server is hosted on:

192.168.2.83

SELECT user_id, u.name AS `Full Name`, u.group_id AS `group`, u.email AS `E-Mail Address`, g.name AS `Group Name`
FROM dams_schema.user AS u
INNER JOIN dams_schema.user_group AS g ON u.group_id = g.group_id
ORDER BY user_id ASC