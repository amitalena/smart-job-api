const express = require('express');
const router = express.Router();
const jobCateControle = require('../controllers/JobCategoryController');

router.get('/jd1/job-categories', jobCateControle.getJobByCategory);
router.post('/jd1/job-categories', jobCateControle.postJobByCategories);

module.exports = router;