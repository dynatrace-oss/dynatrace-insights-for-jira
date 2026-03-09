import React, { useState, useEffect } from 'react';
import { router } from '@forge/bridge';

// Atlassian design tokens (CSS variables)
// See: https://atlassian.design/foundations/color/design-tokens

const SecurityBanner = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Load the expanded state from localStorage on initial render
  useEffect(() => {
    const storedState = localStorage.getItem('dynatrace-security-banner-expanded');
    if (storedState !== null) {
      setIsExpanded(storedState === 'true');
    }
  }, []);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('dynatrace-security-banner-expanded', String(newState));
  };

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--ds-background-accent-blue-subtlest, #DEEBFF)',
        borderRadius: '3px',
        marginBottom: '24px',
        marginTop: '24px',
        border: '1px solid var(--ds-border-accent-blue, #4C9AFF)',
        transition: 'padding 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ marginRight: '12px', paddingTop: '2px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM12 20C8.73 19.05 6 15.46 6 11.09V6.31L12 4.19L18 6.31V11.09C18 15.46 15.27 19.05 12 20ZM9 10H11V16H13V10H15L12 7L9 10Z" fill="var(--ds-icon-accent-blue, #0052CC)"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{
              margin: '0 0 8px 0',
              color: 'var(--ds-text-accent-blue, #0052CC)',
              fontSize: '16px',
              fontWeight: 600
            }}>
              Security & Privacy Information
            </h3>
            <button
              onClick={toggleExpanded}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}
              aria-label={isExpanded ? 'Collapse security information' : 'Expand security information'}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="var(--ds-icon-accent-blue, #0052CC)"
                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
              >
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
              </svg>
            </button>
          </div>

          {isExpanded && (
            <>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '20px' }}>
                This plugin only communicates with <strong>*.dynatrace.com</strong> domains and the JIRA backend. It does not send any data to other third-party services or external endpoints.
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '20px' }}>
                No usage statistics or analytics are collected. Your API tokens are securely stored in Jira Forge's secure storage system, which provides encryption at rest and in transit.
              </p>
              <p style={{ margin: '0', fontSize: '14px', lineHeight: '20px' }}>
                <a
                  href="#"
                  style={{
                    color: 'var(--ds-link, var(--ds-text-accent-blue, #0052CC))',
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    router.open('https://developer.atlassian.com/platform/forge/runtime-reference/storage-api-secret/');
                  }}
                >
                  Learn more about Jira Forge's secure storage
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityBanner;
