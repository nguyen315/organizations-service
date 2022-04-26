import db from 'src/models';

export const getMembersByOrgId = async (orgId) => {
  const users = await db.User.findAll({
    where: {
      orgId
    },
    attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'phone', 'status', 'role'],
    raw: true
  });

  return users;
};

export const removeMember = async (res, orgId, userId) => {
  
}