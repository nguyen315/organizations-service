import { Router } from 'express'
import { ROLE } from 'src/utils/constants'
import * as orgCtrl from './organization.controller'
import checkPermission, { checkOrgEnable } from './organization.mdw'

const router = Router()

router.get('/:orgId/members', orgCtrl.getMembersByOrgId)
router.get('/:orgId/roles', orgCtrl.getRolesByOrgId)
router.delete('/:orgId/members/:memberId', checkOrgEnable, orgCtrl.removeMember)
router.patch('/:orgId/members/:memberId', checkOrgEnable, orgCtrl.updateRoleForMember)
router.patch('/:orgId/name', checkOrgEnable, orgCtrl.updateOrgName)
router.put('/:orgId/roles', checkOrgEnable, orgCtrl.createOrUpdateRole)
router.get('/:orgId', orgCtrl.getOrgById)
router.delete('/:orgId/roles/:roleId', checkOrgEnable, orgCtrl.deleteRole)
router.get('/members/:userId', orgCtrl.getOrgByUserId)
router.get('/users/:userId/permissions', orgCtrl.getUserPermission)
router.post('/:orgId/members/:memberId/check', checkOrgEnable, orgCtrl.checkPermission)
router.post('/:orgId/roles/:roleId/assign/:memberId', checkOrgEnable, orgCtrl.assignRole)
router.post('/:orgId/roles/:roleId/unassign/:memberId', checkOrgEnable, orgCtrl.unassignRole)
router.post('/verify', checkOrgEnable, orgCtrl.verifyUser)
router.post('/:orgId/invite', checkOrgEnable, orgCtrl.inviteUser)
router.post('/:orgId/disable', checkPermission(ROLE.ADMIN), orgCtrl.disableOrg)
router.post('/:orgId/enable', checkPermission(ROLE.ADMIN), orgCtrl.enableOrg)
router.post('/', checkOrgEnable, orgCtrl.createNewOrg)
router.get('/', checkPermission(ROLE.ADMIN), orgCtrl.getAll)

export default router
