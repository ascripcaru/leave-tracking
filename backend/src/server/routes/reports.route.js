import express from 'express';
import reportsCrl from '../controllers/reports.controller';
import permit from './permission';
import { withAuth } from '../auth-middleware';
import { USER_TYPES } from '../helpers/constants';

const { ADMIN } = USER_TYPES;
const router = express.Router();

router.use(withAuth);

router.route('/:year')
    .get(permit(ADMIN), reportsCrl.getPerYear);

export default router;
