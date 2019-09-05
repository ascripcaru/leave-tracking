import express from 'express';
import reportsCrl from '../controllers/reports.controller';
import expressAuth from '../helpers/expressAuth';
import permit from './permission';
import { USER_TYPES } from '../helpers/constants';

const { ADMIN, ADVANCED_USER } = USER_TYPES;
const router = express.Router();
const { authorize } = expressAuth;

router.use(authorize());

router.route('/:year')
    .get(permit(ADMIN, ADVANCED_USER), reportsCrl.getPerYear);

router.route('/:month/:year')
    .get(permit(ADMIN, ADVANCED_USER), reportsCrl.getPerMonthAndYear);

export default router;
