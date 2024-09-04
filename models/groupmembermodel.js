// models/GroupMember.js
module.exports = (sequelize, DataTypes) => {
    const GroupMember = sequelize.define("GroupMember", {
        group_member_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id"
            }
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "groups",
                key: "group_id"
            }
        }
    }, {
        paranoid: false,
        tableName: 'group_members',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
   
    });

    return GroupMember;
};
