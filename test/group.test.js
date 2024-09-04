const db = require('../models'); 
const { createGroup } = require('../controllers/groupController');


jest.mock('../models', () => {
    const groups = {
        create: jest.fn()
    };
    const group_members = {
        bulkCreate: jest.fn()
    };
    return {
        sequelize: { close: jest.fn() },
        groups,
        group_members
    };
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
