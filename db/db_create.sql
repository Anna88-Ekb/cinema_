BEGIN;

CREATE TABLE
    cinema (
        cinema_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , cinema_name CHARACTER VARYING(100) NOT NULL
      , cinema_desc CHARACTER VARYING(540) NOT NULL
      , cinema_path CHARACTER VARYING NOT NULL
      , cinema_duration NUMERIC(5) NOT NULL
      , cinema_start_date DATE NOT NULL
      , cinema_end_date DATE
      , type_type_id INTEGER NOT NULL
      , age_age_id SMALLINT NOT NULL
    );

CREATE TABLE
    age (
        age_id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , age_desc CHARACTER VARYING(200) UNIQUE NOT NULL
    );

CREATE TABLE
    graphics (
        graphics_id SMALLINT NOT NULL PRIMARY KEY
      , graphics_desc CHARACTER VARYING(200) UNIQUE NOT NULL
    );

CREATE TABLE
    cinema_graphics (
        graphics_graphics_id SMALLINT NOT NULL
      , cinema_cinema_id INTEGER NOT NULL
    );

ALTER TABLE cinema_graphics ADD CONSTRAINT cinema_graphics_pk PRIMARY KEY (graphics_graphics_id, cinema_cinema_id);

CREATE TABLE
    country (
        country_id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , country_name CHARACTER VARYING(200) UNIQUE NOT NULL
    );

CREATE TABLE
    production (
        cinema_cinema_id INTEGER NOT NULL
      , country_country_id SMALLINT NOT NULL
    );

ALTER TABLE production ADD CONSTRAINT production_pk PRIMARY KEY (cinema_cinema_id, country_country_id);

CREATE TABLE
    type (
        type_id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , type_desc CHARACTER VARYING(200) NOT NULL
    );

CREATE TABLE
    hall (
        hall_id SMALLINT PRIMARY KEY
      , hall_name CHARACTER VARYING(20) NOT NULL
    );

CREATE TABLE
    cinema_session (
        session_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , cinema_cinema_id INTEGER NOT NULL
      , hall_hall_id SMALLINT NOT NULL
      , session_date DATE NOT NULL
      , session_time TIME WITHOUT TIME zone NOT NULL
      , session_basic_price NUMERIC(10, 2) NOT NULL
      , graphics_graphics_id SMALLINT NOT NULL
    );

CREATE TABLE
    client (
        client_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , client_login CHARACTER VARYING(20) UNIQUE NOT NULL
      , client_phone CHARACTER VARYING(11) UNIQUE NOT NULL
      , client_password CHARACTER VARYING(30) NOT NULL
      , client_email CHARACTER VARYING(30) UNIQUE NOT NULL
      , client_preference_phone BOOLEAN NOT NULL
      , client_preference_email BOOLEAN NOT NULL
      , client_agreement_processing BOOLEAN NOT NULL
      , client_agreement_newsletter BOOLEAN NOT NULL
      , client_preference_account BOOLEAN NOT NULL
      , CHECK (
            CHAR_LENGTH(client_phone) = 11
            AND CHAR_LENGTH(client_email) > 5
            AND CHAR_LENGTH(client_email) < 31
            AND CHAR_LENGTH(client_login) > 7
            AND CHAR_LENGTH(client_login) < 21
            AND CHAR_LENGTH(client_password) > 9
            AND CHAR_LENGTH(client_password) < 31
            AND client_agreement_processing != FALSE
        )
    );

CREATE TABLE
    promotion (
        promotion_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , promotion_desc CHARACTER VARYING(200) NOT NULL
      , promotion_discount NUMERIC(3, 2) NOT NULL
      , promotion_count NUMERIC(3) NOT NULL
      , promotion_date_start DATE NOT NULL
      , promotion_date_end TIMESTAMP WITHOUT TIME zone
    );

CREATE TABLE
    current_prom (
        promotion_promotion_id INTEGER NOT NULL
      , cinema_session_session_id INTEGER NOT NULL
    );

ALTER TABLE current_prom ADD CONSTRAINT current_prom_pk PRIMARY KEY (promotion_promotion_id, cinema_session_session_id);

CREATE TABLE
    place (
        place_row SMALLINT NOT NULL
      , place_col SMALLINT NOT NULL
      , hall_hall_id SMALLINT NOT NULL
    );

ALTER TABLE place ADD CONSTRAINT place_pk PRIMARY KEY (place_row, place_col, hall_hall_id);

CREATE TABLE
    unreg_user (
        user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , user_phone CHARACTER VARYING(11) NOT NULL
      , user_email CHARACTER VARYING(50) NOT NULL
    );

CREATE TABLE
    worker_position (
        position_id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , position_name CHARACTER VARYING(50) NOT NULL
      , position_date_start DATE NOT NULL
      , position_date_end TIMESTAMP WITHOUT TIME zone
    );

CREATE TABLE
    worker (
        worker_id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , worker_login CHARACTER VARYING(20) UNIQUE NOT NULL
      , worker_email CHARACTER VARYING(30) UNIQUE NOT NULL
      , worker_password CHARACTER VARYING(30) NOT NULL
      , worker_name CHARACTER VARYING(50) NOT NULL
      , worker_family_name CHARACTER VARYING(50) NOT NULL
      , worker_patronymic CHARACTER VARYING(50) NOT NULL
      , CHECK (
            CHAR_LENGTH(worker_email) > 5
            AND CHAR_LENGTH(worker_email) < 31
            AND CHAR_LENGTH(worker_login) > 7
            AND CHAR_LENGTH(worker_login) < 21
            AND CHAR_LENGTH(worker_password) > 9
            AND CHAR_LENGTH(worker_password) < 31
        )
    );

CREATE TABLE
    worker_access (
        worker_access_id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , worker_access_desc CHARACTER VARYING(50) NOT NULL
    );

CREATE TABLE
    permission (
        worker_access_worker_access_id SMALLINT NOT NULL
      , worker_worker_id SMALLINT NOT NULL
      , date_start DATE NOT NULL
      , date_end TIMESTAMP WITHOUT TIME zone
    );

ALTER TABLE permission ADD CONSTRAINT permission_pk PRIMARY KEY (worker_access_worker_access_id, worker_worker_id);

CREATE TABLE
    ticket (
        ticket_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
      , sale_status BOOLEAN NOT NULL
      , ticket_price NUMERIC(8, 2) NOT NULL
      , place_place_row SMALLINT NOT NULL
      , place_place_col SMALLINT NOT NULL
      , place_hall_hall_id SMALLINT NOT NULL
      , cinema_session_session_id INTEGER NULL
      , sale_time TIMESTAMP WITHOUT TIME zone
      , unreg_user_user_id BIGINT NOT NULL
      , worker_worker_id SMALLINT NOT NULL
      , client_client_id INTEGER NOT NULL
    );

CREATE TABLE
    hall_graphics (
        hall_hall_id SMALLINT NOT NULL
      , graphics_graphics_id SMALLINT NOT NULL
    );

CREATE TABLE
    current_position (
        worker_worker_id SMALLINT NOT NULL
      , worker_position_position_id SMALLINT NOT NULL
      , date_start DATE NOT NULL
      , date_end TIMESTAMP WITHOUT TIME zone
    );

ALTER TABLE current_position ADD CONSTRAINT current_position_pk PRIMARY KEY (worker_worker_id, worker_position_position_id);

ALTER TABLE current_position ADD CONSTRAINT current_position_worker_position_fk FOREIGN KEY (worker_position_position_id) REFERENCES worker_position (position_id);

ALTER TABLE worker_position ADD CONSTRAINT worker_position_pk PRIMARY KEY (position_id);

ALTER TABLE current_position ADD CONSTRAINT current_position_worker_fk FOREIGN KEY (worker_worker_id) REFERENCES worker (worker_id);

ALTER TABLE hall_graphics ADD CONSTRAINT hall_graphics_pk PRIMARY KEY (hall_hall_id, graphics_graphics_id);

ALTER TABLE hall_graphics ADD CONSTRAINT hall_graphics_graphics_fk FOREIGN KEY (graphics_graphics_id) REFERENCES graphics (graphics_id);

ALTER TABLE hall_graphics ADD CONSTRAINT hall_graphics_hall_fk FOREIGN KEY (hall_hall_id) REFERENCES hall (hall_id);

CREATE UNIQUE INDEX ticket__idx ON ticket (
    place_place_row ASC
  , place_place_col ASC
  , place_hall_hall_id ASC
);

ALTER TABLE cinema_session ADD CONSTRAINT cinema_session_cinema_fk FOREIGN KEY (cinema_cinema_id) REFERENCES cinema (cinema_id);

ALTER TABLE cinema_session ADD CONSTRAINT cinema_session_hall_fk FOREIGN KEY (hall_hall_id) REFERENCES hall (hall_id);

ALTER TABLE cinema_session ADD CONSTRAINT cinema_session_graphics_fk FOREIGN KEY (graphics_graphics_id) REFERENCES graphics (graphics_id);

ALTER TABLE cinema ADD CONSTRAINT cinema_type_fk FOREIGN KEY (type_type_id) REFERENCES type (type_id);

ALTER TABLE cinema ADD CONSTRAINT cinema_age_fk FOREIGN KEY (age_age_id) REFERENCES age (age_id);

ALTER TABLE current_prom ADD CONSTRAINT current_prom_cinema_session_fk FOREIGN KEY (cinema_session_session_id) REFERENCES cinema_session (session_id);

ALTER TABLE current_prom ADD CONSTRAINT current_prom_promotion_fk FOREIGN KEY (promotion_promotion_id) REFERENCES promotion (promotion_id);

ALTER TABLE permission ADD CONSTRAINT permission_worker_access_fk FOREIGN KEY (worker_access_worker_access_id) REFERENCES worker_access (worker_access_id);

ALTER TABLE permission ADD CONSTRAINT permission_worker_fk FOREIGN KEY (worker_worker_id) REFERENCES worker (worker_id);

ALTER TABLE place ADD CONSTRAINT place_hall_fk FOREIGN KEY (hall_hall_id) REFERENCES hall (hall_id);

ALTER TABLE production ADD CONSTRAINT production_cinema_fk FOREIGN KEY (cinema_cinema_id) REFERENCES cinema (cinema_id);

ALTER TABLE production ADD CONSTRAINT production_country_fk FOREIGN KEY (country_country_id) REFERENCES country (country_id);

ALTER TABLE ticket ADD CONSTRAINT ticket_cinema_session_fk FOREIGN KEY (cinema_session_session_id) REFERENCES cinema_session (session_id);

ALTER TABLE ticket ADD CONSTRAINT ticket_client_fk FOREIGN KEY (client_client_id) REFERENCES client (client_id);

ALTER TABLE ticket ADD CONSTRAINT ticket_place_fk FOREIGN KEY (
    place_place_row
  , place_place_col
  , place_hall_hall_id
) REFERENCES place (place_row, place_col, hall_hall_id);

ALTER TABLE ticket ADD CONSTRAINT ticket_unique UNIQUE (
    place_place_row
  , place_place_col
  , place_hall_hall_id
  , cinema_session_session_id
);

ALTER TABLE ticket ADD CONSTRAINT ticket_unreg_user_fk FOREIGN KEY (unreg_user_user_id) REFERENCES unreg_user (user_id);

ALTER TABLE ticket ADD CONSTRAINT ticket_worker_fk FOREIGN KEY (worker_worker_id) REFERENCES worker (worker_id);

ALTER TABLE worker ADD CONSTRAINT worker_worker_position_fk FOREIGN KEY (worker_position_position_id) REFERENCES worker_position (position_id);

ALTER TABLE cinema_graphics ADD CONSTRAINT cinema_graphics_cinema_fk FOREIGN KEY (cinema_cinema_id) REFERENCES cinema (cinema_id);

ALTER TABLE cinema_graphics ADD CONSTRAINT cinema_graphics_graphics_fk FOREIGN KEY (graphics_graphics_id) REFERENCES graphics (graphics_id);

END;



/* select * from worker w
join permission p on w.worker_id = p.worker_worker_id
join worker_access wa on p.worker_access_worker_access_id =  wa.worker_access_id
join current_position cp on w.worker_id = cp.worker_worker_id
join worker_position wp on cp.worker_position_position_id =wp.position_id */


/* select w.worker_login, w.worker_family_name, w.worker_patronymic, wa.worker_access_id from worker w
join permission p on w.worker_id = p.worker_worker_id
join worker_access wa on p.worker_access_worker_access_id =  wa.worker_access_id
join current_position cp on w.worker_id = cp.worker_worker_id
join worker_position wp on cp.worker_position_position_id = wp.position_id
where w.worker_login = 'cinema_login'
and w.worker_password = 'cinema_pass'
and (current_timestamp < cp.date_end or cp.date_end is null)
and (current_timestamp < p.date_end or cp.date_end is null); */


/* TRIM(REPLACE(full_name, ' ', '')) */