var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users')
let roleModel = require('../schemas/roles')

// GET all users
router.get('/', async function (req, res, next) {
    try {
        let data = await userModel.find({
            isDeleted: false
        }).populate({
            path: 'role',
            select: 'name description'
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

// GET user by id
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findOne({
            _id: id,
            isDeleted: false
        }).populate({
            path: 'role',
            select: 'name description'
        });
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
});

// POST create new user
router.post('/', async function (req, res, next) {
    try {
        let { username, password, email, fullName, avatarUrl, role } = req.body;
        
        // Validate required fields
        if (!username || !password || !email) {
            return res.status(400).send({
                message: "username, password, và email là bắt buộc"
            })
        }

        // Check if user already exists
        let existingUser = await userModel.findOne({
            $or: [{ username }, { email }]
        });
        if (existingUser) {
            return res.status(400).send({
                message: "username hoặc email đã tồn tại"
            })
        }

        let newUser = new userModel({
            username,
            password,
            email,
            fullName: fullName || "",
            avatarUrl: avatarUrl || "https://i.sstatic.net/l60Hf.png",
            role: role || null,
            status: false,
            loginCount: 0,
            isDeleted: false
        });

        let result = await newUser.save();
        result = await result.populate('role', 'name description');
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

// PUT update user
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let { username, password, email, fullName, avatarUrl, role, status } = req.body;

        let updateData = {};
        if (username) updateData.username = username;
        if (password) updateData.password = password;
        if (email) updateData.email = email;
        if (fullName !== undefined) updateData.fullName = fullName;
        if (avatarUrl) updateData.avatarUrl = avatarUrl;
        if (role) updateData.role = role;
        if (status !== undefined) updateData.status = status;

        let result = await userModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('role', 'name description');

        if (!result) {
            return res.status(404).send({
                message: "ID NOT FOUND"
            })
        }

        res.send(result);
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

// DELETE soft delete user
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );

        if (!result) {
            return res.status(404).send({
                message: "ID NOT FOUND"
            })
        }

        res.send({
            message: "User đã bị xóa",
            data: result
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

// POST enable user (set status = true)
router.post('/enable', async function (req, res, next) {
    try {
        let { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).send({
                message: "email và username là bắt buộc"
            })
        }

        let user = await userModel.findOne({
            email: email,
            username: username,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).send({
                message: "Không tìm thấy user với email và username này"
            })
        }

        let result = await userModel.findByIdAndUpdate(
            user._id,
            { status: true },
            { new: true }
        ).populate('role', 'name description');

        res.send({
            message: "User đã được kích hoạt",
            data: result
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

// POST disable user (set status = false)
router.post('/disable', async function (req, res, next) {
    try {
        let { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).send({
                message: "email và username là bắt buộc"
            })
        }

        let user = await userModel.findOne({
            email: email,
            username: username,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).send({
                message: "Không tìm thấy user với email và username này"
            })
        }

        let result = await userModel.findByIdAndUpdate(
            user._id,
            { status: false },
            { new: true }
        ).populate('role', 'name description');

        res.send({
            message: "User đã bị vô hiệu hóa",
            data: result
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

module.exports = router;
