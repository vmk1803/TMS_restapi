import { getMongoUserModel } from "../controllers/authController";

// Check if email exists and return a boolean accordingly
export const userEmailExists = async (email: string) => {
  const MongoUser = getMongoUserModel();
  const user = await MongoUser.findOne({ email, deleted_at: null });
  return !!user;
};
