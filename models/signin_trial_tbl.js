'use strict';
module.exports = (sequelize, DataTypes) => {
  const signin_trial_tbl = sequelize.define('signin_trial_tbl', {
    requested_username: {
        type: DataTypes.STRING(50),
		allowNull:false,
      },
	  requested_password:{
		  type: DataTypes.STRING(50),
		  allowNull:false,
	  },
	  trial_time:{
		  type: DataTypes.DATE,
		  allowNull:false,
	  },
	  trial_ip:{
		  type: DataTypes.STRING(15)
	  }
  	}, {
	  	tableName: 'signin_trial_tbl',
		freezeTableName: true,
    	underscored: true,
    	timestamps: false
  });
  signin_trial_tbl.associate = function(models) {
    // associations can be defined here
  };
  return signin_trial_tbl;
};