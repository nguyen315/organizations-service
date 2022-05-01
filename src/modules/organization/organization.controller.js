import { StatusCodes } from 'http-status-codes';
import debug from 'src/utils/debug';
import db from 'src/models';
import * as orgService from './organization.service';
import * as mailService from 'src/utils/mailer';
import { isNumber } from 'lodash';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

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

export const getRolesByOrgId = async (req, res) => {
  const { orgId } = req.params;

  const roles = await db.Role.findAll({
    where: { orgId },
    raw: true
  }).catch((err) => {
    debug.log(NAMESPACE, 'Error while get roles by org id', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  return res.status(StatusCodes.OK).json({ roles });
};

export const getOrgById = async (req, res) => {
  const { orgId } = req.params;

  const org = await db.Organization.findByPk(orgId, { raw: true }).catch((err) => {
    debug.log(NAMESPACE, 'Error while get org by org id', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  });
  return res.status(StatusCodes.OK).json({ org });
};

export const deleteRole = async (req, res) => {
  const { orgId, roleId } = req.params;

  // TODO: Check roles user before start action

  await db.Role.destroy({ where: { orgId, id: roleId } }).catch((err) => {
    debug.log(NAMESPACE, 'Error while delete role', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  });
  return res.status(StatusCodes.OK);
};

export const getOrByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await db.User.findByPk(userId, { raw: true });
    const orgOfUser = await db.Organization.findByPk(user.orgId, { raw: true });
    return res.status(StatusCodes.OK).json({ org: orgOfUser });
  } catch (err) {
    debug.log(NAMESPACE, err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const inviteUser = async (req, res) => {
  const { user, org, email: userEmail } = req.body;
  // TODO: invite user with role

  if (!org) {
    res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Organization does not exist' });
  }

  const invitingUser = await db.User.findOne({
    where: {
      email: userEmail
    }
  });

  if (!invitingUser) {
    // Invite an user not exist in system
    const token = jwt.sign({ email: userEmail, orgId: org.id }, process.env.INVITE_SECRET);
    const url = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    const emailHtmlTemplate = mailService.generateInviteTemplate(url, org);
    mailService.sendMailWithHtml(
      'Omini Channel Invite To Organization',
      userEmail,
      emailHtmlTemplate
    );
    return res.status(StatusCodes.OK).send({ message: 'Invite user success.' });
  }

  // Invite an user already exist
  const isUserExistInOrg = await db.User.count({
    where: {
      id: invitingUser.id,
      orgId: org.id
    }
  });
  if (isUserExistInOrg) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .send({ message: 'User is already in organization.' });
  }

  // Check if user in another org
  const isUserInAnotherOrg = await db.User.count({
    where: {
      id: invitingUser.id,
      orgId: {
        [Op.ne]: org.id
      }
    }
  });
  if (isUserInAnotherOrg) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .send({ message: 'User is already in another org.' });
  }

  // Invite user to org
  const token = jwt.sign({ email: userEmail, orgId: org.id }, process.env.INVITE_SECRET);
  const url = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  const emailHtmlTemplate = mailService.generateInviteTemplate(url, org);
  mailService.sendMailWithHtml(
    'Omini Channel Invite To Organization',
    userEmail,
    emailHtmlTemplate
  );
  return res.status(StatusCodes.OK).send({ message: 'Invite user success.' });
};

export const verifyUser = async (req, res) => {
  const { token } = req.body;
  const { email, orgId } = jwt.verify(token, process.env.INVITE_SECRET);
};
