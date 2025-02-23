'use client'

import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { MainButton } from '@twa-dev/sdk/react';

export default function TelegramTest() {
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loginChopin = async () => {
      WebApp.CloudStorage.getItem('dev-address', async (error, devAddress) => {
        if (error)
          return console.error(error);

        const response = await fetch(`/_chopin/login${devAddress ? `?as=${devAddress}` : ''}`);
        const data = await response.json();

        setWalletAddress(data.address);

        if (data.address !== devAddress)
          WebApp.CloudStorage.setItem('dev-address', data.address);
      });
    };

    loginChopin();
  }, []);

  return (
    <div>
      <h1>Telegram Test</h1>
      {walletAddress ? (<>
        <pre>{walletAddress}</pre>
        <MainButton
          onClick={() => WebApp.switchInlineQuery('')}
          text='Switch Inline Query'
        />
      </>) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
