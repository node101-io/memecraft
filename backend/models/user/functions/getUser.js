export const getUser = (user, callback) => {
  if (!user || !user._id) {
    return callback('document_not_found');
  }

  return callback(null, {
    telegram_id: user.telegram_id,
    chopin_public_key: user.chopin_public_key,
    telegram_username: user.telegram_username,
    is_banned: user.is_banned
  });
};