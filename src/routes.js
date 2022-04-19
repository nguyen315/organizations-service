import { Router } from 'express';
import organizationsRoute from './modules/organization/organization.route';

const router = Router();

router.use('/', organizationsRoute);

export default router;
