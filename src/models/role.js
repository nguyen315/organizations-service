export default (sequelize, DataTypes) => {
  const schema = {
    orgId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Organizations",
        key: "id",
      },
    },
    name: {
      unique: true,
      allowNull: false,
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    permissions: {
      type: DataTypes.JSON,
    },
    predefine: {
      type: DataTypes.BOOLEAN,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  };

  const roleModel = sequelize.define("Role", schema);

  return roleModel;
};
