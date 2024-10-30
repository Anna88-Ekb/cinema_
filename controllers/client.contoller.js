import db from "../db_connect.js";

class Client{
async addNewClient(req, res) {
  console.log(req.body);
}
};

export const actionClient = new Client();