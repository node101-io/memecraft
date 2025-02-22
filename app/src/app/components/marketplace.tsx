'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './marketplace.module.css';
import Image from 'next/image';
import { MemeApi, type Meme } from '../services/memeApi';

const POPULAR_TEMPLATES = [
  { id: 'pepe', src: '/templates/template-pepe.png', alt: 'Pepe' },
  { id: 'cat', src: '/templates/template-cat.png', alt: 'Grumpy Cat' },
  { id: 'doge', src: '/templates/template-doge.png', alt: 'Doge' },
  { id: 'rage', src: '/templates/template-rage.png', alt: 'Rage Comic' },
  { id: 'troll', src: '/templates/template-troll.png', alt: 'Troll Face' },
  { id: 'elon', src: '/templates/template-elon.png', alt: 'Elon' },
  { id: 'yao', src: '/templates/template-yao.png', alt: 'Yao Ming' },
];

const ITEMS_PER_PAGE = 15;

// TODO: tagler seçildikçe diğerlerinin üstünü karart, search'e yazma tagleri
// TODO: iki buton olsun birisi get and send birisi get

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Meme[]>([]);
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleTemplateClick = (alt: string) => {
    setSearchTerm(alt);
  };

  const handleMemeClick = (meme: Meme) => {
    setSelectedMeme(meme);
  };

  // Search effect
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      // Reset states
      setResults([]);
      setPage(0);
      setHasMore(true);
      
      // Yeni arama için yükleme başlat
      try {
        setIsLoading(true);
        const response = await MemeApi.searchMemes(searchTerm, 0, ITEMS_PER_PAGE);
        setResults(response.memes);
        setHasMore(response.hasMore);
        setPage(1);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Load more items
  const loadMoreItems = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const response = await MemeApi.searchMemes(searchTerm, page, ITEMS_PER_PAGE);
      setResults(prev => [...prev, ...response.memes]);
      setHasMore(response.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, searchTerm]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreItems, hasMore, isLoading]);

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

      <h3 className={styles.sectionTitle}>POPULAR TEMPLATES</h3>
      <div className={styles.templateGrid}>
        {POPULAR_TEMPLATES.map(template => (
          <div 
            key={template.id} 
            className={styles.templateItem}
            onClick={() => handleTemplateClick(template.alt)}
            role="button"
            tabIndex={0}
          >
            <Image 
              src={template.src} 
              alt={template.alt} 
              width={40} 
              height={40} 
            />
          </div>
        ))}
      </div>

      <div className={styles.resultsGrid}>
        {results.map((item) => (
          <div 
            key={item.id} 
            className={styles.resultItem}
            onClick={() => handleMemeClick(item)}
            role="button"
            tabIndex={0}
          >
            <Image 
              src={item.imageUrl} 
              alt={item.title || 'Meme'} 
              width={96} 
              height={96}
              className={styles.memeImage}
            />
            <div className={styles.priceTag}>
              {item.price}
              <Image 
                src="/token/token.svg"
                alt="Token"
                width={10}
                height={10}
                className={styles.tokenIcon}
              />
            </div>
          </div>
        ))}
        <div ref={observerTarget} className={styles.loadingContainer}>
          {isLoading && hasMore && (
            <div className={styles.loadingSpinner}></div>
          )}
        </div>
        {!hasMore && results.length > 0 && (
          <div className={styles.endMessage}>No more items to load</div>
        )}
        {!isLoading && results.length === 0 && (
          <div className={styles.noResults}>No results found</div>
        )}
      </div>

      {selectedMeme && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setSelectedMeme(null)}
        >
          <div 
            className={styles.modal}
            onClick={e => e.stopPropagation()}
          >
            <Image 
              src={selectedMeme.imageUrl}
              alt={selectedMeme.title || 'Meme'}
              width={400}
              height={400}
              className={styles.modalImage}
            />
            <div className={styles.modalInfo}>
              <span className={styles.ownerAddress}>
                From: {selectedMeme.owner}
              </span>
              <button className={styles.buyButton}>
                Get for {selectedMeme.price}
                <Image 
                  src="/token/token.svg"
                  alt="Token"
                  width={12}
                  height={12}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
