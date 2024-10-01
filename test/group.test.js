const db = require('../models'); 
const { createGroup,addMember,removeMember,updateGroup } = require('../controllers/groupController');

jest.mock('../models', () => {
    const groups = {
        findByPk: jest.fn(),
        create: jest.fn()
    };
    const group_members = {
        create: jest.fn(),
        bulkCreate: jest.fn(),
        destroy: jest.fn()
    };
    return {
        sequelize: { close: jest.fn() },
        groups,
        group_members
    };
});



describe('Add Member', () => {
    beforeEach(() => {
        req = {
            body: {
                group_id: 1,
                user_id: 2
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        db.groups.findByPk.mockResolvedValue({ group_id: 1 });
        db.group_members.create.mockResolvedValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should add a member to a group', async () => {
        await addMember(req, res);

        expect(db.groups.findByPk).toHaveBeenCalledWith(1);
        expect(db.group_members.create).toHaveBeenCalledWith({ group_id: 1, user_id: 2 });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Member added to group.' });
    });

    test('should handle errors when group is not found', async () => {
        db.groups.findByPk.mockResolvedValue(null);

        await addMember(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Group not found.' });
    });

    test('should handle errors during member addition', async () => {
        db.group_members.create.mockRejectedValueOnce(new Error('Failed to add member'));

        await addMember(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to add member.', error: expect.any(Error) });
    });
});

describe('Group Controller', () => {
    let req, res, group;

    beforeEach(() => {
        req = {
            body: {
                group_name: 'Test Group',
                members: [1, 2, 3]
            },
            user: {
                userId: 1
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        group = { group_id: 1, group_name: 'Test Group', created_by: 1 };
        db.groups.create.mockResolvedValue(group);
        db.group_members.bulkCreate.mockResolvedValue([]);
    });

    

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should create a group and add members', async () => {
        await createGroup(req, res);

        expect(db.groups.create).toHaveBeenCalledWith({
            group_name: 'Test Group',
            created_by: 1,
            updated_by: 1
        });
        expect(db.group_members.bulkCreate).toHaveBeenCalledWith([
            { user_id: 1, group_id: 1 },
            { user_id: 2, group_id: 1 },
            { user_id: 3, group_id: 1 }
        ]);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Group created successfully.', group });
    });

    test('should handle errors during group creation', async () => {
        db.groups.create.mockRejectedValueOnce(new Error('Failed to create group'));

        await createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to create group.', error: expect.any(Error) });
    });

   
    
});


describe('Remove Member', () => {
    beforeEach(() => {
        req = {
            body: {
                group_id: 1,
                user_id: 2
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        db.groups.findByPk.mockResolvedValue({ group_id: 1 });
        db.group_members.destroy.mockResolvedValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should remove a member from a group', async () => {
        await removeMember(req, res);

        expect(db.groups.findByPk).toHaveBeenCalledWith(1);
        expect(db.group_members.destroy).toHaveBeenCalledWith({ where: { group_id: 1, user_id: 2 } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Member removed from group.' });
    });

    test('should handle errors when group is not found', async () => {
        db.groups.findByPk.mockResolvedValue(null);

        await removeMember(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Group not found.' });
    });
    test('should handle errors during member removal', async () => {
        db.group_members.destroy.mockRejectedValueOnce(new Error('Failed to remove member'));
        await removeMember(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to remove member.', error: expect.any(Error) });
    });
});


