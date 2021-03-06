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
	
	/*
	User.beforeUpdate((user, options) => { 
		console.log(user._previousDataValues.login_fail_count);
		console.log("login_fail_count:",user.login_fail_count);
		console.log("is_account_lock:", user.is_account_lock);
    if (user._previousDataValues.login_fail_count >=4) {
      user.is_account_lock = true;
		console.log("is_account_lock:", user.is_account_lock);
    }
  });
  */
	
	
//instance method - 모델에 기능 추가 구현 함수 	
  User.prototype.PlusLoginFailCount = function (user) {
  // 'this' refers directly back to the model 
	  //console.log("user:", user);
	  //console.log("user:",user.body.id);
	  //console.log("username:",user.body.username);
	  //console.log("user pw:", user.body.password);
 	  this.increment({login_fail_count : 1},
						 {where: {username: user.body.username}})
	  //this.update({login_fail_count :sequelize.literal('login_fail_count + 1')},
	  //			 {where: {username: user.body.username}})
		  .then((user)=>{
		  console.log(user.dataValues.login_fail_count);
		  if(user.dataValues.login_fail_count ==5){
			  console.log('true');			
			  return User.update({is_account_lock :true},
	  								{where: {username: user.dataValues.username}});
		  }
			  

	  });
	  
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

	//login trial date update
  User.prototype.setloginTrialDate = function (client, user) {
	
			  this.update({
								try_login_date: new Date()
							},
							{where:
							  {username : user}});	
 };	
	
	//admin update
  User.prototype.setAdmin = function (client, user) {
	
			  this.update({
								is_admin: true
							},
							{where:
							  {username : user}});	
 };	
	
  User.prototype.setAdminFalse = function (client, user) {
	
			  this.update({
								is_admin: false
							},
							{where:
							  {username : user}});	
 };	
	
	//login_date update
  User.prototype.setLoginDate = function (client, user) {
	
			  this.update({
								latest_login_date: new Date()
							},
							{where:
							  {username : user}});	
 };
	
	//login IP update
  User.prototype.setClientIp = function (client, user) {
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
	 this.update({	attributes:['id','username','is_account_lock'],
				  },{where:{username:user}});
  };	
	
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};