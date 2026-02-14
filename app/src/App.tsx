import { useState } from 'react';
import { Box, Group } from '@mantine/core';
import { Sidebar } from '@/components/layout/Sidebar';
import { InstancesPage } from '@/pages/InstancesPage';
import { CronJobsPage } from '@/pages/CronJobsPage';
import { ChatPage } from '@/pages/ChatPage';
import { CostsPage } from '@/pages/CostsPage';
import { LLMsPage } from '@/pages/LLMsPage';
import { ConfigPage } from '@/pages/ConfigPage';
import { TerminalPage } from '@/pages/TerminalPage';
import { SettingsPage } from '@/pages/SettingsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('instances');

  const handleLogout = () => {
    // TODO: Implement logout with Firebase
    console.log('Logout');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'instances':
        return <InstancesPage />;
      case 'cron':
        return <CronJobsPage />;
      case 'chat':
        return <ChatPage />;
      case 'costs':
        return <CostsPage />;
      case 'llms':
        return <LLMsPage />;
      case 'config':
        return <ConfigPage />;
      case 'terminal':
        return <TerminalPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <InstancesPage />;
    }
  };

  return (
    <Group gap={0} align="stretch" style={{ minHeight: '100vh' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      <Box style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--mantine-color-dark-9)' }}>
        {renderPage()}
      </Box>
    </Group>
  );
}
