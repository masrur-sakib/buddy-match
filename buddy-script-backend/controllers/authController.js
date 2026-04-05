const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { uploadToSupabase, getSignedImageUrl } = require('../middleware/upload');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    let profileImage = null;

    if (req.file) {
      profileImage = await uploadToSupabase(req.file);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImage,
    });
    res
      .status(201)
      .json({ message: 'User registered successfully', userId: user.id });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
    let profileImage = null;

    if (user.profileImage) {
      try {
        profileImage = await getSignedImageUrl(user.profileImage);
      } catch (error) {
        profileImage = null;
      }
    }

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
