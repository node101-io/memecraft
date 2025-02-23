import { getAddress } from "@chopinframework/next";

import PageClient from "./page-client";

export default async function Home() {
  const address = await getAddress();
  console.log(address)

  return (
    <PageClient />
  );
}