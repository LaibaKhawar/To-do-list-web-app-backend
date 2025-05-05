const Task = require('../models/Task');
const Category = require('../models/Category');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Get all tasks
exports.getTasks = async (req, res) => {
    try {
        const { status, category, priority, search } = req.query;

        // Build query with user ID
        const query = { user: req.userId };

        // Add filters if provided
        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;

        // Add search filter if provided
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Find tasks with query and populate category
        const tasks = await Task.find(query)
            .populate('category', 'name color')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a task by ID
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.userId
        }).populate('category', 'name color');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        console.error('Get task by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const { title, description, status, dueDate, priority, categoryId } = req.body;

        // Create new task
        const task = new Task({
            title,
            description,
            status: status || 'pending',
            dueDate: dueDate || null,
            priority: priority || 'medium',
            category: categoryId || null,
            user: req.userId
        });

        // Process file attachments if present
        if (req.files && req.files.length > 0) {
            task.attachments = req.files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                path: `/uploads/${file.filename}`,
                mimetype: file.mimetype,
                size: file.size
            }));
        }

        // Add to Google Calendar if requested
        if (req.body.addToCalendar === 'true' && dueDate) {
            try {
                // Attempt to add event to Google Calendar (implementation in separate function)
                const eventId = await addToGoogleCalendar(req, task);
                if (eventId) {
                    task.googleCalendarEventId = eventId;
                }
            } catch (calendarError) {
                console.error('Google Calendar error:', calendarError);
                // Continue saving the task even if calendar integration fails
            }
        }

        await task.save();

        // Populate category for response
        await task.populate('category', 'name color');

        // Emit socket event for real-time updates
        req.io.emit('taskCreated', task);

        res.status(201).json(task);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    try {
        const { title, description, status, dueDate, priority, categoryId } = req.body;

        // Find task by ID and user ID
        let task = await Task.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update task fields
        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.status = status || task.status;
        task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
        task.priority = priority || task.priority;
        task.category = categoryId !== undefined ? categoryId : task.category;

        // Process new file attachments if present
        if (req.files && req.files.length > 0) {
            const newAttachments = req.files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                path: `/uploads/${file.filename}`,
                mimetype: file.mimetype,
                size: file.size
            }));

            // Append new attachments to existing ones
            task.attachments = task.attachments.concat(newAttachments);
        }

        // Update Google Calendar event if it exists
        if (task.googleCalendarEventId && dueDate) {
            try {
                await updateGoogleCalendarEvent(req, task);
            } catch (calendarError) {
                console.error('Google Calendar update error:', calendarError);
                // Continue updating the task even if calendar integration fails
            }
        }

        await task.save();

        // Populate category for response
        await task.populate('category', 'name color');

        // Emit socket event for real-time updates
        req.io.emit('taskUpdated', task);

        res.json(task);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        // Find task by ID and user ID
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Delete attachments from filesystem
        if (task.attachments && task.attachments.length > 0) {
            task.attachments.forEach(attachment => {
                try {
                    const filePath = path.join(__dirname, '..', 'uploads', path.basename(attachment.path));
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (error) {
                    console.error('Error deleting file:', error);
                    // Continue with task deletion even if file deletion fails
                }
            });
        }

        // Delete from Google Calendar if needed
        if (task.googleCalendarEventId) {
            try {
                await deleteGoogleCalendarEvent(req, task.googleCalendarEventId);
            } catch (calendarError) {
                console.error('Google Calendar delete error:', calendarError);
                // Continue deleting the task even if calendar integration fails
            }
        }

        await task.remove();

        // Emit socket event for real-time updates
        req.io.emit('taskDeleted', req.params.id);

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove attachment from task
exports.removeAttachment = async (req, res) => {
    try {
        const { taskId, attachmentId } = req.params;

        // Find task by ID and user ID
        const task = await Task.findOne({
            _id: taskId,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Find attachment in the task
        const attachment = task.attachments.id(attachmentId);

        if (!attachment) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        // Delete file from filesystem
        try {
            const filePath = path.join(__dirname, '..', 'uploads', path.basename(attachment.path));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            // Continue with attachment removal even if file deletion fails
        }

        // Remove attachment from task
        task.attachments.pull(attachmentId);
        await task.save();

        // Emit socket event for real-time updates
        req.io.emit('taskUpdated', task);

        res.json({ message: 'Attachment removed successfully' });
    } catch (error) {
        console.error('Remove attachment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to add task to Google Calendar
const addToGoogleCalendar = async (req, task) => {
    // This would be implemented with Google Calendar API
    // For now, return null as placeholder
    return null;
};

// Helper function to update Google Calendar event
const updateGoogleCalendarEvent = async (req, task) => {
    // This would be implemented with Google Calendar API
    // For now, just a placeholder
};

// Helper function to delete Google Calendar event
const deleteGoogleCalendarEvent = async (req, eventId) => {
    // This would be implemented with Google Calendar API
    // For now, just a placeholder
};