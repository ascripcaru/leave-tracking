import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';
import { getMe, withAuth } from '../auth-middleware';

const router = express.Router();

router.route('/login')
    .post(validate(paramValidation.login), authCtrl.login);

router.route('/recover')
    .post(authCtrl.recover);

router.route('/reset')
    .post(authCtrl.reset);

router.route('/me')
    .get(withAuth, getMe);

export default router;
