'use client';

import { useEffect, useState } from 'react';
import styles from './library.module.css';
import Image from 'next/image';
import WebApp from '@twa-dev/sdk';

import { PopulatedUser, Meme } from '../page-client';

const FIXED_ITEMS_COUNT = 6;

export default function Library({ user }: { user: PopulatedUser; }) {
  console.log('user', user);
  const [searchTerm, setSearchTerm] = useState('');

  const allMemes = (user.minted_memes?.map(item => item.meme) || []).filter(Boolean);

  const recentMemes = [...allMemes].slice(-FIXED_ITEMS_COUNT);

  const lastUsedMemes = [...(user.minted_memes || [])]
    .sort((a, b) => (b.last_used_at || 0) - (a.last_used_at || 0))
    .slice(0, FIXED_ITEMS_COUNT)
    .map(item => item.meme)
    .filter(Boolean);

  const filteredMemes = searchTerm.trim()
    ? allMemes.filter(meme => 
        meme?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allMemes;

  const handleMemeClick = (memeId: string) => {
    WebApp.switchInlineQuery(memeId);
  };

  const renderMemeGrid = (memes: Meme[], section: string) => (
    <div className={styles.memesGrid}>
      {memes.length > 0 ? memes.map((meme, index) => (
        meme && (
          <div 
            key={`${section}-${meme._id}-${index}`} 
            className={styles.memeItem}
            onClick={() => handleMemeClick(meme._id)}
            role="button"
            tabIndex={0}
          >
            <Image 
              src={meme.content_url || ''}
              alt={meme.description || ''} 
              width={96} 
              height={96}
              className={styles.memeImage}
            />
          </div>
        )
      )).filter(Boolean) : (
        <div className={styles.noResults}>No results found</div>
      )}
    </div>
  );

  return (
    <>
      <div className={styles.searchWrapper}>
        <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="10" cy="10" r="7"></circle>
          <line x1="21" y1="21" x2="15" y2="15"></line>
        </svg>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <h3 className={styles.sectionTitle}>RECENTLY ADDED</h3>
      {renderMemeGrid(recentMemes, 'recent')}

      <h3 className={styles.sectionTitle}>LAST USED</h3>
      {renderMemeGrid(lastUsedMemes, 'used')}

      <h3 className={styles.sectionTitle}>ALL</h3>
      {renderMemeGrid(filteredMemes, 'all')}
    </>
  );
}
