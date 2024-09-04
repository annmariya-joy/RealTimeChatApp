// models/GroupMessage.js
module.exports = (sequelize, DataTypes) => {
    const GroupMessage = sequelize.define("GroupMessage", {
        group_message_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "groups",
                key: "group_id"
            }
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id"
            }
        },
        message_body: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        paranoid: true,
        tableName: 'group_messages',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    });

    return GroupMessage;
};
