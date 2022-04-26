export default (sequelize, DataTypes) => {
  const schema = {
    orgId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Organizations',
        key: 'id'
      }
    },
    name: {
      unique: true,
      allowNull: false,
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.STRING
    },
    permissions: {
      type: DataTypes.JSON
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
      type: DataTypes.DATE
    }
  };

  const roleModel = sequelize.define('Role', schema, { paranoid: true });

  return roleModel;
};
