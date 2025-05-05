const Category = require('../models/Category');
const Task = require('../models/Task');

// Get all categories for the current user
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ user: req.userId }).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name, color } = req.body;

        // Check if category with same name exists for this user
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            user: req.userId
        });

        if (existingCategory) {
            return res.status(400).json({ message: 'Category with this name already exists' });
        }

        // Create new category
        const category = new Category({
            name,
            color: color || '#3498db',
            user: req.userId
        });

        await category.save();

        // Emit socket event for real-time updates
        req.io.emit('categoryCreated', category);

        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const { name, color } = req.body;

        // Find category by ID and user ID
        const category = await Category.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if another category with the same name exists
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                user: req.userId,
                _id: { $ne: category._id }
            });

            if (existingCategory) {
                return res.status(400).json({ message: 'Category with this name already exists' });
            }
        }

        // Update category fields
        if (name) category.name = name;
        if (color) category.color = color;

        await category.save();

        // Emit socket event for real-time updates
        req.io.emit('categoryUpdated', category);

        res.json(category);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        // Find category by ID and user ID
        const category = await Category.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Find all tasks with this category and update them
        await Task.updateMany(
            { category: category._id },
            { $set: { category: null } }
        );

        await category.deleteOne();

        // Emit socket event for real-time updates
        req.io.emit('categoryDeleted', req.params.id);

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};