const { google } = require('googleapis');
const Task = require('../models/Task');

// Get OAuth2 client
const getOAuth2Client = (tokens) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(tokens);
    return oauth2Client;
};

// Connect to Google Calendar
exports.connectGoogleCalendar = async (req, res) => {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // Generate auth URL
        const scopes = ['https://www.googleapis.com/auth/calendar'];
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent', // To ensure we get a refresh token
            state: req.userId.toString() // Pass user ID as state
        });

        res.json({ authUrl });
    } catch (error) {
        console.error('Google Calendar connect error:', error);
        res.status(500).json({ message: 'Failed to connect to Google Calendar' });
    }
};

// Handle OAuth callback
exports.handleOAuthCallback = async (req, res) => {
    try {
        const { code, state } = req.query;

        // Verify state matches the user ID
        if (state !== req.userId.toString()) {
            return res.status(401).json({ message: 'Invalid state parameter' });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        // Save tokens to user (would need to extend User model)
        // For now, just return success

        res.json({ message: 'Successfully connected to Google Calendar' });
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.status(500).json({ message: 'Failed to authorize Google Calendar' });
    }
};

// Sync tasks with Google Calendar
exports.syncWithGoogleCalendar = async (req, res) => {
    try {
        // This would fetch tokens from user's account
        // For demo, we'll just return a message
        res.json({ message: 'Sync with Google Calendar would happen here' });
    } catch (error) {
        console.error('Google Calendar sync error:', error);
        res.status(500).json({ message: 'Failed to sync with Google Calendar' });
    }
};

// Helper function to create Google Calendar event
exports.createCalendarEvent = async (req, res) => {
    try {
        const { taskId } = req.params;

        // Find task by ID and user ID
        const task = await Task.findOne({
            _id: taskId,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (!task.dueDate) {
            return res.status(400).json({ message: 'Task does not have a due date' });
        }

        // For demo, we'll just return a success message
        // In a real implementation, we would:
        // 1. Get OAuth2 client with user's tokens
        // 2. Create the event in Google Calendar
        // 3. Save the event ID to the task

        task.googleCalendarEventId = 'placeholder-event-id';
        await task.save();

        res.json({ message: 'Task added to Google Calendar', eventId: task.googleCalendarEventId });
    } catch (error) {
        console.error('Create calendar event error:', error);
        res.status(500).json({ message: 'Failed to create calendar event' });
    }
};

// Helper function to remove Google Calendar event
exports.removeCalendarEvent = async (req, res) => {
    try {
        const { taskId } = req.params;

        // Find task by ID and user ID
        const task = await Task.findOne({
            _id: taskId,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (!task.googleCalendarEventId) {
            return res.status(400).json({ message: 'Task is not linked to Google Calendar' });
        }

        // For demo, we'll just return a success message
        // In a real implementation, we would:
        // 1. Get OAuth2 client with user's tokens
        // 2. Delete the event from Google Calendar
        // 3. Remove the event ID from the task

        task.googleCalendarEventId = null;
        await task.save();

        res.json({ message: 'Task removed from Google Calendar' });
    } catch (error) {
        console.error('Remove calendar event error:', error);
        res.status(500).json({ message: 'Failed to remove calendar event' });
    }
};