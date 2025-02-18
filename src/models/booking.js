const pool = require('../config/database');

class Booking {
  static async create(propertyId, renterId, bookingData) {
    const { check_in_date, check_out_date } = bookingData;
    
    // Check for double booking
    const [existingBookings] = await pool.query(
      `SELECT * FROM bookings 
       WHERE property_id = ? 
       AND status = 'confirmed'
       AND (
         (check_in_date <= ? AND check_out_date >= ?)
         OR (check_in_date <= ? AND check_out_date >= ?)
         OR (check_in_date >= ? AND check_out_date <= ?)
       )`,
      [propertyId, check_in_date, check_in_date, check_out_date, check_out_date, check_in_date, check_out_date]
    );

    if (existingBookings.length > 0) {
      throw new Error('Property is already booked for these dates');
    }

    const [result] = await pool.query(
      'INSERT INTO bookings (property_id, renter_id, check_in_date, check_out_date) VALUES (?, ?, ?, ?)',
      [propertyId, renterId, check_in_date, check_out_date]
    );
    
    return this.getById(result.insertId);
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateStatus(id, hostId, status) {
    const [result] = await pool.query(
      `UPDATE bookings SET status = ? 
       WHERE id = ? AND property_id IN (
         SELECT id FROM properties WHERE host_id = ?
       )`,
      [status, id, hostId]
    );
    return result.affectedRows > 0;
  }

  static async getUserBookings(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM bookings WHERE renter_id = ?',
      [userId]
    );
    return rows;
  }
}

module.exports = Booking;