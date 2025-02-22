'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './library.module.css';
import Image from 'next/image';
import { MemeApi, type Meme } from '../services/memeApi';

const ITEMS_PER_PAGE = 15;
const FIXED_ITEMS_COUNT = 6;

// TODO: all memes'teki lazy load iptal, search te frontend'de yapılacak

export default function Library() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [recentMemes, setRecentMemes] = useState<Meme[]>([]);
  const [usedMemes, setUsedMemes] = useState<Meme[]>([]);
  const [allMemes, setAllMemes] = useState<Meme[]>([]);
  const [allPage, setAllPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load fixed sections (recent and used)
  useEffect(() => {
    const loadFixedSections = async () => {
      try {
        const [recentResponse, usedResponse] = await Promise.all([
          MemeApi.getRecentMemes(0, FIXED_ITEMS_COUNT),
          MemeApi.getUsedMemes(0, FIXED_ITEMS_COUNT)
        ]);

        setRecentMemes(recentResponse.memes);
        setUsedMemes(usedResponse.memes);
      } catch (error) {
        console.error('Loading error:', error);
      }
    };

    loadFixedSections();
  }, []);

  // Search effect'i güncelleyelim
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      // Reset states
      setAllMemes([]);
      setAllPage(0);
      setHasMore(true);
      
      // Yeni arama için yükleme başlat
      try {
        setIsLoading(true);
        const response = await MemeApi.getAllMemes(0, ITEMS_PER_PAGE);
        setAllMemes(response.memes);
        setHasMore(response.hasMore);
        setAllPage(1);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // loadMoreAllMemes fonksiyonunu güncelleyelim
  const loadMoreAllMemes = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const response = await MemeApi.getAllMemes(allPage, ITEMS_PER_PAGE);
      
      // Eğer arama terimi varsa, aramaya göre filtrele
      const filteredMemes = searchTerm.trim() 
        ? response.memes.filter(meme => 
            meme.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : response.memes;

      setAllMemes(prev => [...prev, ...filteredMemes]);
      setHasMore(response.hasMore && filteredMemes.length > 0);
      setAllPage(prev => prev + 1);
    } catch (error) {
      console.error('Loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [allPage, hasMore, isLoading, searchTerm]);

  // Infinite scroll observer'ı aynı kalabilir
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreAllMemes();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreAllMemes, hasMore, isLoading]);

  const renderSkeletons = (count: number) => (
    Array(count).fill(null).map((_, index) => (
      <div key={`skeleton-${index}`} className={`${styles.memeItem} ${styles.skeleton}`} />
    ))
  );

  const renderMemeGrid = (memes: Meme[], isFixed: boolean = false) => (
    <div className={styles.memesGrid}>
      {memes.length > 0 ? memes.map((meme) => (
        <div key={meme.id} className={styles.memeItem}>
          <Image 
            src={meme.imageUrl} 
            alt={meme.title} 
            width={96} 
            height={96}
            className={styles.memeImage}
          />
        </div>
      )) : renderSkeletons(isFixed ? FIXED_ITEMS_COUNT : 9)}
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
      {renderMemeGrid(recentMemes, true)}

      <h3 className={styles.sectionTitle}>LAST USED</h3>
      {renderMemeGrid(usedMemes, true)}

      <h3 className={styles.sectionTitle}>ALL</h3>
      <div className={styles.memesGrid}>
        {allMemes.map((meme) => (
          <div key={meme.id} className={styles.memeItem}>
            <Image 
              src={meme.imageUrl} 
              alt={meme.title} 
              width={96} 
              height={96}
              className={styles.memeImage}
            />
          </div>
        ))}
        <div ref={observerTarget} className={styles.loadingContainer}>
          {isLoading && hasMore && (
            <div className={styles.loadingSpinner}></div>
          )}
        </div>
        {!hasMore && allMemes.length > 0 && (
          <div className={styles.endMessage}>No more items to load</div>
        )}
        {!isLoading && allMemes.length === 0 && (
          <div className={styles.noResults}>No results found</div>
        )}
      </div>
    </>
  );
}
