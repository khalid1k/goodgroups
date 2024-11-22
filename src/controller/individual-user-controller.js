const IndividualUser = require("../models/IndividualUser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Replace with your secret key
const JWT_SECRET = "your_secret_key";

const IndividualUserController = {
  // Register a new individual user
  async register(req, res) {
    try {
      const {
        fullName,
        username,
        email,
        password,
        birthday,
        mobileNumber,
        referralCode,
      } = req.body;

      // Check if email or username is already in use
      const existingUser = await IndividualUser.findOne({ where: { email } });
      if (existingUser)
        return res.status(400).json({ message: "Email is already in use." });

      const existingUsername = await IndividualUser.findOne({
        where: { username },
      });
      if (existingUsername)
        return res.status(400).json({ message: "Username is already taken." });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await IndividualUser.create({
        fullName,
        username,
        email,
        password: hashedPassword,
        birthday,
        mobileNumber,
        referralCode,
      });

      res
        .status(201)
        .json({ message: "User registered successfully.", user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  },

  // Login an individual user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await IndividualUser.findOne({ where: { email } });
      if (!user)
        return res.status(400).json({ message: "Invalid email or password." });

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.status(400).json({ message: "Invalid email or password." });

      // Generate token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(200).json({ message: "Login successful.", token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  },

  // Get user details
  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await IndividualUser.findByPk(id);

      if (!user) return res.status(404).json({ message: "User not found." });

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  },

  // Update user details
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      const [updatedRows] = await IndividualUser.update(updatedData, {
        where: { id },
      });

      if (!updatedRows)
        return res
          .status(404)
          .json({ message: "User not found or no changes made." });

      res.status(200).json({ message: "User updated successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const deletedRows = await IndividualUser.destroy({ where: { id } });

      if (!deletedRows)
        return res.status(404).json({ message: "User not found." });

      res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  },
};

module.exports = IndividualUserController;
