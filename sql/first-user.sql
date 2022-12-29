/*
 Add first user
 */
insert into
  "user" (
    first_name,
    last_name,
    email,
    password,
    user_status
  )
values
  (
    'admin',
    'bunker',
    'admin.bunker@bunkertech.id',
    '$2b$10$RCZx3zQHFc6bnexlFfI.oen3QKOU24D1pqaMLQzlnkbeLNSp2rsny',
    'actived'
  )
insert into
  "user_company_role" (role, user_id)
values
  ('bunker_admin', 1)