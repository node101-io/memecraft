'use client';

import { useEffect, useState } from 'react';
import styles from './library.module.css';
import Image from 'next/image';
import WebApp from '@twa-dev/sdk';
import {
  MainButton,
  SecondaryButton,
  BottomBar
} from '@twa-dev/sdk/react';

import { PopulatedUser, Meme } from '../page-client';

const FIXED_ITEMS_COUNT = 6;

export default function Library({ user }: { user: PopulatedUser; }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isNameAvailable, setIsNameAvailable] = useState(true);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isMintingName, setIsMintingName] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNameButtons, setShowNameButtons] = useState(false);
  const [isValidFormat, setIsValidFormat] = useState(true);

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

  const validateNameFormat = (name: string): boolean => {
    // Allow only alphanumeric characters and underscores
    const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
    return alphanumericRegex.test(name);
  };

  const checkNameAvailability = async (name: string) => {
    if (!name.trim()) {
      setIsNameAvailable(true);
      setErrorMessage('');
      setIsValidFormat(true);
      return;
    }

    // Check if name format is valid
    const isValid = validateNameFormat(name);
    setIsValidFormat(isValid);
    
    if (!isValid) {
      setErrorMessage('Name can only contain letters, numbers, and underscores');
      return;
    }

    setIsCheckingName(true);
    try {
      const response = await fetch(`/api/name/taken?name=${encodeURIComponent(name)}`);
      const data = await response.json();
      
      setIsNameAvailable(data.success);
      setErrorMessage(data.success ? '' : 'Name already taken');
    } catch (error) {
      console.error('Error checking name availability:', error);
      setErrorMessage('Error checking name');
      setIsNameAvailable(false);
    } finally {
      setIsCheckingName(false);
    }
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameInput(value);
    
    // Debounce name availability check
    const timeoutId = setTimeout(() => {
      checkNameAvailability(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const mintName = async () => {
    if (!nameInput.trim() || !isNameAvailable || isCheckingName || !isValidFormat) {
      return;
    }

    setIsMintingName(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/name/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('chopin-jwt-token')}`
        },
        body: JSON.stringify({ name: nameInput })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update UI to show the new name
        WebApp.showPopup({
          title: 'Success!',
          message: `Your name has been set to: ${data.data}.meme`,
        });
        
        // Clear input field after successful mint
        setNameInput('');
        setShowNameButtons(false);
        
        // Force reload to update user data
        window.location.reload();
      } else {
        // Map error codes to user-friendly messages
        const errorMessages = {
          'name_already_taken': 'This name is already taken. Please try another one.',
          'bad_request': 'Please enter a valid name using only letters, numbers, and underscores.',
          'database_error': 'There was a problem saving your name. Please try again later.',
          'insufficient_balance': 'You don\'t have enough balance to mint this name.',
          'user_not_found': 'User account not found. Please refresh the page and try again.'
        };
        
        // Use the mapped error message or a default one
        setErrorMessage(errorMessages[data.error as keyof typeof errorMessages] || 'Failed to set name. Please try again later.');
      }
    } catch (error) {
      console.error('Error minting name:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsMintingName(false);
    }
  };

  const handleNameFocus = () => {
    if (!user.name) {
      setShowNameButtons(true);
    }
  };

  const handleCancelName = () => {
    setShowNameButtons(false);
    setNameInput('');
    setErrorMessage('');
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
        {user.name && (
          <span className={styles.userName}>{user.name}.meme</span>
        )}
      </div>

      {!user.name && (
        <div className={styles.nameSection}>
          <div className={styles.nameMintingContainer}>
            <h3 className={styles.nameMintingTitle}>Get your name!</h3>
            <div className={styles.nameInputWrapper}>
              <input
                type="text"
                placeholder="node101"
                value={nameInput}
                onChange={handleNameInputChange}
                onFocus={handleNameFocus}
                className={`${styles.nameInput} ${(!isNameAvailable || !isValidFormat) ? styles.nameInputError : ''}`}
                disabled={isMintingName}
              />
              <span className={styles.nameTld}>.meme</span>
              {isCheckingName && <div className={styles.nameCheckingSpinner}></div>}
            </div>
            {errorMessage && <div className={styles.nameErrorMessage}>{errorMessage}</div>}
          </div>
        </div>
      )}

      <h3 className={styles.sectionTitle}>RECENTLY ADDED</h3>
      {renderMemeGrid(recentMemes, 'recent')}

      <h3 className={styles.sectionTitle}>LAST USED</h3>
      {renderMemeGrid(lastUsedMemes, 'used')}

      <h3 className={styles.sectionTitle}>ALL</h3>
      {renderMemeGrid(filteredMemes, 'all')}

      {showNameButtons && !user.name && (
        <BottomBar bgColor='#D9DADB'>
          <MainButton
            text={isMintingName ? 'Setting name...' : 'Set Name'}
            color='#e29cff' 
            textColor='#510e2a'
            onClick={mintName}
            disabled={!isNameAvailable || !nameInput.trim() || isMintingName || isCheckingName || !isValidFormat}
          />
          <SecondaryButton 
            text="Cancel"
            color='#D0D0D0' 
            textColor='#510e2a' 
            onClick={handleCancelName}
          />
        </BottomBar>
      )}
    </>
  );
}
