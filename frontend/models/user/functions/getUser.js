export const getUser = (user, callback) => {
  if (!user || !user._id) {
    return callback('document_not_found');
  }

  return callback(null, {
    telegram_id: user.telegram_id,
    chopin_public_key: user.chopin_public_key,
    is_time_out: user.is_time_out,
    balance: user.balance,
    minted_memes: user.minted_memes
  });
};