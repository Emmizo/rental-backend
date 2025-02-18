const express = require('express');
const router = express.Router();
const { isAuthenticated, isHost } = require('../middleware/auth');
const Booking = require('../models/booking');

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - property_id
 *         - check_in_date
 *         - check_out_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         property_id:
 *           type: integer
 *           description: ID of the property being booked
 *         user_id:
 *           type: integer
 *           description: ID of the user making the booking
 *         check_in_date:
 *           type: string
 *           format: date
 *           description: Check-in date
 *         check_out_date:
 *           type: string
 *           format: date
 *           description: Check-out date
 *         status:
 *           type: string
 *           enum: [pending, confirmed, rejected, cancelled]
 *           description: Current status of the booking
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - googleAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - property_id
 *               - check_in_date
 *               - check_out_date
 *             properties:
 *               property_id:
 *                 type: integer
 *               check_in_date:
 *                 type: string
 *                 format: date
 *               check_out_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Property is already booked for these dates
 *       401:
 *         description: Unauthorized
 */
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const booking = await Booking.create(req.body.property_id, req.user.id, req.body);
    res.status(201).json(booking);
  } catch (error) {
    if (error.message === 'Property is already booked for these dates') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - googleAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, rejected, cancelled]
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Host access required
 *       404:
 *         description: Booking not found
 */
router.put('/:id/status', isAuthenticated, isHost, async (req, res) => {
  try {
    const success = await Booking.updateStatus(req.params.id, req.user.id, req.body.status);
    if (!success) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/bookings/user:
 *   get:
 *     summary: Get all bookings for the current user
 *     tags: [Bookings]
 *     security:
 *       - googleAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 */
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.getUserBookings(req.user.id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;