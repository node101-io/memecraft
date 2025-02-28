'use client';

import { useState, useEffect } from 'react';
import styles from './craft.module.css';
import { MainButton, SecondaryButton } from '@twa-dev/sdk/react';
import { BottomBar } from '@twa-dev/sdk/react';
import Image from 'next/image';
import WebApp from '@twa-dev/sdk';

interface Template {
  id: string;
  src: string;
};

interface GeneratedMeme {
  content_url: string;
  description: string;
}

const templates: Template[] = [
  { id: '100777631', src: '/templates/100777631.jpg' },
  { id: '101288', src: '/templates/101288.jpg' },
  { id: '101470', src: '/templates/101470.jpg' },
  { id: '102156234', src: '/templates/102156234.jpg' },
  { id: '1035805', src: '/templates/1035805.jpg' },
  { id: '110163934', src: '/templates/110163934.jpg' },
  { id: '112126428', src: '/templates/112126428.jpg' },
  { id: '114585149', src: '/templates/114585149.jpg' },
  { id: '119139145', src: '/templates/119139145.jpg' },
  { id: '123999232', src: '/templates/123999232.jpg' },
  { id: '124055727', src: '/templates/124055727.jpg' },
  { id: '124822590', src: '/templates/124822590.jpg' },
  { id: '129242436', src: '/templates/129242436.jpg' },
  { id: '131087935', src: '/templates/131087935.jpg' },
  { id: '131940431', src: '/templates/131940431.jpg' },
  { id: '134797956', src: '/templates/134797956.jpg' },
  { id: '135256802', src: '/templates/135256802.jpg' },
  { id: '135678846', src: '/templates/135678846.jpg' },
  { id: '14371066', src: '/templates/14371066.jpg' },
  { id: '148909805', src: '/templates/148909805.jpg' },
  { id: '155067746', src: '/templates/155067746.jpg' },
  { id: '161865971', src: '/templates/161865971.jpg' },
  { id: '175540452', src: '/templates/175540452.jpg' },
  { id: '180190441', src: '/templates/180190441.jpg' },
  { id: '181913649', src: '/templates/181913649.jpg' },
  { id: '188390779', src: '/templates/188390779.jpg' },
  { id: '196652226', src: '/templates/196652226.jpg' },
  { id: '217743513', src: '/templates/217743513.jpg' },
  { id: '222403160', src: '/templates/222403160.jpg' },
  { id: '27813981', src: '/templates/27813981.jpg' },
  { id: '28251713', src: '/templates/28251713.jpg' },
  { id: '4087833', src: '/templates/4087833.jpg' },
  { id: '5496396', src: '/templates/5496396.jpg' },
  { id: '55311130', src: '/templates/55311130.jpg' },
  { id: '563423', src: '/templates/563423.jpg' },
  { id: '61520', src: '/templates/61520.jpg' },
  { id: '61532', src: '/templates/61532.jpg' },
  { id: '61539', src: '/templates/61539.jpg' },
  { id: '61544', src: '/templates/61544.jpg' },
  { id: '61546', src: '/templates/61546.jpg' },
  { id: '61579', src: '/templates/61579.jpg' },
  { id: '6235864', src: '/templates/6235864.jpg' },
  { id: '79132341', src: '/templates/79132341.jpg' },
  { id: '80707627', src: '/templates/80707627.jpg' },
  { id: '8072285', src: '/templates/8072285.jpg' },
  { id: '84341851', src: '/templates/84341851.jpg' },
  { id: '87743020', src: '/templates/87743020.jpg' },
  { id: '89370399', src: '/templates/89370399.jpg' },
  { id: '91538330', src: '/templates/91538330.jpg' },
  { id: '91545132', src: '/templates/91545132.jpg' }
];

function TemplateGrid({ onSelect }: { onSelect: (template: Template) => void }) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
    onSelect(template);
  };

  return (
    <div className={styles.gridContainer}>
      {templates.map((template) => (
        <div 
          key={template.id} 
          className={`${styles.templateItem} ${selectedTemplate?.id === template.id ? styles.selected : ''}`}
          onClick={() => handleTemplateClick(template)}
        >
          <Image
            src={template.src}
            alt={`Template ${template.id}`}
            width={150}
            height={150}
            className={styles.templateImage}
          />
        </div>
      ))}
    </div>
  );
};

const FREE_GENERATIONS_PER_DAY = 5;
const PAID_GENERATION_COST = 0.5;

export default function Craft({ onMemeCreated }: { onMemeCreated?: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [memeType, setMemeType] = useState('ai');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMeme, setGeneratedMeme] = useState<GeneratedMeme | null>(null);
  const [mintPrice, setMintPrice] = useState<number>(0.1);
  const [freeGenerationsLeft, setFreeGenerationsLeft] = useState<number>(FREE_GENERATIONS_PER_DAY);

  useEffect(() => {
    // Check remaining free generations on component mount
    WebApp.CloudStorage.getItem('last-generation-date', (error, lastDate) => {
      if (error) return console.error(error);

      const today = new Date().toDateString();
      
      if (lastDate !== today) {
        // Reset counter for new day
        WebApp.CloudStorage.setItem('free-generations-left', FREE_GENERATIONS_PER_DAY.toString(), () => {
          setFreeGenerationsLeft(FREE_GENERATIONS_PER_DAY);
        });
        WebApp.CloudStorage.setItem('last-generation-date', today);
      } else {
        // Get remaining generations for today
        WebApp.CloudStorage.getItem('free-generations-left', (error, remaining) => {
          if (error) return console.error(error);
          setFreeGenerationsLeft(remaining ? parseInt(remaining) : 0);
        });
      }
    });
  }, []);

  const handleGenerateClick = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/meme/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('chopin-jwt-token')}`
        },
        body: JSON.stringify({
          prompt,
          templateId: selectedTemplate?.id,
          mode: memeType,
          freeGenerationsLeft
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        WebApp.showPopup({
          title: 'Error',
          message: data.error === 'Insufficient balance' ? 
            'You need 0.5 tokens to generate a meme.' : 
            'Failed to generate meme.',
          buttons: [{ text: 'OK', type: 'default' }]
        });
        return;
      }

      setGeneratedMeme({
        content_url: data.data.content_url,
        description: data.data.description
      });

      // Update free generations count if it was a free generation
      if (freeGenerationsLeft > 0) {
        const newCount = freeGenerationsLeft - 1;
        WebApp.CloudStorage.setItem('free-generations-left', newCount.toString(), () => {
          setFreeGenerationsLeft(newCount);
        });
      }

      // Refresh user data to update balance
      onMemeCreated?.();

    } catch (error) {
      console.error('Failed to generate meme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/meme/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('chopin-jwt-token')}`
        },
        body: JSON.stringify({
          content_url: generatedMeme?.content_url,
          description: generatedMeme?.description,
          mint_price: mintPrice
        }),
      });

      const data = await response.json();
      
      if (!data.success)
        throw new Error(data.error);

      WebApp.showPopup({
        title: 'Success! 🎉',
        message: 'You can see your meme in your library.',
        buttons: [
          { text: 'OK', type: 'default' }
        ]
      });

      setGeneratedMeme(null);
      setMintPrice(0);
      setPrompt('');
      setSelectedTemplate(null);

      onMemeCreated?.();

    } catch (error) {
      console.error('Failed to create meme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h3 className={styles.subtitle}>
        CHO-PILOT
        <span className={styles.generationsLeft}>
          {freeGenerationsLeft > 0 ? 
            `${freeGenerationsLeft} free generations left today` : 
            `Paid generation (${PAID_GENERATION_COST} tokens)`}
        </span>
      </h3>
      <div className={styles.inputWrapper}>
        <textarea
          placeholder="AI struggling to understand human emotions, caption: 'error 404: emotions not found'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={styles.promptInput}
          rows={3}
        />
        <button 
          className={styles.submitButton} 
          // onClick={() => handleGenerateClick()}
        >
          <svg viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule='evenodd' clipRule={'evenodd'} d="M10.1548 20.2012C15.6776 20.2012 20.1548 15.724 20.1548 10.2012C20.1548 4.67832 15.6776 0.201172 10.1548 0.201172C4.63194 0.201172 0.154785 4.67832 0.154785 10.2012C0.154785 15.724 4.63194 20.2012 10.1548 20.2012ZM10.6189 5.47066C10.4977 5.34414 10.33 5.2726 10.1548 5.2726C9.97954 5.2726 9.8119 5.34414 9.69065 5.47066L6.11922 9.19737C5.87357 9.4537 5.88223 9.86065 6.13856 10.1063C6.3949 10.352 6.80184 10.3433 7.04749 10.087L9.51193 7.51538V14.4869C9.51193 14.8419 9.79974 15.1297 10.1548 15.1297C10.5098 15.1297 10.7976 14.8419 10.7976 14.4869V7.51538L13.2621 10.087C13.5077 10.3433 13.9147 10.352 14.171 10.1063C14.4273 9.86065 14.436 9.4537 14.1903 9.19737L10.6189 5.47066Z" fill="#979797"/>
          </svg>
        </button>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="memeType"
              value="ai"
              checked={memeType === 'ai'}
              onChange={(e) => setMemeType(e.target.value)}
            />
            <span className={styles.checkmark}></span>
            AI-Suggested
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="memeType"
              value="template"
              checked={memeType === 'template'}
              onChange={(e) => setMemeType(e.target.value)}
            />
            <span className={styles.checkmark}></span>
            Choose Template
          </label>
        </div>
        {memeType === 'template' && (
          <TemplateGrid onSelect={setSelectedTemplate} />
        )}
      </div>
      
      {generatedMeme && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setGeneratedMeme(null)}
        >
          <div 
            className={styles.modal}
            onClick={e => e.stopPropagation()}
          >
            <Image 
              src={generatedMeme.content_url}
              alt={generatedMeme.description}
              width={400}
              height={400}
              className={styles.modalImage}
            />
            <div className={styles.modalInfo}>
              <span className={styles.mintPriceLabel}>Mint Price:</span>
              <div className={styles.mintPriceWrapper}>
                <input
                  type="number"
                  placeholder="Enter mint price"
                  value={mintPrice}
                  onChange={(e) => setMintPrice(Number(e.target.value))}
                  className={styles.mintPriceInput}
                  min="0"
                  step="1"
                />
                <Image 
                  src="/token/token.svg"
                  alt="Token"
                  width={17}
                  height={17}
                  className={styles.tokenIcon}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomBar bgColor='#D9DADB'>
        {!generatedMeme ? (
          <MainButton
            text={isLoading ? 'Generating...' : 'Generate'}
            color='#e29cff' 
            textColor='#510e2a'
            onClick={() => handleGenerateClick()}
            disabled={isLoading || (memeType === 'template' && !selectedTemplate)}
          />
        ) : (
          <>
            <MainButton
              text="Mint Meme"
              color='#e29cff' 
              textColor='#510e2a'
              onClick={() => handleCreateClick()}
              disabled={isLoading || mintPrice <= 0}
            />
            <SecondaryButton 
              text="Regenerate"
              color='#D0D0D0' 
              textColor='#510e2a' 
              onClick={() => {
                setGeneratedMeme(null);
                handleGenerateClick();
              }}
            />
          </>
        )}
      </BottomBar>
    </>
  );
};
