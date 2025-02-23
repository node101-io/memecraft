'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import WebApp from '@twa-dev/sdk';

import styles from './page.module.css';

import Marketplace from './components/marketplace';
import Memecraft from './components/craft';
import Library from './components/library';

export default function Home({ user_id }: { user_id: string }) {
  const [activeTab, setActiveTab] = useState('library');
  const [user, setUser] = useState({
    balance: 0,
    minted_memes: [],
    telegram_id: '',
    chopin_public_key: '',
  });

  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    WebApp.CloudStorage.getItem('dev-address', async (error, devAddress) => {
      if (error)
        return console.error(error);

      const chopinResponse = await fetch(`/_chopin/login${devAddress ? `?as=${devAddress}` : ''}`);
      const chopinData = await chopinResponse.json();

      document.cookie = `dev-address=${chopinData.address}; path=/`;

      setWalletAddress(chopinData.address);

      if (chopinData.address !== devAddress)
        WebApp.CloudStorage.setItem('dev-address', chopinData.address);

      const createResponse = await fetch(`/api/user/create`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify({
          chopin_public_key: chopinData.address,
          telegram_id: user_id,
        })
      });

      const createUserData = await createResponse.json();

      if (createUserData.success)
        setUser(createUserData.data);

      console.log('createUserData', createUserData);
    });
  }, []);

  return (
    <>
      <header>
        <nav className={styles.nav}>
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={activeTab === 'marketplace' ? styles.navButtonActive : styles.navButton}
          >
            Marketplace
          </button>
          <button 
            onClick={() => setActiveTab('memecraft')}
            className={activeTab === 'memecraft' ? styles.navButtonActive : styles.navButton}
          >
            Memecraft
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={activeTab === 'library' ? styles.navButtonActive : styles.navButton}
          >
            Library
          </button>
          <div className={styles.balanceDisplay}>
            <span className={styles.balanceAmount}>{user.balance.toFixed(1)}</span>
            <Image 
              src='/token/token.svg'
              alt='Token'
              width={12}
              height={12}
            />
          </div>
        </nav>
      </header>
      <main className={styles.main}>
        {activeTab === 'marketplace' && <Marketplace user={user} />}
        {activeTab === 'memecraft' && <Memecraft />}
        {activeTab === 'library' && <Library address={walletAddress} />}
      </main>
    </>
  );
}
