import { useState } from 'react';
import { Box, Group, Center, Loader } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Sidebar, MobileHeader } from '@/components/layout/Sidebar';
import { InstancesPage } from '@/pages/InstancesPage';
import { CronJobsPage } from '@/pages/CronJobsPage';
import { CostsPage } from '@/pages/CostsPage';
import { LLMsPage } from '@/pages/LLMsPage';
import { ConfigPage } from '@/pages/ConfigPage';
import { TerminalPage } from '@/pages/TerminalPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { useAuthState } from '@/hooks/useAuth';

export default function App() {
  const [currentPage, setCurrentPage] = useState('instances');
  const [sidebarOpened, { toggle: toggleSidebar }] = useDisclosure(false);
  const { user, loading, signOut } = useAuthState();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleLogout = async () => {
    await signOut();
  };

  // Loading state
  if (loading) {
    return (
      <Center h="100vh" bg="dark.9">
        <Loader size="lg" />
      </Center>
    );
  }

  // Not authenticated - show login
  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'instances':
        return <InstancesPage />;
      case 'cron':
        return <CronJobsPage />;
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
    <Group gap={0} align="stretch" wrap="nowrap" style={{ minHeight: '100vh' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        userEmail={user.email || undefined}
        userPhoto={user.photoURL || undefined}
        opened={sidebarOpened}
        onToggle={toggleSidebar}
      />
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mantine-color-dark-9)', height: '100vh', overflow: 'hidden' }}>
        {isMobile && (
          <MobileHeader 
            opened={sidebarOpened} 
            onToggle={toggleSidebar}
            currentPage={currentPage}
          />
        )}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {renderPage()}
        </Box>
      </Box>
    </Group>
  );
}
