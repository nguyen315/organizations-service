import { Router } from 'express';
import * as orgCtrl from './organization.controller';

const router = Router();

router.get('/:orgId', orgCtrl.getMembersByOrgId);
router.delete('/:orgId/members/:memberId', orgCtrl.removeMember);
router.patch('/:orgId/members/:memberId', orgCtrl.updateRoleForMember);
router.put('/:orgId/roles', orgCtrl.createOrUpdateRole);

export default router;
