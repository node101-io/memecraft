import { getAddress } from "@chopinframework/next";

import PageClient from "./page-client";

export default async function Home({ searchParams }: { searchParams: { user_id: string } }) {
  const address = await getAddress();
  console.log(address)

  return (
    <PageClient user_id={searchParams.user_id} />
  );
}