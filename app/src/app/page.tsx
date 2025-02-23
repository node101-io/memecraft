'use client';

import { useState } from 'react';

import styles from './page.module.css';

import Image from 'next/image';

import Marketplace from './components/marketplace';
import Memecraft from './components/craft';
import Library from './components/library';

export default function Home() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [user, setUser] = useState({
    balance: 10,
    minted_memes: [
      {
        meme_id: { 
          id: '1',
          title: 'Meme 1',
          imageUrl: '/memes/meme-1.png',
          price: '10',
          owner: 'user1'
        },
        last_used_at: 1714000000
      },
      {
        meme_id: { 
          id: '2',
          title: 'Meme 2',
          imageUrl: '/memes/meme-1.png',
          price: '10',
          owner: 'user1'
        },
        last_used_at: 1714000000
      },
      {
        meme_id: { 
          id: '3',
          title: 'Meme 3',
          imageUrl: '/memes/meme-1.png',
          price: '10',
          owner: 'user1'
        },
        last_used_at: 1714000000
      },
      {
        meme_id: { 
          id: '4',
          title: 'Meme 4',
          imageUrl: '/memes/meme-1.png',
          price: '10',
          owner: 'user1'
        },
        last_used_at: 1714000000
      },
      {
        meme_id: { 
          id: '5',
          title: 'Meme 5',
          imageUrl: '/memes/meme-1.png',
          price: '10',
          owner: 'user1'
        },
        last_used_at: 1714000000
      },
      {
        meme_id: { 
          id: '6',
          title: 'Meme 6',
          imageUrl: '/memes/meme-1.png',
          price: '10',
          owner: 'user1'
        },
        last_used_at: 1714000000
      },
      {
        meme_id: { 
          id: '7',
          title: 'Meme 7',
          imageUrl: '/memes/meme-1.png',
          price: '10',
          owner: 'user1'
        },
        last_used_at: 1714000000
      },
      {
        meme_id: { 
          id: '8',
          title: 'Meme 8',
          imageUrl: '/memes/meme-1.png',
          price: '10',
          owner: 'user1'
        },
        last_used_at: 1714000000
      }
    ]
  });

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
        {activeTab === 'marketplace' && <Marketplace />}
        {activeTab === 'memecraft' && <Memecraft />}
        {activeTab === 'library' && <Library user={user} />}
      </main>
    </>
  );
}
