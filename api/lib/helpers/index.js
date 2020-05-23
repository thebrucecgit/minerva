export function validateInstantiation(user, doc) {
  // User must be part of this group
  if (!user.classes.toObject().includes(doc._id)) return false;

  // User must be a tutee with permissions or a tutor
  if (user.userType === "TUTEE" && doc.preferences.studentInstantiation)
    return true;

  if (user.userType === "TUTOR") return true;

  return false;
}
