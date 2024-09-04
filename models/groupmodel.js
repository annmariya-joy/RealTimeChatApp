// models/Group.js
module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define("Group", {
        group_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        group_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id"
            }
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true, 
            references: {
                model: "users",
                key: "user_id"
            }
        }
    }, {
        paranoid: true,
        tableName: 'groups',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    });

    return Group;
};
