'use client';

import { useState } from 'react';
import styles from './library.module.css';
import Image from 'next/image';
import { type Meme } from '../services/memeApi';

const FIXED_ITEMS_COUNT = 6;

interface LibraryProps {
  user: {
    minted_memes: {
      meme_id: Meme;
      last_used_at: number;
    }[];
  };
}

export default function Library({ user }: LibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const allMemes = user.minted_memes.map(item => item.meme_id);

  const recentMemes = allMemes.slice(-FIXED_ITEMS_COUNT);

  const lastUsedMemes = [...user.minted_memes]
    .sort((a, b) => b.last_used_at - a.last_used_at)
    .slice(0, FIXED_ITEMS_COUNT)
    .map(item => item.meme_id);

  const filteredMemes = searchTerm.trim()
    ? allMemes.filter(meme => meme.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : allMemes;

  const renderMemeGrid = (memes: Meme[], section: string) => (
    <div className={styles.memesGrid}>
      {memes.map((meme) => (
        <div key={`${section}-${meme.id}`} className={styles.memeItem}>
          <Image 
            src={meme.imageUrl} 
            alt={meme.title} 
            width={96} 
            height={96}
            className={styles.memeImage}
          />
        </div>
      ))}
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
      <div className={styles.memesGrid}>
        {filteredMemes.length > 0 ? (
          filteredMemes.map((meme) => (
            <div key={`all-${meme.id}`} className={styles.memeItem}>
              <Image 
                src={meme.imageUrl} 
                alt={meme.title} 
                width={96} 
                height={96}
                className={styles.memeImage}
              />
            </div>
          ))
        ) : (
          <div className={styles.noResults}>No results found</div>
        )}
      </div>
    </>
  );
}
