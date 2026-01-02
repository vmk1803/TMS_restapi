import User from "../models/User";

// Check if email exists and return a boolean accordingly
export const userEmailExists = async (email: string) => {
  const user = await User.findOne({ email, deletedAt: null });
  return !!user;
};
