import { useState, useRef, useEffect } from 'react';
import { Box, Group, Text, Paper, Stack, Badge, ScrollArea, ActionIcon, Tooltip, Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDots, IconTrash, IconDownload, IconBroadcast } from '@tabler/icons-react';
import { InstanceSelector } from '@/components/chat/InstanceSelector';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import type { Instance, ChatMessage as ChatMessageType } from '@/types';

// Mock data
const mockInstances: Instance[] = [
  {
    id: 'alvi',
    name: 'Alvi',
    emoji: '🦉',
    location: 'gcloud',
    host: 'localhost',
    port: 3033,
    gatewayToken: '***',
    status: 'online',
    lastHeartbeat: new Date(),
    version: '2026.2.3-1',
    model: 'anthropic/claude-opus-4-5',
    createdAt: new Date('2026-02-08'),
  },
];

const mockMessages: Record<string, ChatMessageType[]> = {
  alvi: [
    {
      id: '1',
      instanceId: 'alvi',
      role: 'user',
      content: 'Hola Alvi, ¿cómo estás?',
      source: 'telegram',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      instanceId: 'alvi',
      role: 'assistant',
      content: '¡Hola Diego! Estoy funcionando perfectamente. He revisado los emails esta mañana y todo está en orden. ¿En qué puedo ayudarte?',
      source: 'telegram',
      timestamp: new Date(Date.now() - 3500000),
    },
    {
      id: '3',
      instanceId: 'alvi',
      role: 'user',
      content: '¿Hay algo pendiente para hoy?',
      source: 'telegram',
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: '4',
      instanceId: 'alvi',
      role: 'assistant',
      content: 'Revisando... Tienes:\n\n• 3 emails pendientes de clasificar\n• Reunión a las 16:00 (calendario)\n• El proyecto appAloosy empieza hoy 🚀\n\n¿Quieres que te prepare un resumen más detallado?',
      source: 'telegram',
      timestamp: new Date(Date.now() - 1700000),
    },
  ],
};

export function ChatPage() {
  const [selectedInstance, setSelectedInstance] = useState<string | null>(mockInstances[0]?.id || null);
  const [messages, setMessages] = useState<Record<string, ChatMessageType[]>>(mockMessages);
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const instances = mockInstances;
  const currentMessages = selectedInstance ? (messages[selectedInstance] || []) : [];
  const currentInstance = instances.find((i) => i.id === selectedInstance);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [currentMessages]);

  const handleSendMessage = async (content: string) => {
    if (!selectedInstance) return;

    // Add user message
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      instanceId: selectedInstance,
      role: 'user',
      content,
      source: 'dashboard',
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedInstance]: [...(prev[selectedInstance] || []), userMessage],
    }));

    setLoading(true);

    // Simulate API call
    // TODO: Replace with actual sessions_send call
    setTimeout(() => {
      const assistantMessage: ChatMessageType = {
        id: `msg-${Date.now() + 1}`,
        instanceId: selectedInstance,
        role: 'assistant',
        content: `Recibido desde el Dashboard. Este es un mensaje de prueba.\n\nEn producción, esto conectará con la API real de OpenClaw usando sessions_send.`,
        source: 'dashboard',
        timestamp: new Date(),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedInstance]: [...(prev[selectedInstance] || []), assistantMessage],
      }));

      setLoading(false);
    }, 1500);
  };

  const handleClearChat = () => {
    if (!selectedInstance) return;
    setMessages((prev) => ({
      ...prev,
      [selectedInstance]: [],
    }));
    notifications.show({
      message: 'Chat limpiado',
      color: 'yellow',
    });
  };

  const handleExportChat = () => {
    if (!selectedInstance || !currentMessages.length) return;
    
    const content = currentMessages
      .map((m) => `[${m.timestamp.toISOString()}] ${m.role}: ${m.content}`)
      .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${selectedInstance}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    notifications.show({
      message: 'Chat exportado',
      color: 'green',
    });
  };

  const handleBroadcast = () => {
    notifications.show({
      title: 'Broadcast',
      message: 'Próximamente: enviar mensaje a todas las instancias',
      color: 'blue',
    });
  };

  return (
    <Group gap={0} h="100%" align="stretch" wrap="nowrap">
      {/* Instance sidebar */}
      <InstanceSelector
        instances={instances}
        selectedId={selectedInstance}
        onSelect={setSelectedInstance}
      />

      {/* Chat area */}
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {selectedInstance && currentInstance ? (
          <>
            {/* Header */}
            <Paper
              p="md"
              radius={0}
              style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <Text size="xl">{currentInstance.emoji || '🤖'}</Text>
                  <Box>
                    <Group gap="xs">
                      <Text fw={600}>{currentInstance.name}</Text>
                      <Badge
                        size="sm"
                        color={currentInstance.status === 'online' ? 'green' : 'gray'}
                      >
                        {currentInstance.status}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {currentInstance.model.split('/').pop()} • {currentInstance.location}
                    </Text>
                  </Box>
                </Group>

                <Group gap="xs">
                  <Tooltip label="Broadcast a todas">
                    <ActionIcon variant="subtle" onClick={handleBroadcast}>
                      <IconBroadcast size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle">
                        <IconDots size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconDownload size={16} />}
                        onClick={handleExportChat}
                        disabled={!currentMessages.length}
                      >
                        Exportar chat
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={16} />}
                        color="red"
                        onClick={handleClearChat}
                        disabled={!currentMessages.length}
                      >
                        Limpiar chat
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>
            </Paper>

            {/* Messages */}
            <ScrollArea
              style={{ flex: 1 }}
              p="md"
              viewportRef={scrollAreaRef}
            >
              {currentMessages.length > 0 ? (
                currentMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))
              ) : (
                <Stack align="center" justify="center" h="100%" gap="md">
                  <Text size="3rem">{currentInstance.emoji || '🤖'}</Text>
                  <Text c="dimmed">
                    Inicia una conversación con {currentInstance.name}
                  </Text>
                </Stack>
              )}
            </ScrollArea>

            {/* Input */}
            <ChatInput
              onSend={handleSendMessage}
              loading={loading}
              disabled={currentInstance.status !== 'online'}
              placeholder={
                currentInstance.status !== 'online'
                  ? 'Instancia offline...'
                  : `Mensaje a ${currentInstance.name}...`
              }
            />
          </>
        ) : (
          <Stack align="center" justify="center" h="100%" gap="md">
            <Text size="3rem">💬</Text>
            <Text c="dimmed">Selecciona una instancia para chatear</Text>
          </Stack>
        )}
      </Box>
    </Group>
  );
}
