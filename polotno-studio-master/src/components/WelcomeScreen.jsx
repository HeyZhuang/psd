import React from 'react';
import styled from 'polotno/utils/styled';

const WelcomeContainer = styled('div')`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 400ms ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const WelcomeCard = styled('div')`
  max-width: 600px;
  width: 90%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: slideInUp 500ms cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Logo = styled('div')`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #3276FF 0%, #1764EA 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
  box-shadow: 0 12px 32px rgba(50, 118, 255, 0.3);
  animation: logoFloat 3s ease-in-out infinite;

  @keyframes logoFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

const Title = styled('h1')`
  font-size: 32px;
  font-weight: 700;
  color: #212121;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled('p')`
  font-size: 16px;
  color: #757575;
  margin: 0 0 32px 0;
  line-height: 1.6;
`;

const Features = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 32px 0;
`;

const FeatureItem = styled('div')`
  padding: 16px;
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  border-radius: 12px;
  border: 1px solid #e5e5e5;
`;

const FeatureIcon = styled('div')`
  font-size: 24px;
  margin-bottom: 8px;
`;

const FeatureLabel = styled('div')`
  font-size: 12px;
  font-weight: 600;
  color: #616161;
`;

const ButtonGroup = styled('div')`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 32px;
`;

const Button = styled('button')`
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

  &.primary {
    background: linear-gradient(135deg, #3276FF 0%, #1764EA 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(50, 118, 255, 0.3);
  }

  &.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(50, 118, 255, 0.4);
  }

  &.secondary {
    background: white;
    color: #616161;
    border: 1px solid #e5e5e5;
  }

  &.secondary:hover {
    background: #f5f5f5;
    border-color: #bdbdbd;
  }
`;

export const WelcomeScreen = ({ onStart, onOpenTemplate }) => {
  return (
    <WelcomeContainer>
      <WelcomeCard>
        <Logo>🎨</Logo>
        <Title>Welcome to PSD Studio</Title>
        <Subtitle>
          Professional design editor with advanced PSD import capabilities
        </Subtitle>

        <Features>
          <FeatureItem>
            <FeatureIcon>📋</FeatureIcon>
            <FeatureLabel>Smart Layers</FeatureLabel>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>✨</FeatureIcon>
            <FeatureLabel>Text Effects</FeatureLabel>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>🎯</FeatureIcon>
            <FeatureLabel>Pixel Perfect</FeatureLabel>
          </FeatureItem>
        </Features>

        <ButtonGroup>
          <Button className="primary" onClick={onStart}>
            Start Creating
          </Button>
          <Button className="secondary" onClick={onOpenTemplate}>
            Browse Templates
          </Button>
        </ButtonGroup>
      </WelcomeCard>
    </WelcomeContainer>
  );
};

// Empty State Component
export const EmptyState = ({ icon = '📄', title, description, actionLabel, onAction }) => {
  return (
    <EmptyContainer>
      <EmptyIcon>{icon}</EmptyIcon>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
      {actionLabel && onAction && (
        <EmptyButton onClick={onAction}>{actionLabel}</EmptyButton>
      )}
    </EmptyContainer>
  );
};

const EmptyContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  min-height: 400px;
`;

const EmptyIcon = styled('div')`
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.6;
  animation: floatIcon 3s ease-in-out infinite;

  @keyframes floatIcon {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

const EmptyTitle = styled('h3')`
  font-size: 20px;
  font-weight: 600;
  color: #424242;
  margin: 0 0 12px 0;
`;

const EmptyDescription = styled('p')`
  font-size: 14px;
  color: #757575;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 0 24px 0;
`;

const EmptyButton = styled('button')`
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #3276FF 0%, #1764EA 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 300ms ease;
  box-shadow: 0 4px 12px rgba(50, 118, 255, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(50, 118, 255, 0.4);
  }
`;
