const express = require('express');
const router = express.Router();
const { getAllTimetables, getTimetablesByClass, getTimetablesByTeacher, createTimetable, deleteTimetable } = require('../controllers/timetableController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN'), getAllTimetables);
router.get('/class/:class_id', getTimetablesByClass);
router.get('/teacher/:teacher_id', getTimetablesByTeacher);
router.post('/', authorizeRoles('ADMIN'), createTimetable);
router.delete('/:id', authorizeRoles('ADMIN'), deleteTimetable);

module.exports = router;
