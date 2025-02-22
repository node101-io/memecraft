import { User } from '../../../../../app/models/user/User';

export async function GET(req) {
  const body = await req.json();

  return new Response(await new Promise((resolve, reject) => {
    // TODO: bu fonkları çağıracak
    // User.findLastUsedMemesByUserId
    // User.findRecentlyAddedMemesByUserId
  }));
};
