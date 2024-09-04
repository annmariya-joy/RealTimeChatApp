const jwt = require('jsonwebtoken');
const UserToken = require('../../models/usertokenmodel');
const db = require('../../models');



async function generateAccessToken(user) {

const payload = {
    userId: user.user_id,
    name: user.user_name,
    email: user.email,
    role: user.role
};
console.log(payload)
const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
expiresIn: '30d',
});
const RefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
expiresIn: '80d',
});

const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '80d',
});

// Remove old tokens if they exist
await db.userToken.destroy({ where: { user_id: user.user_id } });

// Save new refresh token
await db.userToken.create({ user_id: user.user_id, token: refreshToken });


return { accessToken:accessToken, RefreshToken:RefreshToken};
}

function authenticateAccessToken(req, res, next) {
const authHeader = req.headers.authorization;
const token = authHeader && authHeader.split(' ')[1];


if (!token) {
    return res.status(400).json({ message: 'Access token is missing.' });
}

jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
     return res.status(401).json({ message: 'Invalid access token.' });  ///chang 403 to 401 when invliad token happen
    }

    req.user = decoded;
    console.log(req.user);
    next();
});
}





const verifyRefreshToken = (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token not found' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // Generate new tokens
        const payload = {
            userId: user.userId,
            name: user.user_name,
            email: user.email,
            role: user.role
        };

        const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '30d',
        });

        const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '90d',
        });

        res.status(200).json({
            message: 'Access token generated successfully',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    });
};



  
module.exports = { generateAccessToken, authenticateAccessToken ,verifyRefreshToken };
