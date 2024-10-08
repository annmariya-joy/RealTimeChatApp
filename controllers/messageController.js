const db = require("../models");

const sendMessage = (io) => async (req, res) => {
    const { receiver_id, message_body } = req.body;

    try {
        const receiver = await db.users.findByPk(receiver_id);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found.' });
        }
        const message = await db.messages.create({
            message_body,
            sender_id: req.user.userId,
            receiver_id
        });

        io.to(receiver_id).emit('newMessage', message);
        io.to(req.user.userId).emit('newMessage', message);

        res.status(201).json({ message: 'Message sent successfully.', data: message });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send message.', error });
    }
};


const getMessages = async (req, res) => {
    const { user_id } = req.params;  

    try {
        const messages = await db.messages.findAll({
            where: {
                sender_id: req.user.userId,
                receiver_id: user_id
            },
            order: [['created_at', 'ASC']]  
        });
        res.status(200).json({ data: messages });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve messages.', error });
    }
};


const sendGroupMessage = (io) => async (req, res) => {
    const { group_id, message_body } = req.body;

    try {
        const group = await db.groups.findByPk(group_id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }
        const groupMessage = await db.group_messages.create({
            group_id,
            sender_id: req.user.userId,
            message_body
        });
        const groupMembers = await db.group_members.findAll({ where: { group_id } });
        groupMembers.forEach(member => {
            io.to(member.user_id).emit('newGroupMessage', groupMessage);
        });

        res.status(201).json({ message: 'Message sent to group successfully.', groupMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send group message.', error });
    }
};

const getGroupMessages = async (req, res) => {
    const { group_id } = req.params;
    try {
        const isMember = await db.group_members.findOne({
            where: {
                group_id: group_id,
                user_id: req.user.userId
            }
        });
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group.' });
        }
        const messages = await db.group_messages.findAll({
            where: { group_id: group_id },
            include: [
                {
                    model: db.users,
                    as: 'sender',
                    attributes: ['user_id', 'user_name']  
                }
            ],
            order: [['created_at', 'ASC']]
        });
        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve messages.', error });
    }
};



module.exports = { sendMessage,getMessages,sendGroupMessage ,getGroupMessages};