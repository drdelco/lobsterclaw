import { useState, useRef, useEffect } from 'react';
import { Box, Group, Text, Paper, Stack, Badge, ScrollArea, ActionIcon, Menu, Button, Center, Alert, TextInput, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDots, IconTrash, IconDownload, IconBrandTelegram, IconSend } from '@tabler/icons-react';
import { InstanceSelector } from '@/components/chat/InstanceSelector';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { useInstances } from '@/hooks/useFirestore';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Instance, ChatMessage as ChatMessageType } from '@/types';

// Telegram bot link (fallback)
const TELEGRAM_BOT = 'drdelcobot';
const TELEGRAM_LINK = `https://t.me/${TELEGRAM_BOT}`;

// Mock fallback
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

export function ChatPage() {
  const [selectedInstance, setSelectedInstance] = useState<string | null>('alvi');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { instances: firestoreInstances } = useInstances();
  const instances = firestoreInstances.length > 0 ? firestoreInstances : mockInstances;
  const currentInstance = instances.find((i) => i.id === selectedInstance);

  // Listen to messages from Firestore
  useEffect(() => {
    if (!selectedInstance) return;

    setLoadingMessages(true);
    const messagesRef = collection(db, 'chat', selectedInstance, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => {
          const d = doc.data();
          let timestamp = new Date();
          if (d.timestamp instanceof Timestamp) {
            timestamp = d.timestamp.toDate();
          } else if (d.timestamp) {
            timestamp = new Date(d.timestamp);
          }
          return {
            id: doc.id,
            instanceId: selectedInstance,
            role: d.role || 'user',
            content: d.content || '',
            source: d.source || 'dashboard',
            timestamp,
          } as ChatMessageType;
        });
        setMessages(msgs);
        setLoadingMessages(false);
      },
      (error) => {
        console.error('Error loading messages:', error);
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [selectedInstance]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-viewport]') || scrollAreaRef.current;
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedInstance || !inputValue.trim()) return;

    const content = inputValue.trim();
    setInputValue('');
    setSending(true);

    try {
      // Add user message to Firestore
      const messagesRef = collection(db, 'chat', selectedInstance, 'messages');
      await addDoc(messagesRef, {
        role: 'user',
        content,
        source: 'dashboard',
        timestamp: serverTimestamp(),
        processed: false,
      });

      notifications.show({
        message: 'Mensaje enviado. Alvi responderá en breve.',
        color: 'blue',
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudo enviar el mensaje',
        color: 'red',
      });
      setInputValue(content); // Restore message
    }

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    notifications.show({
      message: 'Para limpiar el historial, contacta con el administrador.',
      color: 'yellow',
    });
  };

  const handleExportChat = () => {
    if (!messages.length) return;

    const content = messages
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

  const openTelegram = () => {
    window.location.href = TELEGRAM_LINK;
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
                      {currentInstance.model?.split('/').pop() || 'unknown'} • Chat integrado
                    </Text>
                  </Box>
                </Group>

                <Group gap="xs">
                  <Button
                    variant="subtle"
                    size="xs"
                    leftSection={<IconBrandTelegram size={16} />}
                    onClick={openTelegram}
                  >
                    Telegram
                  </Button>
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
                        disabled={!messages.length}
                      >
                        Exportar chat
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={16} />}
                        color="red"
                        onClick={handleClearChat}
                        disabled={!messages.length}
                      >
                        Limpiar chat
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>
            </Paper>

            {/* Info banner */}
            <Alert color="blue" radius={0} py="xs">
              <Group gap="xs" justify="center">
                <Text size="xs">
                  💬 Chat integrado — Los mensajes se sincronizan con Alvi. Respuestas en ~1 min.
                </Text>
              </Group>
            </Alert>

            {/* Messages */}
            <ScrollArea style={{ flex: 1 }} p="md" viewportRef={scrollAreaRef}>
              {loadingMessages ? (
                <Center h="100%">
                  <Loader size="lg" />
                </Center>
              ) : messages.length > 0 ? (
                <Stack gap="md">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                </Stack>
              ) : (
                <Stack align="center" justify="center" h="100%" gap="md">
                  <Text size="3rem">{currentInstance.emoji || '🤖'}</Text>
                  <Text c="dimmed" ta="center">
                    Inicia una conversación con {currentInstance.name}
                  </Text>
                  <Text size="xs" c="dimmed" ta="center">
                    Los mensajes se procesan en tiempo real
                  </Text>
                </Stack>
              )}
            </ScrollArea>

            {/* Input */}
            <Paper
              p="md"
              radius={0}
              style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}
            >
              <Group gap="sm">
                <TextInput
                  placeholder={`Mensaje a ${currentInstance.name}...`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.currentTarget.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending || currentInstance.status !== 'online'}
                  style={{ flex: 1 }}
                  rightSection={sending ? <Loader size="xs" /> : null}
                />
                <ActionIcon
                  size="lg"
                  variant="filled"
                  color="blue"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || sending}
                >
                  <IconSend size={18} />
                </ActionIcon>
              </Group>
            </Paper>
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
