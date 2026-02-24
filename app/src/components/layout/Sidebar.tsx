import { NavLink, Stack, Text, Group, Box, ActionIcon, Tooltip, Avatar, Drawer, Burger } from '@mantine/core';
import {
  IconDeviceDesktop,
  IconClock,
  IconCurrencyDollar,
  IconRobot,
  IconFileText,
  IconTerminal2,
  IconSettings,
  IconLogout,
  IconMoon,
  IconSun,
  IconBrandTelegram,
} from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userEmail?: string;
  userPhoto?: string;
  opened: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: 'instances', label: 'Instancias', icon: IconDeviceDesktop },
  { id: 'cron', label: 'Cron Jobs', icon: IconClock },
  { id: 'costs', label: 'Costes', icon: IconCurrencyDollar },
  { id: 'llms', label: 'LLMs', icon: IconRobot },
  { id: 'config', label: 'Configuración', icon: IconFileText },
  { id: 'terminal', label: 'Terminal', icon: IconTerminal2 },
];

const TELEGRAM_LINK = 'https://t.me/drdelcobot';

function SidebarContent({ 
  currentPage, 
  onNavigate, 
  onLogout, 
  userEmail, 
  userPhoto,
  onClose 
}: Omit<SidebarProps, 'opened' | 'onToggle'> & { onClose?: () => void }) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleNavigate = (page: string) => {
    onNavigate(page);
    onClose?.();
  };

  return (
    <Stack h="100%" gap={0}>
      {/* Logo */}
      <Box p="lg" style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
        <Group gap="sm">
          <Text size="2rem">🦞</Text>
          <Box>
            <Text fw={700} size="lg" c="white">OpenClaw</Text>
            <Text size="xs" c="dimmed">Command Center</Text>
          </Box>
        </Group>
      </Box>

      {/* Navigation */}
      <Stack gap={4} p="md" style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            label={item.label}
            leftSection={<item.icon size={20} stroke={1.5} />}
            active={currentPage === item.id}
            onClick={() => handleNavigate(item.id)}
            variant="filled"
            styles={{
              root: {
                borderRadius: 'var(--mantine-radius-md)',
              },
            }}
          />
        ))}
      </Stack>

      {/* User info */}
      {userEmail && (
        <Box px="md" py="sm" style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}>
          <Group gap="sm">
            <Avatar src={userPhoto} radius="xl" size="sm">
              {userEmail.charAt(0).toUpperCase()}
            </Avatar>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="xs" c="white" truncate>
                {userEmail.split('@')[0]}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {userEmail}
              </Text>
            </Box>
          </Group>
        </Box>
      )}

      {/* Telegram button */}
      <Box px="md" py="sm" style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}>
        <NavLink
          label="Chat con Alvi"
          description="Abrir Telegram"
          leftSection={<IconBrandTelegram size={20} stroke={1.5} color="#229ED9" />}
          onClick={() => window.open(TELEGRAM_LINK, '_blank')}
          variant="light"
          color="blue"
          styles={{
            root: {
              borderRadius: 'var(--mantine-radius-md)',
            },
          }}
        />
      </Box>

      {/* Bottom actions */}
      <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}>
        <Stack gap={4}>
          <Group justify="space-between" mb="xs">
            <Text size="xs" c="dimmed">Tema</Text>
            <Tooltip label={colorScheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
              <ActionIcon
                variant="subtle"
                onClick={() => toggleColorScheme()}
                size="sm"
              >
                {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
              </ActionIcon>
            </Tooltip>
          </Group>
          <NavLink
            label="Ajustes"
            leftSection={<IconSettings size={20} stroke={1.5} />}
            active={currentPage === 'settings'}
            onClick={() => handleNavigate('settings')}
            variant="subtle"
            styles={{
              root: {
                borderRadius: 'var(--mantine-radius-md)',
              },
            }}
          />
          <NavLink
            label="Cerrar sesión"
            leftSection={<IconLogout size={20} stroke={1.5} />}
            onClick={onLogout}
            variant="subtle"
            c="red"
            styles={{
              root: {
                borderRadius: 'var(--mantine-radius-md)',
              },
            }}
          />
        </Stack>
      </Box>
    </Stack>
  );
}

export function Sidebar({ currentPage, onNavigate, onLogout, userEmail, userPhoto, opened, onToggle }: SidebarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Mobile: Drawer
  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onToggle}
        size={260}
        padding={0}
        withCloseButton={false}
        styles={{
          body: {
            height: '100%',
            backgroundColor: 'var(--mantine-color-dark-8)',
          },
        }}
      >
        <SidebarContent
          currentPage={currentPage}
          onNavigate={onNavigate}
          onLogout={onLogout}
          userEmail={userEmail}
          userPhoto={userPhoto}
          onClose={onToggle}
        />
      </Drawer>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <Box
      component="aside"
      w={260}
      h="100vh"
      bg="dark.8"
      style={{ borderRight: '1px solid var(--mantine-color-dark-6)' }}
    >
      <SidebarContent
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        userEmail={userEmail}
        userPhoto={userPhoto}
      />
    </Box>
  );
}

// Mobile header with burger menu
export function MobileHeader({ opened, onToggle, currentPage }: { opened: boolean; onToggle: () => void; currentPage: string }) {
  const currentItem = navItems.find(item => item.id === currentPage);
  
  return (
    <Box
      p="md"
      bg="dark.8"
      style={{ 
        borderBottom: '1px solid var(--mantine-color-dark-6)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Group justify="space-between">
        <Group gap="sm">
          <Burger opened={opened} onClick={onToggle} size="sm" />
          <Text size="2rem">🦞</Text>
          <Text fw={600}>{currentItem?.label || 'OpenClaw'}</Text>
        </Group>
      </Group>
    </Box>
  );
}
