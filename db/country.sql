
--страны
insert into country (country_name) values ('Россия');
insert into country (country_name) values ('США');
insert into country (country_name) values ('Япония');
insert into country (country_name) values ('Германия');
insert into country (country_name) values ('Канада');
insert into country (country_name) values ('Новая Зеландия');
insert into country (country_name) values ('Бельгия');
insert into country (country_name) values ('Австралия');

--типы
insert into type (type_desc) values ('Фильм');
insert into type (type_desc) values ('Мультфильм');

--страны-фильмы

begin;
insert into production values (26, 2);
insert into production values (27, 2);
insert into production values (28, 2);
insert into production values (28, 3);
insert into production values (29, 2);
insert into production values (29, 9);
insert into production values (30, 2);
insert into production values (30, 5);
insert into production values (31, 2);
insert into production values (31, 6);
insert into production values (32, 2);
insert into production values (33, 2);
insert into production values (34, 2);
insert into production values (35, 2);
insert into production values (36, 2);
insert into production values (37, 2);
insert into production values (38, 2);
insert into production values (39, 7);
insert into production values (40, 4);
insert into production values (41, 2);
insert into production values (42, 1);
insert into production values (43, 1);
insert into production values (44, 2);
insert into production values (45, 1);

end;