const express = require('express');
const router = express.Router();
const { getAbsencesByStudent, getAllAbsences, createAbsence, updateAbsence, deleteAbsence } = require('../controllers/absenceController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/student/:student_id', getAbsencesByStudent);
router.get('/', authorizeRoles('ADMIN', 'TEACHER'), getAllAbsences);
router.post('/', authorizeRoles('ADMIN', 'TEACHER'), createAbsence);
router.put('/:id', authorizeRoles('ADMIN', 'TEACHER'), updateAbsence);
router.delete('/:id', authorizeRoles('ADMIN', 'TEACHER'), deleteAbsence);

module.exports = router;
