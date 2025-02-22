'use client';

import { useState } from 'react';
import styles from './craft.module.css';

export default function Craft() {
  const [prompt, setPrompt] = useState('');

  return (
    <>
      <h3 className={styles.subtitle}>
        CHO-PILOT
      </h3>
      <div className={styles.inputWrapper}>
        <textarea
          placeholder="AI struggling to understand human emotions, caption: 'error 404: emotions not found'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={styles.promptInput}
          rows={3}
        />
        <button className={styles.submitButton}>
          <svg viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule='evenodd' clipRule={'evenodd'} d="M10.1548 20.2012C15.6776 20.2012 20.1548 15.724 20.1548 10.2012C20.1548 4.67832 15.6776 0.201172 10.1548 0.201172C4.63194 0.201172 0.154785 4.67832 0.154785 10.2012C0.154785 15.724 4.63194 20.2012 10.1548 20.2012ZM10.6189 5.47066C10.4977 5.34414 10.33 5.2726 10.1548 5.2726C9.97954 5.2726 9.8119 5.34414 9.69065 5.47066L6.11922 9.19737C5.87357 9.4537 5.88223 9.86065 6.13856 10.1063C6.3949 10.352 6.80184 10.3433 7.04749 10.087L9.51193 7.51538V14.4869C9.51193 14.8419 9.79974 15.1297 10.1548 15.1297C10.5098 15.1297 10.7976 14.8419 10.7976 14.4869V7.51538L13.2621 10.087C13.5077 10.3433 13.9147 10.352 14.171 10.1063C14.4273 9.86065 14.436 9.4537 14.1903 9.19737L10.6189 5.47066Z" fill="#979797"/>
          </svg>
        </button>
      </div>
    </>
  );
}
