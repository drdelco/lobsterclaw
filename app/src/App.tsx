import { useState } from 'react';
import { Box, Group, Title, Text, Paper, Stack } from '@mantine/core';
import { IconRobot, IconFileText, IconTerminal2, IconSettings } from '@tabler/icons-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { InstancesPage } from '@/pages/InstancesPage';
import { CronJobsPage } from '@/pages/CronJobsPage';
import { ChatPage } from '@/pages/ChatPage';
import { CostsPage } from '@/pages/CostsPage';

// Placeholder page component
interface PlaceholderPageProps {
  title: string;
  icon: React.ElementType;
}

function PlaceholderPage({ title, icon: Icon }: PlaceholderPageProps) {
  return (
    <Box p="xl">
      <Title order={2} mb="md">{title}</Title>
      <Paper p="xl" radius="md" withBorder>
        <Stack align="center" gap="md" py="xl">
          <Icon size={48} style={{ opacity: 0.5 }} />
          <Text c="dimmed">Próximamente...</Text>
        </Stack>
      </Paper>
    </Box>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('instances');

  const handleLogout = () => {
    // TODO: Implement logout
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
        return <PlaceholderPage title="Gestión de LLMs" icon={IconRobot} />;
      case 'config':
        return <PlaceholderPage title="Configuración" icon={IconFileText} />;
      case 'terminal':
        return <PlaceholderPage title="Terminal SSH" icon={IconTerminal2} />;
      case 'settings':
        return <PlaceholderPage title="Ajustes" icon={IconSettings} />;
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
