const express = require('express');
const router = express.Router();
const { getAllUsers, getStudentsByClass, updateUser, deleteUser } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN'), getAllUsers);
router.get('/class/:class_id', authorizeRoles('ADMIN', 'TEACHER'), getStudentsByClass);
router.put('/:id', authorizeRoles('ADMIN'), updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), deleteUser);

module.exports = router;
