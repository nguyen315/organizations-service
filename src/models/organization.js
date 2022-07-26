import { hashPassword, checkPassword } from '../utils/crypto';

export default (sequelize, DataTypes) => {
  const schema = {
    name: {
      unique: true,
      allowNull: false,
      type: DataTypes.STRING
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
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
