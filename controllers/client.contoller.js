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
          client.agrement.client_agreement_processing,
          client.agrement.client_agreement_newsletter,
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
        res.status(400).json({message: 'Клиент с такими данными уже проходил регистрацию. Воспользуйтесь формой входа или восстановления пароля.' });
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
        res.status(404).json({success: 'Клиент не найден. Перепроверьте введенный адрес или воспользуйтесь другим способом.'});
      }
    }catch(error) {
     res.status(500).json({ success: false, error: error.message });
    }
  }

  async checkClientPhone(req, res) {
    const client = req.body;
   
    try{
      const search_phone = await db.query(`select client_phone from client
      where client_phone = $1;`, [client.phone.toLowerCase()]);
   
      if(search_phone.rows.length > 0) {
        res.status(202).json({message: 'Инструкции будут высланы на предоставленный номер телефона.'});
      } else {
        res.status(404).json({success: 'Клиент не найден. Перепроверьте введенный номер или воспользуйтесь другим способом.'});
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
        res.status(404).json({success: 'Клиент не найден. Перепроверьте введенный адрес или воспользуйтесь другим способом.'});
      }
    }catch(error) {
     res.status(500).json({ success: false, error: error.message });
    }
  }
};

export const actionClient = new Client();