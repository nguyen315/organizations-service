import { hashPassword, checkPassword } from '../utils/crypto';

export default (sequelize, DataTypes) => {
  const schema = {
    name: {
      unique: true,
      allowNull: false,
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      allow: true,
      type: DataTypes.DATE
    }
  };

  const orgModel = sequelize.define('Organization', schema, { paranoid: true });

  return orgModel;
};
