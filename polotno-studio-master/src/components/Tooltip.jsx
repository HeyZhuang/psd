import React, { useState } from 'react';
import styled from 'polotno/utils/styled';

const TooltipContainer = styled('div')`
  position: relative;
  display: inline-flex;
`;

const TooltipContent = styled('div')`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: rgba(33, 33, 33, 0.95);
  color: white;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10000;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 200ms ease, transform 200ms ease;
  transform: translateX(-50%) ${props => props.show ? 'translateY(0)' : 'translateY(4px)'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(33, 33, 33, 0.95);
  }

  ${props => props.shortcut && `
    display: flex;
    gap: 12px;
    align-items: center;
  `}
`;

const TooltipShortcut = styled('span')`
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  font-family: monospace;
`;

export const Tooltip = ({ content, shortcut, children, delay = 300 }) => {
  const [show, setShow] = useState(false);
  const timeoutRef = React.useRef(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(false);
  };

  return (
    <TooltipContainer
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <TooltipContent show={show} shortcut={shortcut}>
        <span>{content}</span>
        {shortcut && <TooltipShortcut>{shortcut}</TooltipShortcut>}
      </TooltipContent>
    </TooltipContainer>
  );
};

// Premium Loading Spinner
export const LoadingSpinner = ({ size = 40, color = '#3276FF' }) => {
  return (
    <SpinnerContainer style={{ width: size, height: size }}>
      <SpinnerRing style={{ borderTopColor: color }} />
      <SpinnerRing style={{ borderTopColor: color, animationDelay: '150ms' }} />
      <SpinnerRing style={{ borderTopColor: color, animationDelay: '300ms' }} />
    </SpinnerContainer>
  );
};

const SpinnerContainer = styled('div')`
  position: relative;
  display: inline-block;
`;

const SpinnerRing = styled('div')`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Progress Bar
export const ProgressBar = ({ progress = 0, label, showPercentage = true }) => {
  return (
    <ProgressContainer>
      {label && <ProgressLabel>{label}</ProgressLabel>}
      <ProgressTrack>
        <ProgressFill progress={progress}>
          <ProgressGlow />
        </ProgressFill>
      </ProgressTrack>
      {showPercentage && <ProgressText>{Math.round(progress)}%</ProgressText>}
    </ProgressContainer>
  );
};

const ProgressContainer = styled('div')`
  width: 100%;
`;

const ProgressLabel = styled('div')`
  font-size: 13px;
  font-weight: 600;
  color: #616161;
  margin-bottom: 8px;
`;

const ProgressTrack = styled('div')`
  width: 100%;
  height: 6px;
  background: #e5e5e5;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled('div')`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #3276FF 0%, #1764EA 100%);
  border-radius: 3px;
  transition: width 300ms ease;
  position: relative;
  overflow: hidden;
`;

const ProgressGlow = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: progressShine 1.5s ease-in-out infinite;

  @keyframes progressShine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ProgressText = styled('div')`
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #3276FF;
  text-align: right;
`;

// Loading Overlay
export const LoadingOverlay = ({ message = 'Loading...', progress }) => {
  return (
    <OverlayContainer>
      <OverlayContent>
        <LoadingSpinner size={48} />
        <LoadingMessage>{message}</LoadingMessage>
        {progress !== undefined && (
          <ProgressBar progress={progress} showPercentage />
        )}
      </OverlayContent>
    </OverlayContainer>
  );
};

const OverlayContainer = styled('div')`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(250, 250, 250, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 200ms ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const OverlayContent = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 48px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.1);
  min-width: 300px;
`;

const LoadingMessage = styled('div')`
  font-size: 16px;
  font-weight: 600;
  color: #424242;
`;
