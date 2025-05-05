const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected with auth middleware
router.use(auth);

// Get all tasks
router.get('/', taskController.getTasks);

// Get a specific task
router.get('/:id', taskController.getTaskById);

// Create a new task (with file upload support)
router.post('/', upload.array('attachments', 5), taskController.createTask);

// Update a task (with file upload support)
router.put('/:id', upload.array('attachments', 5), taskController.updateTask);

// Delete a task
router.delete('/:id', taskController.deleteTask);

// Remove attachment from task
router.delete('/:taskId/attachments/:attachmentId', taskController.removeAttachment);

module.exports = router;