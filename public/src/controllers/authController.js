const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendVerificationEmail } = require('../utils/emailHelper');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, verified: false },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    sendVerificationEmail(user.email, token);

    res.status(201).json({ message: 'User registered. Verification email sent.' });
  } catch (error) {
    res.status(500).json({ error: 'User registration failed' });
  }
};
