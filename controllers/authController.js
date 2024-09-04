const db = require("../models");
const bcrypt = require('bcrypt');
const { validateEmail,isValidPhoneNumber } = require('./validater');
const { generateAccessToken,verifyIdToken } = require('../config/utils/auth');
const { Buffer } = require('buffer');
const request = require('request');
const jwt = require('jsonwebtoken');
const constant = require("../config/utils/constant");





const login = async (req, res) => {

  const userAgent = req.headers['user-agent'];
  console.log("user agent",userAgent);
  const query = { where: {} };
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing.' });
  }
  try {
      const decodedCredentials = Buffer.from(authHeader, 'base64').toString('utf-8');
      const [userlogin, password] = decodedCredentials.split(':');
      if (userlogin) {
        if (validateEmail(userlogin)) {
            query.where.email = userlogin;
        }  else {
            return res.status(400).json({ message: 'Invalid input: Neither email or valid phone number.' });
        }
    }

      const user = await db.users.findOne(query);
      if (!user) {
      return res.status(200).json({ message: 'Invalid email or password.' });
      }
      if (user.role !== constant.Role.user) {
        return res.status(403).json({ message: 'You do not have permission to access this route.' });
    }
      if (validateEmail(userlogin)) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ message: 'Your password does not match.' });

        }
      }
             
              const accessToken = await generateAccessToken(user);
              
              res.status(200).json({ message: 'Login successful.', user, accessToken })
  } catch (error) {
      console.log(error.stack)
      res.status(500).json({ message: 'Error logging in.', error });
  }
};


const signup = async (req, res) => {

  const { role, user_name, email, password } = req.body;
  
       try {
          const hasUserWithEmail = await db.users.count({ where: { email } })
          if (hasUserWithEmail) {
           res.status(400).json({ message: 'Already existing user.' });
           return
          }
          else if(!password || password === null) {
           return res.status(400).json({ message: 'Password is Missing.' });
           
          }
           else{
  
           const hashedPassword = await bcrypt.hash(password, 10);
  
           const user = await db.users.create({  role, user_name, email, password: hashedPassword});
           const tokens = await generateAccessToken(user);
  
           // Return the user and the tokens in the response
           res.status(200).json({
             message: 'User created successfully.',
             user,
             accessToken: tokens.accessToken,
             refreshToken: tokens.RefreshToken,
           });
  
          
          }
       } catch (error) {
          res.status(500).json({ message: 'Error creating user.', error });
       }
  };
  

module.exports = { signup,login };

