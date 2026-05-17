const express = require('express');
const router = express.Router();
const { generateStudentSynthesis } = require('../controllers/aiController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/synthesis/:student_id', authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), generateStudentSynthesis);

module.exports = router;
