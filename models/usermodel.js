const constant = require("../config/utils/constant");


module.exports =(sequelize, DataTypes) => {

    const User = sequelize.define("User",{
        user_id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true 
        },
        role:{
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: constant.Role.user
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
            isEmail: true,
            }
        },
   
        password: {
            type: DataTypes.STRING ,
            allowNull: false
        },
       
    }, {
        paranoid: true,
        tableName: 'users', 
        createdAt: 'created_at',
        updatedAt:'updated_at',  
        deletedAt: 'deleted_at', 
    })
  return User;
};