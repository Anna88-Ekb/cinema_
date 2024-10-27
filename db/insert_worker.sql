insert into
        worker_position (position_name, position_date_start)
values
        ('Служебная', '2024-10-23');

insert into
        worker_position (position_name, position_date_start)
values
        ('Менеджер', '2024-10-23');

insert into
        worker_position (position_name, position_date_start)
values
        ('Кассир', '2024-10-23');

--
insert into
        worker (
                worker_login,
                worker_email,
                worker_password,
                worker_name,
                worker_family_name,
                worker_patronymic,
                worker_position_position_id
        )
values
        (
                'system_data',
                'system_data',
                'system_data',
                'system_data',
                'system_data',
                'system_data',
                1
        );

insert into
        worker (
                worker_login,
                worker_email,
                worker_password,
                worker_name,
                worker_family_name,
                worker_patronymic,
                worker_position_position_id
        )
values
        (
                'cinema_login',
                'cinema@mail.ru',
                'cinema_pass',
                'Анна',
                'Савенок',
                'Михайловна',
                2
        );


insert into
        worker (
                worker_login,
                worker_email,
                worker_password,
                worker_name,
                worker_family_name,
                worker_patronymic,
                worker_position_position_id
        )
values
        (
                'mpei2024',
                'cinema_1@mail.ru',
                'mpeimpei24',
                'Виктория',
                'Савенок',
                'Викторовна',
                3
        );
