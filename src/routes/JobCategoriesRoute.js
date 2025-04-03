const express = require('express');
const router = express.Router();
const { createJobCategory, getJobCategories, updateJobCategory, deleteJobCategory, searchJobCategory, } = require('../controllers/JobCategoryController');

// Routes
router.post('/categories/create', createJobCategory);
router.get('/categories/get-all-categories', getJobCategories);
router.put('/categories/:id', updateJobCategory);
router.get('/categories/search', searchJobCategory);
router.delete('/categories/:id', deleteJobCategory);

module.exports = router;