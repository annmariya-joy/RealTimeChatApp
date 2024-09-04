const db = require("../models");
const bcrypt = require('bcrypt');
const { validateEmail,isValidPhoneNumber } = require('./validater');
const { generateAccessToken,verifyIdToken } = require('../config/utils/auth');
const { Buffer } = require('buffer');
const request = require('request');
const jwt = require('jsonwebtoken');
const constant = require("../config/utils/constant");




const login = async (req, res) => {
  const authHeader = req.headers.authorization;
 
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ message: 'Authorization header is missing.'});
  }

  try {
    const encodedCredentials = authHeader.split(' ')[1];
    if (!encodedCredentials) {
      throw new Error('Encoded credentials are missing.');
    }

 
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
   

    const [userEmail, password] = decodedCredentials.split(':');
    if (!userEmail || !password) {
      throw new Error('Invalid credentials format.');
    }


    // Validate email and password
    if (!validateEmail(userEmail)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    const user = await db.users.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.role !== constant.Role.user) {
      return res.status(403).json({ message: 'You do not have permission to access this route.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Your password does not match.' });
    }

    const accessToken = await generateAccessToken(user);
    res.status(200).json({ message: 'Login successful.', accessToken });
  } catch (error) {
  
    res.status(500).json({ message: 'Error logging in.', error });
  }
};


const signup = async (req, res) => {
  const { role, user_name, email, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is Missing.' });
  }

  try {
    const userExists = await db.users.count({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Already existing user.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.users.create({ role, user_name, email, password: hashedPassword });
    const tokens = await generateAccessToken(user);

    res.status(200).json({
      message: 'User created successfully.',
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.RefreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user.', error });
  }
};


module.exports = { signup,login };

