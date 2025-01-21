import db from "../db_connect.js";

class Client{
  async addNewClient(req, res) {
    const client = req.body;
    try {
      const insertData = await db.query(
        `INSERT INTO client(
          "client_login",
          "client_phone",
          "client_password",
          "client_email",
          "client_preference_phone",
          "client_preference_email",
          "client_agreement_processing",
          "client_agreement_newsletter",
          "client_preference_account"
        ) VALUES ($1, $2, $3, lower($4), $5, $6, $7, $8, $9) RETURNING client_id`,
        [
          client.client_login,
          client.client_phone,
          client.client_password,
          client.client_email,
          client.client_preference.client_preference_phone,
          client.client_preference.client_preference_email,
          client.agreement.client_agreement_processing,
          client.agreement.client_agreement_newsletter,
          client.client_preference.client_preference_account
        ]
      );
  
      const inserted = insertData.rows[0]?.client_id;
     
      if (inserted) {
        return res.status(201).json({ success: true });
      } else {
        throw new Error('Ошибка при добавлении клиента');
      }
  
    } catch (error) {
      if (error.message.includes('повторяющееся значение ключа') &&
          (error.message.includes('login') || error.message.includes('phone') || error.message.includes('email'))) {
        res.status(400).json({message: 'Пользователь с такими данными существует. Воспользуйтесь формой входа или восстановления пароля.' });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  async checkClientMail(req, res) {
    const client = req.body;
   
    try{
      const search_email = await db.query(`select client_email from client
      where client_email = lower($1);`, [client.email.toLowerCase()]);
   
      if(search_email.rows.length > 0) {
        res.status(202).json({message: 'Инструкции будут высланы на предоставленный адрес электронной почты.'});
      } else {
        res.status(404).json({success: 'Пользователя с такими данными не существует'});
      }
    }catch(error) {
     res.status(500).json({ success: false, error: error.message });
    }
  }

  async checkClientPhone(req, res) {
    const client = req.body;
   
    try{
      const search_phone = await db.query(`select client_phone from client
      where client_phone = $1;`, [client.phone]);
   
      if(search_phone.rows.length > 0) {
        res.status(202).json({message: 'Инструкции будут высланы на предоставленный номер телефона.'});
      } else {
        res.status(404).json({success: 'Пользователя с такими данными не существует'});
      }
    }catch(error) {
     res.status(500).json({ success: false, error: error.message });
    }
  }

  async checkClientLogin(req, res) {
    const client = req.body;
   
    try{
      const search_login = await db.query(`select client_login from client
      where client_login = $1;`, [client.login]);
   
      if(search_login.rows.length > 0) {
        res.status(202).json({message: 'Инструкции будут высланы на предоставленный адрес электронной почты.'});
      } else {
        res.status(404).json({success: 'Пользователя с такими данными не существует.'});
      }
    }catch(error) {
     res.status(500).json({ success: false, error: error.message });
    }
  }

  async checkClientPass(req, res) {
    const { pass, login } = req.body;
  
    // Проверка входных данных
    if (!pass || !login) {
      return res.status(400).json({ success: false, error: 'Логин и пароль обязательны.' });
    }
  
    try {
      const search_pass = await db.query(
        `SELECT 1 
         FROM client 
         WHERE client_login = $1 AND client_password = $2;`,
        [login, pass]
      );
  
      if (search_pass.rows.length > 0) {
        // Успешная проверка, отправляем код 200
        return res.sendStatus(200);
      } else {
        // Пользователь не найден
        return res.status(404).json({ success: false, error: 'Пользователя с такими данными не существует.' });
      }
    } catch (error) {
      console.error('Ошибка выполнения запроса:', error);
      return res.status(500).json({ success: false, error: 'Произошла ошибка при обработке запроса.' });
    }
  }
  
  
  async entranceClient(req, res) {
    try {
        const { login, password } = req.body;

        // Проверка наличия параметров
        if (!login || !password) {
            return res.status(400).json({ message: 'Логин и пароль обязательны.' });
        }

        const search_client = await db.query(
            `SELECT client_login FROM client 
             WHERE client_login = $1 AND client_password = $2;`, 
            [login, password]
        );

        if (search_client.rows.length > 0) {
            res.status(200).json({ 
                entrance: true, 
                login: search_client.rows[0].client_login 
            });
        } else {
            res.status(400).json({ 
                message: 'Неверные данные. Воспользуйтесь формой восстановления доступа.' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

async updateClient(req, res) {
  try {
    const { client_login, ...updates } = req.body; // Извлекаем client_login и остальные поля

    if (!client_login) {
      throw new Error('Поле client_login обязательно для обновления.');
    }

    const col = Object.keys(updates); // Названия колонок для обновления
    const val = Object.values(updates); // Значения колонок

    if (col.length === 0) {
      return res.status(400).json({ success: false, error: 'Нет данных для обновления.' });
    }

    // Формирование SQL-запроса
    const setClause = col.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const query = `
      UPDATE client
      SET ${setClause}
      WHERE client_login = $${col.length + 1};
    `;

    // Выполнение запроса
    await db.query(query, [...val, client_login]);

    // Ответ в случае успеха
    res.sendStatus(200);
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}


  async getPreferenceClientContacts(req, res) {
  const searched_login = req.query.login;
  const client_contacts = await db.query(`
  select
  CASE WHEN client_preference_email = true THEN client_email END as preference_email,
  CASE WHEN client_preference_phone = true THEN client_phone END as preference_phone,
  CASE WHEN client_preference_account = true THEN client_login END as preference_account
  from client
  where client_login = $1;
  `, [searched_login]);
  res.json(client_contacts.rows);
  }

  async personalKabinetClient(req, res) {
  const client_contacts = await db.query(`
  select client_phone, client_password, client_email, client_preference_phone,
  client_preference_email,  client_agreement_processing, client_agreement_newsletter
  from client
  where client_login = $1; `, [req.query.login]);
  res.json(client_contacts.rows);
  }

  async clientHistoryTickets (req, res) {
    const client_tickets = await db.query(`
    select  transact_sum, to_char(transact_time::date, 'YYYY-MM-DD') as date, to_char(transact_time::timestamp, 'HH24:MI:SS') as time,
    to_char(cs.session_date::date, 'YYYY-MM-DD') as session_date, to_char(cs.session_time, 'HH24:MI:SS') as session_time, ci.cinema_name, ci.cinema_path,
    ci.cinema_duration, h.hall_name, t.place_place_row, t.place_place_col, t.ticket_id
    from transact
    join client c on transact.client_client_id = c.client_id
    join ticket t on transact.transact_id = t.transact_transact_id
    join cinema_session cs on t.cinema_session_session_name = cs.cinema_session_name
    join cinema ci on cs.cinema_cinema_id = ci.cinema_id
    join hall h on cs.hall_hall_id = h.hall_id
    where c.client_login = $1 order by 4 desc`, [req.query.login]);
    const tickets = client_tickets.rows;
    const new_tickets = tickets.map((el) => {
      if ('cinema_duration' in el) {
       el.cinema_end = addMinutesToTime(el.session_time, el.cinema_duration);
       return el;
      }
    }); 
    res.json(tickets);
  } 


  async createArendaApp(req, res) {
    try {
      console.log(req.body);
      const { 
        app_rent_date, 
        hall_hall_id, 
        app_rent_start_time, 
        app_rent_end_time, 
        app_rent_phone, 
        app_rent_details, 
        type_client_type_client_id 
      } = req.body;
  
      // Проверка наличия всех обязательных данных
      if (
        !app_rent_date || 
        !app_rent_start_time || 
        !app_rent_end_time || 
        !app_rent_phone || 
        !type_client_type_client_id
      ) {
        return res.status(400).json({ message: 'Не хватает данных' });
      }
  
      // Вставка данных в базу
      const application_rent = await db.query(
        `
        INSERT INTO application_rent (
          app_rent_date, hall_hall_id, app_rent_start_time, 
          app_rent_end_time, app_rent_phone, app_rent_details, 
          type_client_type_client_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);
        `, 
        [
          app_rent_date, 
          hall_hall_id, 
          app_rent_start_time, 
          app_rent_end_time, 
          app_rent_phone, 
          app_rent_details, 
          type_client_type_client_id
        ]
      );
  
      // Проверка успешного добавления данных
      if (application_rent.rowCount > 0) {
        res.status(201).json({ success: true, message: 'Заявка успешно создана.' });
      } else {
        res.status(400).json({ success: false, message: 'Не удалось создать заявку.' });
      }
    } catch (error) {
      // Обработка ошибок
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  
};

export const actionClient = new Client();

function addMinutesToTime(time, minutesToAdd) {
  const [hours, minutes] = time.split(':').map(Number); 
  const totalMinutes = hours * 60 + minutes + minutesToAdd; 
  const newHours = Math.floor(totalMinutes / 60) % 24; 
  const newMinutes = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`; // Форматируем результат
}