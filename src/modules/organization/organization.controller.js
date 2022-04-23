import { MESSAGE } from 'src/shared/message';
import { StatusCodes } from 'http-status-codes';
import debug from 'src/utils/debug';
import db from 'src/models';
import * as orgService from './organization.service';
import { isNumber } from 'lodash';

const NAMESPACE = 'ORG-CTRL';

export const getMembersByOrgId = async (req, res) => {
  const { orgId } = req.params;

  const users = await orgService.getMembersByOrgId(orgId).catch((err) => {
    debug.log(NAMESPACE, 'Error while getting users of org ' + orgId, err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  res.json({ users });
};

export const removeMember = async (req, res) => {
  const user = req.body;
  const { orgId, memberId } = req.params;

  // TODO: Check user permission before action

  // Prevent remove org owner
  if (user.id === memberId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Can not remove org owner' });
  }

  // Check if user exist in org
  try {
    const removingUser = await db.User.findByPk(memberId);
    if (removingUser.orgId !== orgId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User not exist in org' });
    }

    await db.User.update({ orgId: null }, { where: { id: memberId } });
  } catch (err) {
    debug.log(NAMESPACE, 'Error while remove member', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return res
    .status(StatusCodes.OK)
    .json({ message: `Remove user ${removingUser.firstName} ${removingUser.lastName} success.` });
};

export const updateRoleForMember = async (req, res) => {
  const { orgId, memberId } = req.params;
  const { user, roleId } = req.body;

  // TODO: Check user permission before action

  // check if user role already exist
  try {
    const countRoleUser = await db.RoleUser.count({ where: { userId: memberId, roleId } });
    if (countRoleUser === 0)
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User role already exist' });

    await db.RoleUser.create({ userId: memberId, roleId });
  } catch (err) {
    debug.log(NAMESPACE, 'Error while update user role', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return res.status(StatusCodes.OK).json({ message: `Update user role success` });
};

export const createOrUpdateRole = async (req, res) => {
  const { orgId } = req.params;
  const {
    user,
    role: { _id, name: roleName, permissions }
  } = req.body;

  // TODO: Check user permission before action

  // Check if _id is temp id to determine create or update role
  if (isNumber(_id)) {
    // Update role
    try {
      await db.Role.update({ name: roleName, permissions, orgId }, { where: { id: _id } });
    } catch (err) {
      debug.log(NAMESPACE, 'Error while update role', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
    return res.status(StatusCodes.CREATED).json({ message: `Update role ${roleName} success` });
  }

  // Create role
  try {
    await db.Role.create({ name: roleName, permissions, orgId });
  } catch (err) {
    debug.log(NAMESPACE, 'Error while create role', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  }
  return res.status(StatusCodes.CREATED).json({ message: `Create role ${roleName} success` });
};
