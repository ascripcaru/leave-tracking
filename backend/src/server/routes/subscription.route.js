import express from 'express';
import expressAuth from '../helpers/expressAuth';
import { saveSubscription } from '../controllers/subscribe.controller';

const router = express.Router();
const { authorize } = expressAuth;

router.use(authorize());

router.route('/')
    .post(saveSubscription)
    .put(saveSubscription);

export default router;
