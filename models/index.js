const dbConfig = require('../config/dbConfig.js');

const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle

        },
        logging: false//process.env.NODE_ENV == "dev"
    }
)

sequelize.authenticate()
    .then(() => {
        console.log('connected..')
    })
    .catch(err => {

        console.log('error' + err)

    })

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize


db.users = require('./usermodel')(sequelize, DataTypes)
db.userToken = require('./usertokenmodel')(sequelize, DataTypes)

db.messages = require('./messagemodel')(sequelize, DataTypes)
db.groups = require('./groupmodel')(sequelize, DataTypes)
db.group_members = require('./groupmembermodel')(sequelize, DataTypes)
db.group_messages = require('./groupmessagemodel')(sequelize, DataTypes)



db.users.hasMany(db.messages, {
    foreignKey: 'sender_id',
    sourceKey: 'user_id',
});
db.messages.belongsTo(db.users, {
    foreignKey: 'sender_id',
    as: 'sender'
});

db.users.hasMany(db.messages, {
    foreignKey: 'receiver_id',
    sourceKey: 'user_id',
});
db.messages.belongsTo(db.users, {
    foreignKey: 'receiver_id',
    as: 'receiver'
});


db.users.hasMany(db.groups, {
    foreignKey: 'created_by',
    sourceKey: 'user_id',

});
db.groups.belongsTo(db.users, {
    foreignKey: 'created_by',
    as: 'creator'
});

db.users.hasMany(db.groups, {
    foreignKey: 'updated_by',
    sourceKey: 'user_id',
});

db.groups.belongsTo(db.users, {
    foreignKey: 'updated_by',
    as: 'updater'
});


db.users.belongsToMany(db.groups, {
    through: db.group_members,
    foreignKey: 'user_id',
    as: 'groups'
});
db.groups.belongsToMany(db.users, {
    through: db.group_members,
    foreignKey: 'group_id',
    as: 'members'
});


db.groups.hasMany(db.group_messages, {
    foreignKey: 'group_id'
});
db.group_messages.belongsTo(db.groups, {
    foreignKey: 'group_id',
    as: 'group'
});
db.users.hasMany(db.group_messages, {
    foreignKey: 'sender_id'
});
db.group_messages.belongsTo(db.users, {
    foreignKey: 'sender_id',
    as: 'sender'
});


db.sequelize.sync({ force: false })
    .then(() => {
        console.log('yes resync done')
    })

module.exports = db


