import { StatusCodes } from "http-status-codes";
import { isNumber } from "lodash";
import db from "src/models";
import { ORG_STATUS } from "src/shared/constant";
import debug from "src/utils/debug";
import * as orgService from "./organization.service";

const NAMESPACE = "ORG-CTRL";

export const getMembersByOrgId = async (req, res) => {
  try {
    const { orgId } = req.params;

    const users = await orgService.getMembersByOrgId(orgId);

    res.json(users);
  } catch (err) {
    debug.log(NAMESPACE, "Error while getting users of org " + orgId, err);
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};

export const createNewOrg = async (req, res) => {
  try {
    const { user } = req.body;

    await orgService.createNewOrg(user);
    return res.status(StatusCodes.OK).send("OK");
  } catch (err) {
    debug.log(NAMESPACE, err);
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};

export const removeMember = async (req, res) => {
  const user = req.body;
  const { orgId, memberId } = req.params;

  // TODO: Check user permission before action

  // Prevent remove org owner
  if (user.id === memberId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Can not remove org owner" });
  }

  // Check if user exist in org
  try {
    const removingUser = await db.User.findByPk(memberId, { raw: true });
    if (+removingUser.orgId !== +orgId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User not exist in org" });
    }

    await db.User.update({ orgId: null }, { where: { id: memberId } });
    return res.status(StatusCodes.OK).json({
      message: `Remove user ${removingUser.firstName} ${removingUser.lastName} successfully.`,
    });
  } catch (err) {
    debug.log(NAMESPACE, "Error while remove member", err);
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};

export const updateRoleForMember = async (req, res) => {
  const { orgId, memberId } = req.params;
  const { user, roleId } = req.body;

  // TODO: Check user permission before action

  // check if user role already exist
  try {
    const countRoleUser = await db.RoleUser.count({
      where: { userId: memberId, roleId },
    });
    if (countRoleUser === 0)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User role already exist" });

    await db.RoleUser.create({ userId: memberId, roleId });
  } catch (err) {
    debug.log(NAMESPACE, "Error while update user role", err);
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }

  return res
    .status(StatusCodes.OK)
    .json({ message: `Update user role success` });
};

export const createOrUpdateRole = async (req, res) => {
  const { orgId } = req.params;
  const {
    user,
    role: { id, name: roleName, permissions, assigned },
  } = req.body;

  // TODO: Check user permission before action

  // Check if _id is temp id to determine create or update role

  if (isNumber(id)) {
    // Update role
    try {
      await db.Role.update(
        { name: roleName, permissions, orgId },
        { where: { id, predefine: false } }
      );
    } catch (err) {
      console.log(err);
      debug.log(NAMESPACE, "Name of roles must be unique", err);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Name of roles must be unique" });
    }
    return res
      .status(StatusCodes.CREATED)
      .json({ message: `Update role ${roleName} successfully` });
  }

  // Create role
  try {
    const res = await db.Role.create({
      name: roleName,
      permissions,
      orgId,
      status: ORG_STATUS.ENABLE,
    });
    const newRole = res.get({ plain: true });
    await orgService.assignRoleToMembers(newRole.id, assigned);
  } catch (err) {
    debug.log(NAMESPACE, "Error while create role", err);
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }
  return res
    .status(StatusCodes.CREATED)
    .json({ message: `Create role ${roleName} success` });
};

export const getRolesByOrgId = async (req, res) => {
  try {
    const { orgId } = req.params;

    const roles = await orgService.getRolesByOrgId(orgId);

    return res.status(StatusCodes.OK).json(roles);
  } catch (err) {
    debug.log(NAMESPACE, "Error while get roles by org id", err);
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};

export const getOrgById = async (req, res) => {
  try {
    const { orgId } = req.params;

    const org = await orgService.getOrgById(orgId);
    return res.status(StatusCodes.OK).json({ org });
  } catch (err) {
    debug.log(NAMESPACE, "Error while get org by id", err);
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { orgId, roleId } = req.params;
    // TODO: Check roles user before start action
    await db.RoleUser.destroy({ where: { roleId } });
    await db.Role.destroy({ where: { orgId, id: roleId } });
    return res.status(StatusCodes.OK).send();
  } catch (err) {
    debug.log(NAMESPACE, "Error while delete role", err);
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};

export const getOrgByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await db.User.findByPk(userId, { raw: true });
    const orgOfUser = await db.Organization.findByPk(user.orgId, { raw: true });
    return res.status(StatusCodes.OK).json({ org: orgOfUser });
  } catch (err) {
    debug.log(NAMESPACE, err);
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};

export const getUserPermission = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.User.findByPk(userId, { raw: true });

    const permissions = await orgService.getUserPermission(userId, user.orgId);
    return res.status(StatusCodes.OK).json({ permissions });
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};

export const checkPermission = async (req, res) => {
  const { orgId, memberId } = req.params;

  const { permissions } = req.body;

  try {
    const isValid = await orgService.checkPermission(
      memberId,
      orgId,
      permissions
    );
    if (isValid) {
      return res.status(StatusCodes.OK).json(isValid);
    }
    return res
      .status(StatusCodes.FORBIDDEN)
      .send("You don't have permission to perform this action");
  } catch (err) {
    debug.log(NAMESPACE, err);
    return res
      .status(StatusCodes.FORBIDDEN)
      .send("You don't have permission to perform this action");
  }
};

export const assignRole = async (req, res) => {
  const { roleId, memberId } = req.params;

  try {
    await orgService.assignRoleToMember(roleId, memberId);
    return res.status(StatusCodes.OK).json("OK");
  } catch (err) {
    debug.log(NAMESPACE, err);
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};

export const unassignRole = async (req, res) => {
  const { roleId, memberId } = req.params;

  try {
    await orgService.unassignRoleFromMember(roleId, memberId);
    return res.status(StatusCodes.OK).json("OK");
  } catch (err) {
    debug.log(NAMESPACE, err);
    return res.status(StatusCodes.BAD_REQUEST).json(err);
  }
};
