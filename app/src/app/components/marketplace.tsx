'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import WebApp from '@twa-dev/sdk';
import {
  MainButton,
  SecondaryButton,
  BottomBar,
  BackButton
} from '@twa-dev/sdk/react';

import styles from './marketplace.module.css';

const POPULAR_TEMPLATES = [
  { id: 'pepe', src: '/templates/template-pepe.png', alt: 'Pepe' },
  { id: 'cat', src: '/templates/template-cat.png', alt: 'Grumpy Cat' },
  { id: 'doge', src: '/templates/template-doge.png', alt: 'Doge' },
  { id: 'rage', src: '/templates/template-rage.png', alt: 'Rage Comic' },
  { id: 'troll', src: '/templates/template-troll.png', alt: 'Troll Face' },
  { id: 'elon', src: '/templates/template-elon.png', alt: 'Elon' },
  { id: 'frog', src: '/templates/template-yao.png', alt: 'Yao Ming' },
];

const ITEMS_PER_PAGE = 15;

interface Meme {
  _id: string;
  content_url: string;
  description: string;
  mint_price: number;
  tags: string[];
  creator: string;
}

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Meme[]>([]);
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [creatorFilter, setCreatorFilter] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

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

  const handleBuyAndReturnClick = async (meme: Meme) => {
    await handleBuyClick(meme);

    WebApp.switchInlineQuery('');
  };

  const handleBuyClick = async (meme: Meme) => {
    const response = await fetch('/api/meme/mint', {
      method: 'POST',
      body: JSON.stringify({
        memeId: meme._id
      })
    });
    const data = await response.json();

    if (!data.success) {
      console.error('Error buying meme:', data.error);
      return;
    };

    setSelectedMeme(null);
  };

  useEffect(() => {
    console.log('WebApp.initDataUnsafe', WebApp.initDataUnsafe);
    const debounceTimer = setTimeout(async () => {
      setResults([]);
      setPage(0);
      setHasMore(true);
      
      try {
        setIsLoading(true);
        // const response = await MemeApi.searchMemes(searchTerm, 0, ITEMS_PER_PAGE, selectedTags);

        const response = await fetch(`/api/meme/filter?creator=${creatorFilter}&tags=${selectedTags.join(',')}&description=${searchTerm}&skip=${page * ITEMS_PER_PAGE}&limit=${ITEMS_PER_PAGE}`);
        const data = await response.json();

        console.log('memesfilter', data);
        if (data.success) {
          setResults(data.data);
          // setHasMore(data.hasMore);
          setPage(1);
        };
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedTags]);

  // Load more items
  const loadMoreItems = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/meme/filter?creator=${creatorFilter}&tags=${selectedTags.join(',')}&description=${searchTerm}&skip=${page * ITEMS_PER_PAGE}&limit=${ITEMS_PER_PAGE}`);
      const data = await response.json();

      if (data.success) {
        setResults(prev => [...prev, ...data.data]);
        setHasMore(data.hasMore);
        setPage(prev => prev + 1);
      };
    } catch (error) {
      console.error('Loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, searchTerm, selectedTags]);

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
    ? results.filter(meme => meme.creator === creatorFilter) 
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
            key={item._id} 
            className={styles.resultItem}
            onClick={() => handleMemeClick(item)}
            role="button"
            tabIndex={0}
          >
            <Image 
              src={item.content_url} 
              alt={item.description || 'Meme'} 
              width={96} 
              height={96}
              className={styles.memeImage}
            />
            <div className={styles.priceTag}>
              {item.mint_price}
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
              src={selectedMeme.content_url}
              alt={selectedMeme.description || 'Meme'}
              width={400}
              height={400}
              className={styles.modalImage}
            />
            <div className={styles.modalInfo}>
              <span 
                className={styles.ownerAddress}
                onClick={() => {
                  setCreatorFilter(selectedMeme.creator);
                  setSelectedMeme(null);
                }}
                role="button"
                tabIndex={0}
              >
                Creator: {selectedMeme.creator}
              </span>
              <div className={styles.modalPrice}>
                {selectedMeme.mint_price}
                <Image 
                  src="/token/token.svg"
                  alt="Token"
                  width={17}
                  height={17}
                />
              </div>
              <BottomBar bgColor='#D9DADB'>
                <MainButton text="Buy and return chat" color='#e29cff' textColor='#510e2a' onClick={() => handleBuyAndReturnClick(selectedMeme)}/>
                <SecondaryButton text="Buy" color='#D0D0D0' textColor='#510e2a' onClick={() => handleBuyClick(selectedMeme)}/>
              </BottomBar>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
