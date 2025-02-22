'use client';

import { useState, useEffect } from 'react';
import styles from './marketplace.module.css';
import Image from 'next/image';

const POPULAR_TEMPLATES = [
  { id: 'pepe', src: '/templates/template-pepe.png', alt: 'Pepe' },
  { id: 'cat', src: '/templates/template-cat.png', alt: 'Grumpy Cat' },
  { id: 'doge', src: '/templates/template-doge.png', alt: 'Doge' },
  { id: 'rage', src: '/templates/template-rage.png', alt: 'Rage Comic' },
  { id: 'troll', src: '/templates/template-troll.png', alt: 'Troll Face' },
  { id: 'elon', src: '/templates/template-elon.png', alt: 'Elon' },
  { id: 'yao', src: '/templates/template-yao.png', alt: 'Yao Ming' },
];

const MOCK_RESULTS = Array(15).fill(null).map((_, index) => ({
  id: `meme-${index}`,
  imageUrl: '/memes/meme-1.png',
  title: `Result ${index + 1}`,
  price: '0.11',
  owner: '0x1234...5678' // Mock owner address
}));

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(MOCK_RESULTS);
  const [selectedMeme, setSelectedMeme] = useState<any>(null);

  const handleTemplateClick = (alt: string) => {
    setSearchTerm(alt);
  };

  const handleMemeClick = (meme: any) => {
    setSelectedMeme(meme);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsLoading(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setResults(MOCK_RESULTS.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
          ));
        } catch (error) {
          console.error('Arama hatası:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // İlk yüklemede ve boş aramada loading göstermiyor
        setResults(MOCK_RESULTS);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

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
        {isLoading ? (
          // Loading skeletons
          Array(15).fill(null).map((_, index) => (
            <div key={`skeleton-${index}`} className={`${styles.resultItem} ${styles.skeleton}`}>
              <div className={styles.skeletonPriceTag}></div>
            </div>
          ))
        ) : results.length > 0 ? (
          results.map((item: any) => (
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
          ))
        ) : (
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
};
