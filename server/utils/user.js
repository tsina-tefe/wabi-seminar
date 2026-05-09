export function sanitizeUser(user) {
  return {
    id: String(user.id || user._id),
    name: user.name,
    email: user.email,
  };
}
