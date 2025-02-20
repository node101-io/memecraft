'use client'

import { useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
// import { MainButton } from '@twa-dev/sdk/react';

async function fetchUserBalance(userId: number | undefined): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockBalances: { [key: string]: number } = {
    '5729713262': 150,
    '6705722559': 75,
  };

  return mockBalances[String(userId)] || 0;
};

export default function TelegramTest() {
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [balance, setBalance] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const { initDataRaw, initData } = retrieveLaunchParams();

    console.log(initDataRaw, initData)

    // setUserId(initData?.user?.id);

    // fetchUserBalance(initData?.user?.id)
    //   .then((userBalance) => {
    //     setBalance(userBalance);
    //     setLoading(false);
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching user balance:", error);
    //     setLoading(false);
    //   });

  }, []);

  return (
    <div>
      <h1>Telegram Test</h1>
      {userId ? (<>
        <pre>{userId}</pre>
        {balance !== undefined ? <pre>{balance}</pre> : <p>Loading...</p>}
        {loading ? <p>Loading...</p> : null}
        {/* <MainButton
          onClick={() => {}}
          text="Switch Inline Query"
        ></MainButton> */}
      </>) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
