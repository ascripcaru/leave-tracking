import express from 'express';
import userRoutes from './user.route';
import leaveRoutes from './leave-request.route';
import authRoutes from './auth.route';
import projectRoutes from './project.route';
import projectRoleRoutes from './project-role.route';
import reportsRoutes from './reports.route';
import holidayRoutes from './holiday.route';
import filesRoutes from './files.route';

const router = express.Router();

router.get('/health-check', (req, res) => res.send('OK'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/leaves', leaveRoutes);
router.use('/projects', projectRoutes);
router.use('/project-roles', projectRoleRoutes);
router.use('/reports', reportsRoutes);
router.use('/holidays', holidayRoutes);
router.use('/files', filesRoutes);

export default router;
