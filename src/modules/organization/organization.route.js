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
router.get('/members/:userId', orgCtrl.getOrgByUserId);
router.get('/users/:userId/permissions', orgCtrl.getUserPermission);
router.post('/:orgId/members/:memberId/check', orgCtrl.checkPermission);
router.post('/:orgId/roles/:roleId/assign/:memberId', orgCtrl.assignRole);
router.post('/:orgId/roles/:roleId/unassign/:memberId', orgCtrl.unassignRole);
router.post('/verify', orgCtrl.verifyUser);
router.post('/:orgId/invite', orgCtrl.inviteUser);
router.post('/', orgCtrl.createNewOrg);

export default router;
