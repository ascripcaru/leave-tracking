import express from 'express';
import reportsCrl from '../controllers/reports.controller';
import expressAuth from '../helpers/expressAuth';
import permit from './permission';
import { USER_TYPES } from '../helpers/constants';

const { ADMIN } = USER_TYPES;
const router = express.Router();
const { authorize } = expressAuth;

router.use(authorize());

router.route('/')
    .get(permit(ADMIN), reportsCrl.getPerYear);

export default router;
