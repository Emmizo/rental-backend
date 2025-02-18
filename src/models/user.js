const pool = require('../config/database');

class User {
  static async findByGoogleId(googleId) {
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(userData) {
    const { google_id, email, name } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (google_id, email, name) VALUES (?, ?, ?)',
      [google_id, email, name]
    );
    return this.findById(result.insertId);
  }

  static async updateRole(id, role) {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return this.findById(id);
  }
}

module.exports = User;