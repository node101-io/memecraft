import { Oracle } from "@chopinframework/next";

import { User } from '../../../../../../app/models/user/User';

export async function POST(req) {
  const body = await req.json();

  const dateNow = await Oracle.now();

  User.timeOutUserById(body.id, dateNow, (err) => {
    if (err)
      return new Response({ success: false, error: err });

    return new Response({ success: true });
  });
};
