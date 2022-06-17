import { StatusCodes } from 'http-status-codes'
import { ORG_STATUS } from 'src/shared/constant'
import { MESSAGE } from 'src/shared/message'
import { getOrgById } from './organization.service'

const checkPermission = (role) => async (req, res, next) => {
  try {
    const user = req.body.user
    const isPermissionValid = user.role === role
    if (isPermissionValid) {
      return next()
    }
    return res.status(StatusCodes.FORBIDDEN).send(MESSAGE.PERMISSION_ERROR)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return res.status(StatusCodes.FORBIDDEN).send(MESSAGE.PERMISSION_ERROR)
  }
}

export const checkOrgEnable = async (req, res, next) => {
  const orgId = req.params.orgId
  if (!orgId) {
    return res.status(StatusCodes.FORBIDDEN).send(MESSAGE.PERMISSION_ERROR)
  }

  const org = await getOrgById(orgId)
  if (org.status !== ORG_STATUS.ENABLE) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: 'Your organization has been disabled!' })
  }
  req.body.org = org
  return next()
}

export default checkPermission
