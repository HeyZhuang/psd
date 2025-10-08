import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Navbar,
  Alignment,
  AnchorButton,
  NavbarDivider,
  EditableText,
  Popover,
  Button,
  Icon,
} from '@blueprintjs/core';

import FaGithub from '@meronex/icons/fa/FaGithub';
import FaDiscord from '@meronex/icons/fa/FaDiscord';
import FaTwitter from '@meronex/icons/fa/FaTwitter';
import BiCodeBlock from '@meronex/icons/bi/BiCodeBlock';
import MdcCloudAlert from '@meronex/icons/mdc/MdcCloudAlert';
import MdcCloudCheck from '@meronex/icons/mdc/MdcCloudCheck';
import MdcCloudSync from '@meronex/icons/mdc/MdcCloudSync';
import styled from 'polotno/utils/styled';

import { useProject } from '../project';

import { FileMenu } from './file-menu';
import { DownloadButton } from './download-button';
import { PostProcessButton } from './post-process-button';
import { UserMenu } from './user-menu';
import { CloudWarning } from '../cloud-warning';

const NavbarContainer = styled('div')`
  white-space: nowrap;
  height: 56px;
  display: flex;
  align-items: center;
  background: var(--topbar-bg, #ffffff);
  border-bottom: 1px solid var(--topbar-border, #e5e5e5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  padding: 0 16px;

  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
    padding: 0 8px;
  }
`;

const NavInner = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;

  @media screen and (max-width: 500px) {
    display: flex;
  }
`;

const LogoSection = styled('div')`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 24px;
`;

const Logo = styled('div')`
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-600, #1764EA);
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: var(--primary-700, #0D4FC2);
  }

  @media screen and (max-width: 768px) {
    font-size: 16px;
  }
`;

const LogoIcon = styled('svg')`
  width: 24px;
  height: 24px;

  @media screen and (max-width: 768px) {
    width: 20px;
    height: 20px;
  }
`;

const ProjectNameSection = styled('div')`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 200ms ease;
  max-width: 300px;

  &:hover {
    background: var(--state-hover-bg, #f5f5f5);
  }

  @media screen and (max-width: 768px) {
    max-width: 180px;
  }

  @media screen and (max-width: 480px) {
    max-width: 120px;
  }
`;

const Status = observer(({ project }) => {
  const Icon = !project.cloudEnabled
    ? MdcCloudAlert
    : project.status === 'saved'
    ? MdcCloudCheck
    : MdcCloudSync;
  return (
    <Popover
      content={
        <div style={{ padding: '10px', maxWidth: '300px' }}>
          {!project.cloudEnabled && (
            <CloudWarning style={{ padding: '10px' }} />
          )}
          {project.cloudEnabled && project.status === 'saved' && (
            <>
              You data is saved with{' '}
              <a href="https://puter.com" target="_blank">
                Puter.com
              </a>
            </>
          )}
          {project.cloudEnabled &&
            (project.status === 'saving' || project.status === 'has-changes') &&
            'Saving...'}
        </div>
      }
      interactionKind="hover"
    >
      <div style={{ padding: '0 5px' }}>
        <Icon className="bp5-icon" style={{ fontSize: '25px', opacity: 0.8 }} />
      </div>
    </Popover>
  );
});

export default observer(({ store }) => {
  const project = useProject();

  return (
    <NavbarContainer className="topbar">
      <NavInner>
        {/* Left Section - Logo, File Menu, Project Name */}
        <Navbar.Group align={Alignment.LEFT} style={{ gap: '12px', height: '100%', alignItems: 'center' }}>
          <LogoSection>
            <Logo>
              <LogoIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="currentColor"
                  opacity="0.8"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </LogoIcon>
              <span>PSD Studio</span>
            </Logo>
          </LogoSection>

          <NavbarDivider style={{ height: '24px', margin: '0 8px' }} />

          <FileMenu store={store} project={project} />

          <ProjectNameSection>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H3.5C2.67157 14 2 13.3284 2 12.5V3.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M5 6H11M5 9H9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <EditableText
              value={window.project.name}
              placeholder="Untitled Design"
              onChange={(name) => {
                window.project.name = name;
                window.project.requestSave();
              }}
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary, #212121)',
              }}
            />
          </ProjectNameSection>
        </Navbar.Group>

        {/* Right Section - Actions */}
        <Navbar.Group align={Alignment.RIGHT} style={{ gap: '8px', height: '100%', alignItems: 'center' }}>
          <Status project={project} />
          <NavbarDivider style={{ height: '24px', margin: '0 8px' }} />
          <PostProcessButton store={store} />
          <DownloadButton store={store} />
          <NavbarDivider style={{ height: '24px', margin: '0 8px' }} />
          <UserMenu store={store} project={project} />
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});
