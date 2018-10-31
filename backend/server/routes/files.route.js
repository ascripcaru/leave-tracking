import express from 'express';
import filesCtl from '../controllers/files.controller';
import expressAuth from '../helpers/expressAuth';
import permit from './permission';

const router = express.Router();
const { authorize } = expressAuth;

router.use(authorize());

router.route('/')
    .post(permit(), filesCtl.uploadFile)

export default router;
