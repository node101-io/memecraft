'use client';

import { useState } from 'react';

import styles from './page.module.css';

import Image from 'next/image';

import Marketplace from './components/marketplace';
import Memecraft from './components/craft';
import Library from './components/library';

export default function Home() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [balance, setBalance] = useState(10);

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
            <span className={styles.balanceAmount}>{balance.toFixed(1)}</span>
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
        {activeTab === 'library' && <Library />}
      </main>
    </>
  );
}
