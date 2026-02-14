import { Paper, Text, Group, Badge, Box, CopyButton, ActionIcon, Tooltip } from '@mantine/core';
import { IconCopy, IconCheck, IconBrandTelegram, IconWorld, IconTerminal } from '@tabler/icons-react';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  const sourceIcons: Record<string, React.ReactNode> = {
    telegram: <IconBrandTelegram size={12} />,
    dashboard: <IconTerminal size={12} />,
    discord: <IconWorld size={12} />,
    other: <IconWorld size={12} />,
  };

  const sourceLabels: Record<string, string> = {
    telegram: 'Telegram',
    dashboard: 'Dashboard',
    discord: 'Discord',
    other: 'Otro',
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}
    >
      <Paper
        p="sm"
        radius="md"
        style={{
          maxWidth: '75%',
          backgroundColor: isUser 
            ? 'var(--mantine-color-blue-9)' 
            : 'var(--mantine-color-dark-6)',
        }}
      >
        <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content}
        </Text>
        
        <Group justify="space-between" mt={6} gap="xs">
          <Group gap={4}>
            <Badge 
              size="xs" 
              variant="dot" 
              color={isUser ? 'blue' : 'gray'}
              leftSection={sourceIcons[message.source]}
            >
              {sourceLabels[message.source]}
            </Badge>
            <Text size="xs" c="dimmed">
              {formatTime(message.timestamp)}
            </Text>
          </Group>
          
          <CopyButton value={message.content}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copiado' : 'Copiar'}>
                <ActionIcon 
                  size="xs" 
                  variant="subtle" 
                  color={copied ? 'green' : 'gray'}
                  onClick={copy}
                >
                  {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Paper>
    </Box>
  );
}
