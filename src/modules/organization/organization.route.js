import { Router } from 'express';
import * as orgCtrl from './organization.controller';

const router = Router();

router.get('/:orgId/members', orgCtrl.getMembersByOrgId);
router.get('/:orgId/roles', orgCtrl.getRolesByOrgId);
router.delete('/:orgId/members/:memberId', orgCtrl.removeMember);
router.patch('/:orgId/members/:memberId', orgCtrl.updateRoleForMember);
router.put('/:orgId/roles', orgCtrl.createOrUpdateRole);
router.get('/:orgId', orgCtrl.getOrgById);
router.delete('/:orgId/roles/:roleId', orgCtrl.deleteRole);
router.get('/:userId', orgCtrl.getOrByUserId);

export default router;
