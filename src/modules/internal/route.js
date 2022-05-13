import { Router } from 'express'
import * as orgCtrl from './controller'

const router = Router()

router.get('/:orgId/org-owner', orgCtrl.getOrgOwner)

export default router
