

module.exports =(sequelize, DataTypes) => {
    const UserToken = sequelize.define("UserToken",{
        usertoken_id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true },

            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                 model: 'users',
                 key: 'user_id'
                }
             },

        token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        
    }, {
        paranoid: true,
        tableName: 'userToken',
        createdAt: 'created_at',
        updatedAt:'updated_at',
        deletedAt: 'deleted_at',
    })





return UserToken;
};