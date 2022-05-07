import { isNil, pick } from 'lodash';
import { StatusCodes } from 'http-status-codes';
import db from 'src/models';
import { ADMIN_PERMISSION, MEMBER_PERMISSION, ORG_STATUS } from 'src/shared/constant';
import debug from 'src/utils/debug';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import * as mailService from 'src/utils/mailer';

const NAMESPACE = 'ORG-SERVICE';

export const getMembersByOrgId = async (orgId) => {
  const users = await db.User.findAll({
    where: {
      orgId
    },
    attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'phone', 'status'],
    raw: true
  });
  const result = await Promise.all(
    users.map(async (user) => {
      const roles = await getRolesOfMember(user.id);
      return { ...user, role: roles };
    })
  );
  return result;
};

export const getRolesOfMember = (userId) => {
  return db.Role.findAll({
    include: [
      {
        model: db.RoleUser,
        attributes: [],
        where: {
          userId
        }
      }
    ],
    raw: true
  });
};

export const removeMember = async (res, orgId, userId) => {};

export const getOrgById = async (orgId) => {
  const org = await db.Organization.findByPk(orgId, { raw: true });
  const members = await getMembersByOrgId(orgId);
  const roles = await getRolesByOrgId(orgId);

  org.members = members || [];
  org.roles = roles || [];

  return org;
};

export const getRolesByOrgId = async (orgId) => {
  const roles = await db.Role.findAll({
    where: { orgId },
    include: [
      {
        model: db.RoleUser,
        attributes: ['userId']
      }
    ],
    raw: true
  });

  const roleWithAssignedMember = roles.reduce((prev, role) => {
    if (isNil(prev[role.id])) {
      prev[role.id] = pick(role, ['id', 'orgId', 'name', 'status', 'permissions', 'predefine']);
      prev[role.id].assigned = [];
    }
    prev[role.id].assigned.push(role['RoleUsers.userId']);
    return prev;
  }, {});

  return Object.values(roleWithAssignedMember);
};

export const getUserPermission = async (memberId, orgId) => {
  const result = await db.RoleUser.findAll({
    where: {
      userId: memberId
    },
    include: [
      {
        model: db.Role,
        attributes: ['permissions'],
        where: {
          orgId
        }
      }
    ],
    raw: true
  });

  const userPerrmissions = result.reduce((res, role) => {
    const permissions = role.permissions;
    Object.keys(permissions).forEach((permission) => {
      if (isNil(res[permission])) {
        res[permission] = permissions[permission];
      } else {
        if (permissions[permission] && !res[permission]) {
          res[permission] = permissions[permission];
        }
      }
    });
  }, {});

  return userPerrmissions;
};

export const checkPermission = async (memberId, orgId, permissions) => {
  const userPermissions = await getUserPermission(memberId, orgId);
  return permissions.every((permission) => userPermissions[permission]);
};

export const createMemberRole = (orgId) => ({
  orgId,
  name: 'MEMBER',
  status: ORG_STATUS.ENABLE,
  permissions: MEMBER_PERMISSION,
  predefine: true
});

export const createAdminRole = (orgId) => ({
  orgId,
  name: 'ADMIN',
  status: ORG_STATUS.ENABLE,
  permissions: ADMIN_PERMISSION,
  predefine: true
});

export const createNewOrg = async (user) => {
  try {
    await db.sequelize.transaction(async (t) => {
      const result = await db.Organization.create(
        {
          name: `${user.username}'s organization`,
          status: ORG_STATUS.ENABLE,
          userId: user.id
        },
        { transaction: t }
      );
      const org = result.get({ plain: true });

      await db.User.update({ orgId: org.id }, { where: { id: user.id }, transaction: t });
      await createPredefineRole(org.id, user.id, t);

      return null;
    });
  } catch (error) {
    // If the execution reaches this line, an error occurred.
    // The transaction has already been rolled back automatically by Sequelize!
    debug.log(NAMESPACE, error);
    throw new Error(error.message);
  }
};

const createPredefineRole = async (orgId, userId, transaction) => {
  const result = await db.Role.create({ ...createAdminRole(orgId) }, { transaction });
  const admin = result.get({ plain: true });
  await db.RoleUser.create({ userId, roleId: admin.id }, { transaction });
  await db.Role.create({ ...createMemberRole(orgId) }, { transaction });
};

export const getMembersByRole = (roleId) => {
  return db.RoleUser.findAll({ where: { roleId }, raw: true });
};

export const assignRoleToMember = (roleId, userId) => {
  return db.RoleUser.findOrCreate({
    where: { roleId, userId },
    defaults: {
      roleId,
      userId
    }
  });
};

export const unassignRoleFromMember = (roleId, userId) => {
  return db.RoleUser.destroy({ where: { roleId, userId } });
};

export const assignRoleToMembers = (roleId, userIds) => {
  return db.RoleUser.bulkCreate(userIds.map((userId) => ({ userId, roleId })));
};

export const inviteUser = async (email, orgId, res) => {
  const org = await getOrgById(orgId);
  const invitingUser = await db.User.findOne({ where: { email } });

  if (!invitingUser) {
    // Invite an user not exist in system
    const token = jwt.sign({ email: email, orgId }, process.env.INVITE_SECRET);
    const url = `${process.env.FRONTEND_URL}/dashboard/verify?token=${token}`;
    const emailHtmlTemplate = mailService.generateInviteTemplate(url, org);

    debug.log(NAMESPACE, `Invite a user not exist to org ${orgId}`);
    mailService.sendMailWithHtml('Omini Channel Invite To Organization', email, emailHtmlTemplate);
    return res.status(StatusCodes.OK).send({ message: 'Invite user success.' });
  }

  // Invite an user already exist
  const isUserExistInOrg = await db.User.count({
    where: {
      id: invitingUser.id,
      orgId: { [Op.ne]: null }
    }
  });
  if (isUserExistInOrg) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: 'User is already in an organization.' });
  }

  // Invite user to org
  const token = jwt.sign({ email: email, orgId: orgId }, process.env.INVITE_SECRET);
  const url = `${process.env.FRONTEND_URL}/dashboard/verify?token=${token}`;
  const emailHtmlTemplate = mailService.generateInviteTemplate(url, org);

  debug.log(NAMESPACE, `Invite a user id: ${invitingUser.id} to org ${orgId}`);
  mailService.sendMailWithHtml('Omini Channel Invite To Organization', email, emailHtmlTemplate);
  return res.status(StatusCodes.OK).send({ message: 'Invite user success.' });
};

export const verifyUser = async (loggedUser, token, res) => {
  let userEmail, orgId;
  try {
    const obj = jwt.verify(token, process.env.INVITE_SECRET);
    userEmail = obj.email;
    orgId = obj.orgId;
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid token.' });
  }

  if (!userEmail || !orgId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid token.' });
  }

  const invitingUser = await db.User.findOne({
    where: {
      email: userEmail
    }
  });

  if (loggedUser.id !== invitingUser.id) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Different user.' });
  }

  // check if user in another org
  const isUserExistInOrg = await checkIfUserInOrg(invitingUser.id);
  if (isUserExistInOrg) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'User is already in an organization.' });
  }

  await db.User.update({ orgId }, { where: { email: userEmail } });

  // assign role MEMBER to user
  const roleMember = await db.Role.findOne({
    orgId,
    name: 'MEMBER',
    status: ORG_STATUS.ENABLE
  });
  if (roleMember) {
    await assignRoleToMember(roleMember.id, invitingUser.id);
  }

  return res.status(StatusCodes.OK).send({ message: 'Joining organization success.' });
};

// ***** Private ***** //
const checkIfUserInOrg = async (userId) => {
  const isUserExistInOrg = await db.User.count({
    where: {
      id: userId,
      orgId: { [Op.ne]: null }
    }
  });
  return !!isUserExistInOrg;
};
