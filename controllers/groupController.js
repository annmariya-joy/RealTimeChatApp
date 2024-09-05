const db = require("../models");

const createGroup = async (req, res) => {
    const { group_name, members } = req.body;  

    if (!group_name || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: 'Invalid input. Group name and members are required.' });
    }
    try {
        const group = await db.groups.create({
            group_name,
            created_by: req.user.userId,
            updated_by: req.user.userId
        });
        const groupMembers = members.map(memberId => ({
            user_id: memberId,
            group_id: group.group_id
        }));
        await db.group_members.bulkCreate(groupMembers);
        res.status(201).json({ message: 'Group created successfully.', group });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create group.', error });
    }
};

const addMember = async (req, res) => {
    const { group_id, user_id } = req.body;

    try {
        const group = await db.groups.findByPk(group_id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }
        await db.group_members.create({ group_id, user_id });
        res.status(201).json({ message: 'Member added to group.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add member.', error });
    }
};


const removeMember = async (req, res) => {
    const { group_id, user_id } = req.body;
    try {
        const group = await db.groups.findByPk(group_id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }
        await db.group_members.destroy({ where: { group_id, user_id } });
        res.status(200).json({ message: 'Member removed from group.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove member.', error });
    }
};


const updateGroup = async (req, res) => {
    const { group_id, group_name } = req.body;
    const updatedBy = req.user.userId; 
    if (!group_name) {
        return res.status(400).json({ message: 'Group name is required.' });
    }
    try {
        const group = await db.groups.findByPk(group_id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }
        await group.update({ 
            group_name,        
            updated_by: updatedBy 
        });

        res.status(200).json({ message: 'Group updated successfully.', group });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update group.', error });
    }
};


const deleteGroup = async (req, res) => {
    const { group_id } = req.body;
    try {
        const group = await db.groups.findByPk(group_id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }
        await db.group_members.destroy({ where: { group_id } }); 
        await group.destroy(); 
        res.status(200).json({ message: 'Group deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete group.', error });
    }
};


module.exports = {createGroup, addMember,removeMember ,updateGroup,deleteGroup};