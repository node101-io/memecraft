'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from './marketplace.module.css';
import Image from 'next/image';
import { ImgflipClient, type Meme } from '../services/imgflipApi';

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

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Meme[]>([]);
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [creatorFilter, setCreatorFilter] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Initialize the ImgflipClient
  const client = useMemo(() => new ImgflipClient({
    username: process.env.IMGFLIP_USERNAME || '',
    password: process.env.IMGFLIP_PASSWORD || '',
  }), []);

  const handleTemplateClick = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      return newTags;
    });
  };

  const handleMemeClick = (meme: Meme) => {
    setSelectedMeme(meme);
  };

  const clearCreatorFilter = () => {
    setCreatorFilter(null);
    setSearchTerm('');
  };

  // Generate memes based on search term and tags
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      setResults([]);
      setHasMore(true);
      
      try {
        setIsLoading(true);
        const searchPromises = Array(3).fill(null).map(() => 
          client.generateMeme(searchTerm || selectedTags.join(' '))
        );
        const newMemes = await Promise.all(searchPromises);
        setResults(newMemes);
        setHasMore(false);
      } catch (error) {
        console.error('Generation error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedTags, client]);

  // Load more items - generates new memes on demand
  const loadMoreItems = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const newMemesPromises = Array(3).fill(null).map(() => 
        client.generateMeme(searchTerm || selectedTags.join(' '))
      );
      const newMemes = await Promise.all(newMemesPromises);
      setResults(prev => [...prev, ...newMemes]);
      setHasMore(true);
    } catch (error) {
      console.error('Loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, searchTerm, selectedTags, hasMore, client]);

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

  // Filter results based on creator
  const filteredResults = creatorFilter 
    ? results.filter(meme => meme.owner === creatorFilter) 
    : results;

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
            className={`${styles.templateItem} ${
              selectedTags.includes(template.alt) ? styles.selected : 
              selectedTags.length > 0 ? styles.dimmed : ''
            }`}
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
      {creatorFilter && (
        <div className={styles.creatorFilter}>
          <button onClick={clearCreatorFilter} className={styles.clearFilterButton}>
            <svg height="inherit" width="inherit" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 492 492" xmlSpace="preserve">
              <path d="M300.188,246L484.14,62.04c5.06-5.064,7.852-11.82,7.86-19.024c0-7.208-2.792-13.972-7.86-19.028L468.02,7.872 c-5.068-5.076-11.824-7.856-19.036-7.856c-7.2,0-13.956,2.78-19.024,7.856L246.008,191.82L62.048,7.872 c-5.06-5.076-11.82-7.856-19.028-7.856c-7.2,0-13.96,2.78-19.02,7.856L7.872,23.988c-10.496,10.496-10.496,27.568,0,38.052 L191.828,246L7.872,429.952c-5.064,5.072-7.852,11.828-7.852,19.032c0,7.204,2.788,13.96,7.852,19.028l16.124,16.116 c5.06,5.072,11.824,7.856,19.02,7.856c7.208,0,13.968-2.784,19.028-7.856l183.96-183.952l183.952,183.952 c5.068,5.072,11.824,7.856,19.024,7.856h0.008c7.204,0,13.96-2.784,19.028-7.856l16.12-16.116 c5.06-5.064,7.852-11.824,7.852-19.028c0-7.204-2.792-13.96-7.852-19.028L300.188,246z"></path>
            </svg>
          </button>
          <span>Creator: {creatorFilter}</span>
        </div>
      )}
      <div className={styles.resultsGrid}>
        {filteredResults.map((item) => (
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
              <span 
                className={styles.ownerAddress}
                onClick={() => {
                  setCreatorFilter(selectedMeme.owner);
                  setSelectedMeme(null);
                }}
                role="button"
                tabIndex={0}
              >
                Creator: {selectedMeme.owner}
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
