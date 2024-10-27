insert into
  client (
    client_login,
    client_phone,
    client_password,
    client_email,
    client_agreement_processing,
    client_agreement_newsletter,
    client_preference_account, 
    client_preference_email,
    client_preference_phone
  )
values
  ('system_data', 'system_data', 'system_data', 'system_data', true, false, false, false, false);
insert into
  unreg_user (user_phone, user_email)
values ('system_data', 'system_data');