import { getAddress } from "@chopinframework/next";

import PageClient from "./page-client";

export default async function Home({ searchParams }: { searchParams: { user_id: string } }) {
  const address = await getAddress();
  console.log(address)

  const { user_id } = await searchParams;

  return (
    <PageClient user_id={user_id} />
  );
}