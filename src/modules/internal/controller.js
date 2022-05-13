import { StatusCodes } from 'http-status-codes'
import debug from 'src/utils/debug'
import * as orgService from '../organization/organization.service'

const NAMESPACE = 'ORG-CTRL'

export const getOrgOwner = async (req, res) => {
  try {
    const { orgId } = req.params
    const orgOwner = await orgService.getOrgOwner(orgId)
    res.json(orgOwner)
  } catch (err) {
    debug.log(NAMESPACE, 'Error while getting users of org ' + orgId, err)
    return res.status(StatusCodes.BAD_REQUEST).json(err)
  }
}
