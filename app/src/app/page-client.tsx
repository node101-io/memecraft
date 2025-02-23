'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import WebApp from '@twa-dev/sdk';

import styles from './page.module.css';

import Marketplace from './components/marketplace';
import Memecraft from './components/craft';
import Library from './components/library';

export interface PopulatedUser {
  chopin_public_key: string;
  telegram_id: string;
  balance: number;
  minted_memes: {
    meme: Meme;
    last_used_at: number;
  }[];
};

export interface User {
  chopin_public_key: string;
  telegram_id: string;
  balance: number;
  minted_memes: {
    meme_id: string;
    last_used_at: number;
  }[];
};

export interface Meme {
  _id: string;
  description: string;
  tags: string[];
  content_url: string;
  mint_price: number;
  creator: string;
}

export default function Home({ user_id }: { user_id: string }) {
  const [activeTab, setActiveTab] = useState('library');
  const [user, setUser] = useState<PopulatedUser>({
    minted_memes: [],
    chopin_public_key: '',
    telegram_id: '',
    balance: 0,
  });

  useEffect(() => {
    WebApp.CloudStorage.getItem('dev-address', async (error, devAddress) => {
      if (error)
        return console.error(error);

      const chopinResponse = await fetch(`/_chopin/login${devAddress ? `?as=${devAddress}` : ''}`);
      const chopinData = await chopinResponse.json();

      if (!chopinData.success)
        return console.error(chopinData);

      localStorage.setItem('chopin-jwt-token', chopinData.token);
      localStorage.setItem('dev-address', chopinData.address);

      if (chopinData.address !== devAddress)
        WebApp.CloudStorage.setItem('dev-address', chopinData.address, () => console.log('dev-address set'));

      const createResponse = await fetch(`/api/user/create`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('chopin-jwt-token')}`
        },
        method: 'POST',
        body: JSON.stringify({
          telegram_id: user_id,
        })
      });

      const userData = await createResponse.json();
      console.log('User data from API:', userData);

      if (!userData.success)
        return console.error(userData);

      setUser(userData.data);
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
        {activeTab === 'library' && <Library user={user} />}
      </main>
    </>
  );
}
