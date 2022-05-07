'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Roles', 'predefine', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }),
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Roles', 'predefine'),
    ])
  },
}
