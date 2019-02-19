import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';
import expressAuth from '../helpers/expressAuth';

const router = express.Router();
const { authorize } = expressAuth;

router.route('/login')
    .post(validate(paramValidation.login), authCtrl.login);

router.route('/recover')
    .post(authCtrl.recover);

router.route('/reset')
    .post(authCtrl.reset);

router.route('/me')
    .get(authorize(), authCtrl.me);

export default router;
