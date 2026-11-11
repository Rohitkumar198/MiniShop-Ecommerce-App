const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json({ count: users.length, users });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch users", error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be user or admin" });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User role updated", user });
  } catch (error) {
    return res.status(400).json({ message: "Could not update role", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account here" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await require("../models/Cart").deleteOne({ user: user._id });
    return res.json({ message: "User deleted" });
  } catch (error) {
    return res.status(400).json({ message: "Could not delete user", error: error.message });
  }
};

module.exports = { getUsers, updateUserRole, deleteUser };
