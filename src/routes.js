import { Router } from 'express';
import organizationsRoute from './modules/organization/organization.route';
import internalRouter from './modules/internal/route';

const router = Router();

router.use('/internal', internalRouter)
router.use('/', organizationsRoute);

export default router;
