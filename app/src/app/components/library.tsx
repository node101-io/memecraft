'use client';

import { useState, useEffect } from 'react';
import styles from './library.module.css';
import Image from 'next/image';

const MOCK_RECENT_MEMES = Array(15).fill(null).map((_, index) => ({
  id: `recent-${index}`,
  imageUrl: '/memes/meme-1.png',
  title: `Recent Meme ${index + 1}`,
  price: '0.11',
  owner: '0x1234...5678'
}));

const MOCK_USED_MEMES = Array(15).fill(null).map((_, index) => ({
  id: `used-${index}`,
  imageUrl: '/memes/meme-1.png',
  title: `Used Meme ${index + 1}`,
  price: '0.11',
  owner: '0x1234...5678'
}));

const MOCK_ALL_MEMES = [...MOCK_RECENT_MEMES, ...MOCK_USED_MEMES];

export default function Library() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentMemes, setRecentMemes] = useState(MOCK_RECENT_MEMES);
  const [usedMemes, setUsedMemes] = useState(MOCK_USED_MEMES);
  const [allMemes, setAllMemes] = useState(MOCK_ALL_MEMES);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsLoading(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const filteredRecent = MOCK_RECENT_MEMES.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
          const filteredUsed = MOCK_USED_MEMES.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
          const filteredAll = MOCK_ALL_MEMES.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setRecentMemes(filteredRecent);
          setUsedMemes(filteredUsed);
          setAllMemes(filteredAll);
        } catch (error) {
          console.error('Arama hatası:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setRecentMemes(MOCK_RECENT_MEMES);
        setUsedMemes(MOCK_USED_MEMES);
        setAllMemes(MOCK_ALL_MEMES);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const renderMemeGrid = (memes: typeof MOCK_RECENT_MEMES) => (
    memes.map((meme) => (
      <div key={meme.id} className={styles.memeItem}>
        <Image 
          src={meme.imageUrl} 
          alt={meme.title} 
          width={96} 
          height={96}
          className={styles.memeImage}
        />
      </div>
    ))
  );

  const renderSkeletons = () => (
    Array(6).fill(null).map((_, index) => (
      <div key={`skeleton-${index}`} className={`${styles.memeItem} ${styles.skeleton}`} />
    ))
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
      <div className={styles.memesGrid}>
        {isLoading ? renderSkeletons() : 
          recentMemes.length > 0 ? renderMemeGrid(recentMemes.slice(0, 9)) : 
          <div className={styles.noResults}>No results found</div>
        }
      </div>

      <h3 className={styles.sectionTitle}>LAST USED</h3>
      <div className={styles.memesGrid}>
        {isLoading ? renderSkeletons() : 
          usedMemes.length > 0 ? renderMemeGrid(usedMemes.slice(0, 9)) : 
          <div className={styles.noResults}>No results found</div>
        }
      </div>

      <h3 className={styles.sectionTitle}>ALL</h3>
      <div className={styles.memesGrid}>
        {isLoading ? renderSkeletons() : 
          allMemes.length > 0 ? renderMemeGrid(allMemes) : 
          <div className={styles.noResults}>No results found</div>
        }
      </div>
    </>
  );
}
