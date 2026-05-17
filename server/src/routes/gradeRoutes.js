const express = require('express');
const router = express.Router();
const { getGradesByStudent, getGradesBySubject, createGrade, updateGrade, deleteGrade, getAllGrades } = require('../controllers/gradeController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN'), getAllGrades);
router.get('/student/:student_id', getGradesByStudent);
router.get('/subject/:subject_id', authorizeRoles('ADMIN', 'TEACHER'), getGradesBySubject);
router.post('/', authorizeRoles('ADMIN', 'TEACHER'), createGrade);
router.put('/:id', authorizeRoles('ADMIN', 'TEACHER'), updateGrade);
router.delete('/:id', authorizeRoles('ADMIN', 'TEACHER'), deleteGrade);

module.exports = router;
