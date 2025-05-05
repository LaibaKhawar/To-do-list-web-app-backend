const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const auth = require('../middleware/auth');

// All routes are protected with auth middleware
router.use(auth);

// Connect to Google Calendar
router.get('/connect', calendarController.connectGoogleCalendar);

// Handle OAuth callback
router.get('/oauth-callback', calendarController.handleOAuthCallback);

// Sync tasks with Google Calendar
router.post('/sync', calendarController.syncWithGoogleCalendar);

// Add task to Google Calendar
router.post('/task/:taskId', calendarController.createCalendarEvent);

// Remove task from Google Calendar
router.delete('/task/:taskId', calendarController.removeCalendarEvent);

module.exports = router;