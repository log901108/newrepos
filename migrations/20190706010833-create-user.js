'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
	  login_fail_count: {
		  type: Sequelize.INTEGER, 
		  default: 0},
	is_account_lock: {
		  type: Sequelize.BOOLEAN,
		  default: false,
	},
	latest_login_date: Sequelize.DATE,
	try_login_date: Sequelize.DATE,
	is_admin: {
			type: Sequelize.BOOLEAN,
			default: false,
			  },
	signin_ip: Sequelize.STRING(15),
	refresh_token: Sequelize.STRING(255),
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};