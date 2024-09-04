
module.exports =(sequelize, DataTypes) => {

    const Message = sequelize.define("Message",{
        message_id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true 
        },
     
        message_body: {
            type: DataTypes.STRING,
          
        },
        sender_id : {
            type: DataTypes.INTEGER ,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id"
            }
        },
        receiver_id :{
            type: DataTypes.INTEGER ,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id"
            }
        },
       
    }, {
        paranoid: true,
        tableName: 'messages', 
        createdAt: 'created_at',
        updatedAt:'updated_at',  
        deletedAt: 'deleted_at', 
    })
  return Message;
};