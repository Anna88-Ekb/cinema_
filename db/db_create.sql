BEGIN;

CREATE TABLE
    cinema (
        cinema_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        cinema_name character varying(100) NOT NULL,
        cinema_desc character varying (540) NOT NULL,
        cinema_path character varying NOT NULL,
        cinema_duration numeric(5) NOT NULL,
        cinema_start_date DATE NOT NULL,
        cinema_end_date DATE,
        type_type_id integer NOT NULL,
        age_age_id smallint NOT NULL
    );

CREATE TABLE
    age (
        age_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        age_desc character varying(200) UNIQUE NOT NULL
    );

CREATE TABLE
    graphics (
        graphics_id smallint NOT NULL PRIMARY KEY,
        graphics_desc character varying(200) UNIQUE NOT NULL
    );

CREATE TABLE
    cinema_graphics (
        graphics_graphics_id smallint NOT NULL,
        cinema_cinema_id integer NOT NULL
    );

ALTER TABLE cinema_graphics ADD CONSTRAINT cinema_graphics_pk PRIMARY KEY (graphics_graphics_id, cinema_cinema_id);

CREATE TABLE
    country (
        country_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        country_name character varying(200) UNIQUE NOT NULL
    );

CREATE TABLE
    production (
        cinema_cinema_id integer NOT NULL,
        country_country_id smallint NOT NULL
    );

ALTER TABLE production ADD CONSTRAINT production_pk PRIMARY KEY (cinema_cinema_id, country_country_id);

CREATE TABLE
    type (
        type_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        type_desc character varying(200) NOT NULL
    );

CREATE TABLE
    hall (
        hall_id smallint PRIMARY KEY,
        hall_name character varying(20) NOT NULL
    );

CREATE TABLE
    cinema_session (
        session_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        cinema_cinema_id integer NOT NULL,
        hall_hall_id smallint NOT NULL,
        session_date DATE NOT NULL,
        session_time time without time zone NOT NULL,
        session_basic_price numeric(10, 2) NOT NULL,
        graphics_graphics_id smallint NOT NULL
    );

CREATE TABLE
    client (
        client_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        client_login character varying(20) UNIQUE NOT NULL,
        client_phone character varying(11) UNIQUE NOT NULL,
        client_password character varying(30) NOT NULL,
        client_email character varying(30) UNIQUE NOT NULL,
        client_preference_phone boolean NOT NULL,
        client_preference_email boolean NOT NULL,
        client_agreement_processing boolean NOT NULL,
        client_agreement_newsletter boolean NOT NULL,
        client_preference_account boolean NOT NULL,
        CHECK (
            char_length(client_phone) = 11
            AND char_length(client_email) > 5
            AND char_length(client_email) < 31
            AND char_length(client_login) > 7
            AND char_length(client_login) < 21
            AND char_length(client_password) > 9
            AND char_length(client_password) < 31
            AND client_agreement_processing != false
        )
    );

CREATE TABLE
    promotion (
        promotion_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        promotion_desc character varying(200) NOT NULL,
        promotion_discount numeric(3, 2) NOT NULL,
        promotion_count numeric(3) NOT NULL,
        promotion_date_start date NOT NULL,
        promotion_date_end timestamp without time zone 
    );

CREATE TABLE
    current_prom (
        promotion_promotion_id integer NOT NULL,
        cinema_session_session_id integer NOT NULL
    );

ALTER TABLE current_prom ADD CONSTRAINT current_prom_pk PRIMARY KEY (promotion_promotion_id, cinema_session_session_id);

CREATE TABLE
    place (
        place_row smallint NOT NULL,
        place_col smallint NOT NULL,
        hall_hall_id smallint NOT NULL
    );

ALTER TABLE place ADD CONSTRAINT place_pk PRIMARY KEY (place_row, place_col, hall_hall_id);

CREATE TABLE
    unreg_user (
        user_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_phone character varying(11) NOT NULL,
        user_email character varying(50) NOT NULL
    );

CREATE TABLE
    worker_position (
        position_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        position_name character varying(50) NOT NULL,
        position_date_start DATE NOT NULL,
        position_date_end TIMESTAMP without time zone
    );

CREATE TABLE
    worker (
        worker_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        worker_login character varying(20) UNIQUE NOT NULL,
        worker_email character varying(30) UNIQUE NOT NULL,
        worker_password character varying(30) NOT NULL,
        worker_name character varying(50) NOT NULL,
        worker_family_name character varying(50) NOT NULL,
        worker_patronymic character varying(50) NOT NULL,
        worker_position_position_id smallint NOT NULL,
        CHECK (
            char_length(worker_email) > 5
            AND char_length(worker_email) < 31
            AND char_length(worker_login) > 7
            AND char_length(worker_login) < 21
            AND char_length(worker_password) > 9
            AND char_length(worker_password) < 31
        )
    );

CREATE TABLE
    worker_access (
        worker_access_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        worker_access_desc character varying(50) NOT NULL
    );

CREATE TABLE
    permission (
        worker_access_worker_access_id smallint NOT NULL,
        worker_worker_id smallint NOT NULL,
        date_start DATE NOT NULL,
        date_end TIMESTAMP without time zone
    );

ALTER TABLE permission ADD CONSTRAINT permission_pk PRIMARY KEY (worker_access_worker_access_id, worker_worker_id);

CREATE TABLE
    ticket (
        ticket_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        sale_status boolean NOT NULL,
        ticket_price numeric(8, 2) NOT NULL,
        place_place_row smallint NOT NULL,
        place_place_col smallint NOT NULL,
        place_hall_hall_id smallint NOT NULL,
        cinema_session_session_id integer NULL,
        sale_time TIMESTAMP without time zone,
        unreg_user_user_id bigint NOT NULL,
        worker_worker_id smallint NOT NULL,
        client_client_id integer NOT NULL
    );

CREATE TABLE
    hall_graphics (
        hall_hall_id smallint NOT NULL,
        graphics_graphics_id smallint NOT NULL
    );

ALTER TABLE hall_graphics ADD CONSTRAINT hall_graphics_pk PRIMARY KEY (hall_hall_id, graphics_graphics_id);

ALTER TABLE hall_graphics ADD CONSTRAINT hall_graphics_graphics_fk FOREIGN KEY (graphics_graphics_id) REFERENCES graphics (graphics_id);

ALTER TABLE hall_graphics ADD CONSTRAINT hall_graphics_hall_fk FOREIGN KEY (hall_hall_id) REFERENCES hall (hall_id);

CREATE UNIQUE INDEX ticket__idx ON ticket (
    place_place_row ASC,
    place_place_col ASC,
    place_hall_hall_id ASC
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
    place_place_row,
    place_place_col,
    place_hall_hall_id
) REFERENCES place (place_row, place_col, hall_hall_id);

ALTER TABLE ticket ADD CONSTRAINT ticket_unique UNIQUE (
    place_place_row,
    place_place_col,
    place_hall_hall_id,
    cinema_session_session_id
);

ALTER TABLE ticket ADD CONSTRAINT ticket_unreg_user_fk FOREIGN KEY (unreg_user_user_id) REFERENCES unreg_user (user_id);

ALTER TABLE ticket ADD CONSTRAINT ticket_worker_fk FOREIGN KEY (worker_worker_id) REFERENCES worker (worker_id);

ALTER TABLE worker ADD CONSTRAINT worker_worker_position_fk FOREIGN KEY (worker_position_position_id) REFERENCES worker_position (position_id);

ALTER TABLE cinema_graphics ADD CONSTRAINT cinema_graphics_cinema_fk FOREIGN KEY (cinema_cinema_id) REFERENCES cinema (cinema_id);

ALTER TABLE cinema_graphics ADD CONSTRAINT cinema_graphics_graphics_fk FOREIGN KEY (graphics_graphics_id) REFERENCES graphics (graphics_id);

END;