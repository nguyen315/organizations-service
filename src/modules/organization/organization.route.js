import { Router } from 'express';
import * as orgCtrl from './organization.controller';

const router = Router();

router.get('/:orgId', orgCtrl.getMembersByOrgId);

export default router;
