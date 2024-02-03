// controllers/authController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
  // Logique d'inscription
};

exports.login = (req, res) => {
  // Logique de connexion
};

exports.checkPassword = (inputPassword, storedHashedPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(inputPassword, storedHashedPassword, (error, result) => {
      if (error) {
        console.error('Error comparing passwords:', error);
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};