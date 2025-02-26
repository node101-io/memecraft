import { User } from '../../../../../../app/models/user/User';

import connectDB from '../../../../../lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  await connectDB();

  return Response.json(await new Promise((resolve) => {
    User.checkIfNameIsTaken(name, (err) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true });
    });
  }));
};
