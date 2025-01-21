import db from "../db_connect.js"; // Импортируем подключение к базе данных

class ReportingSales {
  // Метод для получения отчетов по продажам
  async getSalesReporting(_, res) {
    try {
      const resultat = await db.query(`
      SELECT
      -- Суммы
      COALESCE(
          (SELECT TRUNC(SUM(transact_sum), 2)
           FROM transact
           WHERE transact_time::date = CURRENT_DATE and transact_status = true), 0
      ) AS sum_today,
  
      COALESCE(
          (SELECT TRUNC(SUM(transact_sum), 2)
           FROM transact
           WHERE transact_status = true and transact_time::date BETWEEN DATE_TRUNC('week', CURRENT_DATE) AND CURRENT_DATE), 0
      ) AS sum_week,
  
      COALESCE(
          (SELECT TRUNC(SUM(transact_sum), 2)
           FROM transact
           WHERE transact_status = true and transact_time::date BETWEEN DATE_TRUNC('month', CURRENT_DATE) AND CURRENT_DATE), 0
      ) AS sum_month,
  
      COALESCE(
          (SELECT TRUNC(SUM(transact_sum), 2)
           FROM transact
           WHERE transact_status = true and transact_time::date BETWEEN DATE_TRUNC('year', CURRENT_DATE) AND CURRENT_DATE), 0
      ) AS sum_year,
  
      -- Средние
      COALESCE(
          (SELECT TRUNC(AVG(transact_sum), 2)
           FROM transact
           WHERE transact_status = true and transact_time::date = CURRENT_DATE), 0
      ) AS avg_today,
  
      COALESCE(
          (SELECT TRUNC(AVG(transact_sum), 2)
           FROM transact
           WHERE transact_status = true and transact_time::date BETWEEN DATE_TRUNC('week', CURRENT_DATE) AND CURRENT_DATE), 0
      ) AS avg_week,
  
      COALESCE(
          (SELECT TRUNC(AVG(transact_sum), 2)
           FROM transact
           WHERE transact_status = true and transact_time::date BETWEEN DATE_TRUNC('month', CURRENT_DATE) AND CURRENT_DATE), 0
      ) AS avg_month,
  
      COALESCE(
          (SELECT TRUNC(AVG(transact_sum), 2)
           FROM transact
           WHERE transact_status = true and transact_time::date BETWEEN DATE_TRUNC('year', CURRENT_DATE) AND CURRENT_DATE), 0
      ) AS avg_year;
      `);

      // Возвращаем результат как JSON

      res.json(resultat.rows[0]);
    } catch (error) {
      // Обработка ошибок
      console.error("Ошибка при выполнении запроса:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }

  async getSalesReport(req, res) {
    try {
      const { period_start, period_end } = req.body;

      // Подготовка запроса с использованием параметров
      const query = `
      WITH months AS (
        SELECT generate_series(
            $1::date,  -- Начало периода
            $2::date,  -- Конец периода
            '1 month'::interval   -- Интервал: 1 месяц
        )::date AS month
      )
      SELECT 
          TO_CHAR(m.month, 'YYYY-MM') AS month, 
          COALESCE(SUM(t.transact_sum), 0) AS total
      FROM 
          months m
      LEFT JOIN 
          transact t ON TO_CHAR(t.transact_time::date, 'YYYY-MM') = TO_CHAR(m.month, 'YYYY-MM')
      GROUP BY 
          m.month
      ORDER BY 
          m.month;
      `;

      // Выполнение запроса с передачей параметров
      const result = await db.query(query, [req.body.perriod_start, req.body.perriod_end]);
      // Возвращаем результат
      res.json(result.rows);

    } catch (error) {
      // Обработка ошибок
      console.error("Ошибка при выполнении запроса:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }

  async getAttentionReport(_, res) {
    try {

      const query = await db.query(`
      SELECT 
      -- Для дня
      (SELECT SUM(
          (SELECT COUNT(*) 
           FROM place p 
           WHERE p.hall_hall_id IN (cs.hall_hall_id))
      ) 
      FROM cinema_session cs 
      WHERE session_date = CURRENT_DATE) AS all_place_day,
  
      (SELECT COUNT(*) 
       FROM ticket t
       JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
       WHERE session_date = CURRENT_DATE 
           AND sale_status = 'true' 
           AND transact_transact_id IS NOT NULL) AS all_ticket_day,
  
      (SELECT TO_CHAR(
          (SELECT COUNT(*) 
           FROM ticket t
           JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
           WHERE session_date = CURRENT_DATE 
             AND sale_status = 'true') /
          (SELECT SUM(
              (SELECT COUNT(*) 
               FROM place p 
               WHERE p.hall_hall_id IN (cs.hall_hall_id))
          ) 
          FROM cinema_session cs 
          WHERE session_date = CURRENT_DATE) * 100, 'FM999999990.00'
      )) AS percent_day,
  
      -- Для недели
      (SELECT SUM(
          (SELECT COUNT(*) 
           FROM place p 
           WHERE p.hall_hall_id IN (cs.hall_hall_id))
      ) 
      FROM cinema_session cs 
      WHERE session_date BETWEEN DATE_TRUNC('week', CURRENT_DATE) AND CURRENT_DATE) AS all_place_week,
  
      (SELECT COUNT(*) 
       FROM ticket t
       JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
       WHERE session_date BETWEEN DATE_TRUNC('week', CURRENT_DATE) AND CURRENT_DATE 
           AND sale_status = 'true' 
           AND transact_transact_id IS NOT NULL) AS all_ticket_week,
  
      (SELECT TO_CHAR(
          (SELECT COUNT(*) 
           FROM ticket t
           JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
           WHERE session_date BETWEEN DATE_TRUNC('week', CURRENT_DATE) AND CURRENT_DATE 
             AND sale_status = 'true') /
          (SELECT SUM(
              (SELECT COUNT(*) 
               FROM place p 
               WHERE p.hall_hall_id IN (cs.hall_hall_id))
          ) 
          FROM cinema_session cs 
          WHERE session_date BETWEEN DATE_TRUNC('week', CURRENT_DATE) AND CURRENT_DATE) * 100, 'FM999999990.00'
      )) AS percent_week,
  
      -- Для месяца
      (SELECT SUM(
          (SELECT COUNT(*) 
           FROM place p 
           WHERE p.hall_hall_id IN (cs.hall_hall_id))
      ) 
      FROM cinema_session cs 
      WHERE session_date BETWEEN DATE_TRUNC('month', CURRENT_DATE) AND CURRENT_DATE) AS all_place_month,
  
      (SELECT COUNT(*) 
       FROM ticket t
       JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
       WHERE session_date BETWEEN DATE_TRUNC('month', CURRENT_DATE) AND CURRENT_DATE 
           AND sale_status = 'true' 
           AND transact_transact_id IS NOT NULL) AS all_ticket_month,
  
      (SELECT TO_CHAR(
          (SELECT COUNT(*) 
           FROM ticket t
           JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
           WHERE session_date BETWEEN DATE_TRUNC('month', CURRENT_DATE) AND CURRENT_DATE 
             AND sale_status = 'true') /
          (SELECT SUM(
              (SELECT COUNT(*) 
               FROM place p 
               WHERE p.hall_hall_id IN (cs.hall_hall_id))
          ) 
          FROM cinema_session cs 
          WHERE session_date BETWEEN DATE_TRUNC('month', CURRENT_DATE) AND CURRENT_DATE) * 100, 'FM999999990.00'
      )) AS percent_month,
  
      -- Для года
      (SELECT SUM(
          (SELECT COUNT(*) 
           FROM place p 
           WHERE p.hall_hall_id IN (cs.hall_hall_id))
      ) 
      FROM cinema_session cs 
      WHERE session_date BETWEEN DATE_TRUNC('year', CURRENT_DATE) AND CURRENT_DATE) AS all_place_year,
  
      (SELECT COUNT(*) 
       FROM ticket t
       JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
       WHERE session_date BETWEEN DATE_TRUNC('year', CURRENT_DATE) AND CURRENT_DATE 
           AND sale_status = 'true' 
           AND transact_transact_id IS NOT NULL) AS all_ticket_year,
  
      (SELECT TO_CHAR(
          (SELECT COUNT(*) 
           FROM ticket t
           JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
           WHERE session_date BETWEEN DATE_TRUNC('year', CURRENT_DATE) AND CURRENT_DATE 
             AND sale_status = 'true') /
          (SELECT SUM(
              (SELECT COUNT(*) 
               FROM place p 
               WHERE p.hall_hall_id IN (cs.hall_hall_id))
          ) 
          FROM cinema_session cs 
          WHERE session_date BETWEEN DATE_TRUNC('year', CURRENT_DATE) AND CURRENT_DATE) * 100, 'FM999999990.00'
      )) AS percent_year;
  
      `);

      res.json(query.rows);
    } catch (error) {
      console.error("Ошибка при выполнении запроса:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }

  async getAttentionLastReport(_, res) {
    try {
      const query = await db.query(`
      SELECT 
      -- Для вчерашнего дня
      (SELECT SUM(
          (SELECT COUNT(*) 
           FROM place p 
           WHERE p.hall_hall_id IN (cs.hall_hall_id))
      ) 
      FROM cinema_session cs 
      WHERE session_date = CURRENT_DATE - INTERVAL '1 day') AS all_place_yesterday,
  
      (SELECT COUNT(*) 
       FROM ticket t
       JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
       WHERE session_date = CURRENT_DATE - INTERVAL '1 day' 
         AND sale_status = 'true' 
         AND transact_transact_id IS NOT NULL) AS all_ticket_yesterday,
  
      (SELECT TO_CHAR(
          (SELECT COUNT(*) 
           FROM ticket t
           JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
           WHERE session_date = CURRENT_DATE - INTERVAL '1 day' 
             AND sale_status = 'true')::NUMERIC /
          (SELECT SUM(
              (SELECT COUNT(*) 
               FROM place p 
               WHERE p.hall_hall_id IN (cs.hall_hall_id))
          ) 
          FROM cinema_session cs 
          WHERE session_date = CURRENT_DATE - INTERVAL '1 day') * 100, 'FM999999990.00'
      )) AS percent_yesterday,
  
      -- Для прошлой недели
      (SELECT SUM(
          (SELECT COUNT(*) 
           FROM place p 
           WHERE p.hall_hall_id IN (cs.hall_hall_id))
      ) 
      FROM cinema_session cs 
      WHERE session_date BETWEEN DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days' 
                            AND DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 day') AS all_place_last_week,
  
      (SELECT COUNT(*) 
       FROM ticket t
       JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
       WHERE session_date BETWEEN DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days' 
                            AND DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 day' 
         AND sale_status = 'true' 
         AND transact_transact_id IS NOT NULL) AS all_ticket_last_week,
  
      (SELECT TO_CHAR(
          (SELECT COUNT(*) 
           FROM ticket t
           JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
           WHERE session_date BETWEEN DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days' 
                                 AND DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 day' 
             AND sale_status = 'true')::NUMERIC /
          (SELECT SUM(
              (SELECT COUNT(*) 
               FROM place p 
               WHERE p.hall_hall_id IN (cs.hall_hall_id))
          ) 
          FROM cinema_session cs 
          WHERE session_date BETWEEN DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days' 
                                AND DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 day') * 100, 'FM999999990.00'
      )) AS percent_last_week,
  
      -- Для прошлого месяца
      (SELECT SUM(
          (SELECT COUNT(*) 
           FROM place p 
           WHERE p.hall_hall_id IN (cs.hall_hall_id))
      ) 
      FROM cinema_session cs 
      WHERE session_date BETWEEN DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' 
                            AND DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day') AS all_place_last_month,
  
      (SELECT COUNT(*) 
       FROM ticket t
       JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
       WHERE session_date BETWEEN DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' 
                            AND DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day' 
         AND sale_status = 'true' 
         AND transact_transact_id IS NOT NULL) AS all_ticket_last_month,
  
      (SELECT TO_CHAR(
          (SELECT COUNT(*) 
           FROM ticket t
           JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
           WHERE session_date BETWEEN DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' 
                                 AND DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day' 
             AND sale_status = 'true')::NUMERIC /
          (SELECT SUM(
              (SELECT COUNT(*) 
               FROM place p 
               WHERE p.hall_hall_id IN (cs.hall_hall_id))
          ) 
          FROM cinema_session cs 
          WHERE session_date BETWEEN DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' 
                                AND DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day') * 100, 'FM999999990.00'
      )) AS percent_last_month,
  
      -- Для прошлого года
      (SELECT SUM(
          (SELECT COUNT(*) 
           FROM place p 
           WHERE p.hall_hall_id IN (cs.hall_hall_id))
      ) 
      FROM cinema_session cs 
      WHERE session_date BETWEEN DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year' 
                            AND DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 day') AS all_place_last_year,
  
      (SELECT COUNT(*) 
       FROM ticket t
       JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
       WHERE session_date BETWEEN DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year' 
                            AND DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 day' 
         AND sale_status = 'true' 
         AND transact_transact_id IS NOT NULL) AS all_ticket_last_year,
  
      (SELECT TO_CHAR(
          (SELECT COUNT(*) 
           FROM ticket t
           JOIN cinema_session cs ON t.cinema_session_session_name = cs.cinema_session_name 
           WHERE session_date BETWEEN DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year' 
                                 AND DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 day' 
             AND sale_status = 'true')::NUMERIC /
          (SELECT SUM(
              (SELECT COUNT(*) 
               FROM place p 
               WHERE p.hall_hall_id IN (cs.hall_hall_id))
          ) 
          FROM cinema_session cs 
          WHERE session_date BETWEEN DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year' 
                                AND DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 day') * 100, 'FM999999990.00'
      )) AS percent_last_year;
  

    `);
      res.json(query.rows);
    } catch (e) {
      console.error("Ошибка при выполнении запроса:", e);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }

  async getAttentionMovieReport(req, res) {
    try {
      if (req.body.period === 'day') {
        const {perriod_start, perriod_end, movie_name} = req.body;
        const req_days = await db.query(`
          WITH days AS (
            SELECT generate_series(
                $1::date,  -- Начало периода
                $2::date,  -- Конец периода
                '1 day'::interval  -- Интервал: 1 день
            ) AS day
        )
        SELECT 
            d.day,  -- Дата
            TO_CHAR(
                COALESCE(
                    (SELECT COUNT(*)
                     FROM ticket t
                     JOIN cinema_session cs 
                     ON t.cinema_session_session_name = cs.cinema_session_name
                     WHERE cs.session_date = d.day 
                       AND t.sale_status = 'true'
                       AND cs.cinema_cinema_id = $3
                    ), 0
                )::NUMERIC /
                COALESCE(
                    (SELECT SUM(
                        (SELECT COUNT(*)
                         FROM place p 
                         WHERE p.hall_hall_id = cs.hall_hall_id)
                    ) 
                    FROM cinema_session cs 
                    WHERE cs.session_date = d.day 
                      AND cs.cinema_cinema_id = $3), 1
                )::NUMERIC * 100, 
                'FM999999990.00'
            ) AS percent
        FROM 
            days d
        ORDER BY 
            d.day;
        
    `, [perriod_start, perriod_end, movie_name]);
        res.status(200).json(req_days.rows);
      }
    } catch (error) {
      console.error('Error in getAttentionMovieReport:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  async getHallsReporting (_, res) {
    try {
      const resultat = await db.query(`
      SELECT
      -- Суммы аренды за текущий день
      COALESCE(
          (
              SELECT TRUNC(SUM(r.rent_price), 2)
              FROM rent r
              where application_rent_application_rent_id not in(select application_rent_application_rent_id from application_worker where application_status_application_status_id = 4)
              AND r.rent_date::date = CURRENT_DATE
          ), 
          0
      ) AS sum_today,
  
      -- Суммы аренды за текущую неделю
      COALESCE(
          (
              SELECT TRUNC(SUM(r.rent_price), 2)
              FROM rent r
        where application_rent_application_rent_id not in(select application_rent_application_rent_id from application_worker where application_status_application_status_id = 4)
              and r.rent_date::date BETWEEN DATE_TRUNC('week', CURRENT_DATE) AND CURRENT_DATE
          ), 
          0
      ) AS sum_week,
  
      -- Суммы аренды за текущий месяц
      COALESCE(
          (
              SELECT TRUNC(SUM(r.rent_price), 2)
              FROM rent r
  where application_rent_application_rent_id not in(select application_rent_application_rent_id from application_worker where application_status_application_status_id = 4)
              and r.rent_date::date BETWEEN DATE_TRUNC('month', CURRENT_DATE) AND CURRENT_DATE
          ), 
          0
      ) AS sum_month,
  
      -- Суммы аренды за текущий год
      COALESCE(
          (
              SELECT TRUNC(SUM(r.rent_price), 2)
              FROM rent r
        where application_rent_application_rent_id not in(select application_rent_application_rent_id from application_worker where application_status_application_status_id = 4)
              and r.rent_date::date BETWEEN DATE_TRUNC('year', CURRENT_DATE) AND CURRENT_DATE
          ), 
          0
      ) AS sum_year,
  
      -- Средние суммы аренды за текущий день
      COALESCE(
          (
              SELECT TRUNC(AVG(r.rent_price), 2)
              FROM rent r
  where application_rent_application_rent_id not in(select application_rent_application_rent_id from application_worker where application_status_application_status_id = 4)
              and r.rent_date::date = CURRENT_DATE
          ), 
          0
      ) AS avg_today,
  
      -- Средние суммы аренды за текущую неделю
      COALESCE(
          (
              SELECT TRUNC(AVG(r.rent_price), 2)
              FROM rent r
        where application_rent_application_rent_id not in(select application_rent_application_rent_id from application_worker where application_status_application_status_id = 4)
              and r.rent_date::date BETWEEN DATE_TRUNC('week', CURRENT_DATE) AND CURRENT_DATE
          ), 
          0
      ) AS avg_week,
  
      -- Средние суммы аренды за текущий месяц
      COALESCE(
          (
              SELECT TRUNC(AVG(r.rent_price), 2)
              FROM rent r
        where application_rent_application_rent_id not in(select application_rent_application_rent_id from application_worker where application_status_application_status_id = 4)
              and r.rent_date::date BETWEEN DATE_TRUNC('month', CURRENT_DATE) AND CURRENT_DATE
          ), 
          0
      ) AS avg_month,
  
      -- Средние суммы аренды за текущий год
      COALESCE(
          (
              SELECT TRUNC(AVG(r.rent_price), 2)
              FROM rent r
        where application_rent_application_rent_id not in(select application_rent_application_rent_id from application_worker where application_status_application_status_id = 4)
             and r.rent_date::date BETWEEN DATE_TRUNC('year', CURRENT_DATE) AND CURRENT_DATE
          ), 
          0
      ) AS avg_year;
      `);
      res.json(resultat.rows[0]);
    }catch(e) {
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }








}

export const reportingSales = new ReportingSales(); // Экспортируем экземпляр класса ReportingSales






/* SELECT
-- Суммы
COALESCE(
    (SELECT TRUNC(SUM(rent_price), 2)
     FROM rent
     WHERE rent_date::date = CURRENT_DATE), 0
) AS sum_today,

COALESCE(
    (SELECT TRUNC(SUM(rent_price), 2)
     FROM rent
     WHERE rent_date::date BETWEEN DATE_TRUNC('week', CURRENT_DATE) AND CURRENT_DATE), 0
) AS sum_week,

COALESCE(
    (SELECT TRUNC(SUM(rent_price), 2)
     FROM rent
     WHERE rent_date::date BETWEEN DATE_TRUNC('month', CURRENT_DATE) AND CURRENT_DATE), 0
) AS sum_month,

COALESCE(
    (SELECT TRUNC(SUM(rent_price), 2)
     FROM rent
     WHERE rent_date::date BETWEEN DATE_TRUNC('year', CURRENT_DATE) AND CURRENT_DATE), 0
) AS sum_year,

-- Средние
COALESCE(
    (SELECT TRUNC(AVG(rent_price), 2)
     FROM rent
     WHERE rent_date::date = CURRENT_DATE), 0
) AS avg_today,

COALESCE(
    (SELECT TRUNC(AVG(rent_price), 2)
     FROM rent
     WHERE rent_date::date BETWEEN DATE_TRUNC('week', CURRENT_DATE) AND CURRENT_DATE), 0
) AS avg_week,

COALESCE(
    (SELECT TRUNC(AVG(rent_price), 2)
     FROM rent
     WHERE rent_date::date BETWEEN DATE_TRUNC('month', CURRENT_DATE) AND CURRENT_DATE), 0
) AS avg_month,

COALESCE(
    (SELECT TRUNC(AVG(rent_price), 2)
     FROM rent
     WHERE rent_date::date BETWEEN DATE_TRUNC('year', CURRENT_DATE) AND CURRENT_DATE), 0
) AS avg_year; */