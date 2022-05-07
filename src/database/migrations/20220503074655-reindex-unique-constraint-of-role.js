"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Roles", "Roles_name_key");
    await queryInterface.addConstraint("Roles", {
      fields: ["name", "orgId"],
      type: "unique",
      name: "unique_constraint_name",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint("Roles", {
      fields: ["name"],
      type: "unique",
      name: "Roles_name_key",
    });
    await queryInterface.removeConstraint("Roles", "unique_constraint_name");
  },
};
