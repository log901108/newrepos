'use strict';

var bcrypt = require('bcrypt');
var requestIp = require('request-ip');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
	login_fail_count: {
		type: DataTypes.INTEGER, 
		default: 0
	},
	is_account_lock: {
		type: DataTypes.BOOLEAN,
		default: false,
	},
	latest_login_date: DataTypes.DATE,
	try_login_date: DataTypes.DATE,
	is_admin: {
		type: DataTypes.BOOLEAN,
		default: false,
	},
	signin_ip: DataTypes.STRING(15),
	refresh_token: DataTypes.STRING(255),
	//lock_count: DataTypes.INTEGER,
  }, {});

  //class method - 각 인스턴스의 생명주기중 실행되는 함수
  User.beforeSave((user, options) => { 
    if (user.changed('password')) {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }
  });
	
	
//instance method - 모델에 기능 추가 구현 함수 	
  User.prototype.PlusLoginFailCount = function (user) {
  // 'this' refers directly back to the model 
 	  this.update({login_fail_count :sequelize.literal('login_fail_count + 1')},
					 {where: {username: user}})
	  //cb();
 };
  
  User.prototype.comparePassword = function (passw, cb) { 
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
  };
	
  User.prototype.getClientIp = function (client, user) {
 			  console.log(requestIp.getClientIp(client));	
			  this.update({
								signin_ip:requestIp.getClientIp(client)
							},
							{where:
							  {username : user}});	
 };
	
  User.prototype.SelectLockStatus = function(user){
	  return this.is_account_lock;
  };
	
  User.prototype.UpdateClearLoginFailCount= function(user){
	   	  this.update({
			  			login_fail_count :0,
			  			is_account_lock : false,
					  },
					 {where: {username: user}})
  };
	
  User.prototype.UpdateClearLockCount= function(user){
	  this.update({
			  			lock_count :0,
					  },
					 {where: {username: user}})
  };
	
  User.prototype.UpdateLockStatus= function(user){
	 
  };	
	
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};