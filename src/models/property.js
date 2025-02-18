const pool = require('../config/database');

class Property {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM properties');
    return rows;
  }

  static async create(hostId, propertyData) {
    const { title, description, price_per_night, location } = propertyData;
    const [result] = await pool.query(
      'INSERT INTO properties (host_id, title, description, price_per_night, location) VALUES (?, ?, ?, ?, ?)',
      [hostId, title, description, price_per_night, location]
    );
    return this.getById(result.insertId);
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM properties WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, hostId, propertyData) {
    const { title, description, price_per_night, location } = propertyData;
    await pool.query(
      'UPDATE properties SET title = ?, description = ?, price_per_night = ?, location = ? WHERE id = ? AND host_id = ?',
      [title, description, price_per_night, location, id, hostId]
    );
    return this.getById(id);
  }

  static async delete(id, hostId) {
    const [result] = await pool.query(
      'DELETE FROM properties WHERE id = ? AND host_id = ?',
      [id, hostId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Property;