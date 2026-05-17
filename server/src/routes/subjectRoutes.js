const express = require('express');
const router = express.Router();
const { getAllSubjects, getTeacherSubjects, createSubject, deleteSubject } = require('../controllers/subjectController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', getAllSubjects); // Accessible by all authenticated users
router.get('/teacher/:teacher_id', authorizeRoles('ADMIN', 'TEACHER'), getTeacherSubjects);
router.post('/', authorizeRoles('ADMIN'), createSubject);
router.delete('/:id', authorizeRoles('ADMIN'), deleteSubject);

module.exports = router;
