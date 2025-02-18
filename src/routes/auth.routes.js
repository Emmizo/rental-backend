const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *         google_id:
 *           type: string
 *           description: Google ID
 *         email:
 *           type: string
 *           description: User email
 *         name:
 *           type: string
 *           description: User name
 *         role:
 *           type: string
 *           enum: [renter, host]
 *           description: User role
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *   securitySchemes:
 *     googleAuth:
 *       type: oauth2
 *       flows:
 *         implicit:
 *           authorizationUrl: /auth/google
 *           scopes:
 *             profile: Access profile information
 *             email: Access email address
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth2 login
 *     tags: [Authentication]
 *     description: Redirects the user to Google's authentication page
 *     responses:
 *       302:
 *         description: Redirects to Google login
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: Google OAuth2 login URL
 */
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth2 callback endpoint
 *     tags: [Authentication]
 *     description: Handles the callback from Google after successful authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       302:
 *         description: Redirects to home page after successful login
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: Frontend URL
 *       401:
 *         description: Authentication failed
 */
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    successRedirect: '/'
  })
);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - googleAuth: []
 *     description: Logs out the currently authenticated user
 *     responses:
 *       302:
 *         description: Redirects to home page after logout
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: Frontend URL
 */
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - googleAuth: []
 *     description: Returns the current authenticated user's information
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

/**
 * @swagger
 * /auth/role:
 *   put:
 *     summary: Update user role
 *     tags: [Authentication]
 *     security:
 *       - googleAuth: []
 *     description: Updates the role of the authenticated user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [renter, host]
 *                 description: The new role for the user
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Not authenticated
 */
router.put('/role', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { role } = req.body;
  if (!['renter', 'host'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const updatedUser = await User.updateRole(req.user.id, role);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;