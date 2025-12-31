export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expires_in: 60 * 60 * 24 * 30 // 30 days
};
