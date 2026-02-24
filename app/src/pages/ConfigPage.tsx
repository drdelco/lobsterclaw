import { useState } from 'react';
import { Box, Title, Text, Paper, Group, Textarea, Button, Badge, Stack, ActionIcon, Tooltip, Select, Code, Alert, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconFileText, IconDeviceFloppy, IconRefresh, IconCopy, IconCheck, IconAlertTriangle, IconCloudUpload } from '@tabler/icons-react';
import { useClipboard } from '@mantine/hooks';
import { useInstances } from '@/hooks/useFirestore';
import { useConfigFiles, useSaveConfigEdit } from '@/hooks/useConfig';
import type { Instance } from '@/types';

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

const configFileDescriptions: Record<string, string> = {
  'SOUL.md': 'Personalidad y comportamiento del agente',
  'MEMORY.md': 'Memoria a largo plazo y contexto',
  'USER.md': 'Información sobre los usuarios',
  'AGENTS.md': 'Instrucciones de workspace',
  'HEARTBEAT.md': 'Tareas periódicas automáticas',
  'TOOLS.md': 'Notas sobre herramientas',
  'IDENTITY.md': 'Identidad básica del agente',
};

export function ConfigPage() {
  const [selectedInstance, setSelectedInstance] = useState<string>('alvi');
  const [activeFile, setActiveFile] = useState<string>('SOUL.md');
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState(false);
  const clipboard = useClipboard();

  // Request immediate sync - direct call to sync server
  const requestSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('http://35.241.159.137:8787/sync/config', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer lobsterclaw-sync-2026',
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        notifications.show({
          title: '✅ Sincronización completada',
          message: 'Archivos sincronizados correctamente',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        // Reload the page to show updated content
        window.location.reload();
      } else {
        throw new Error(result.error || 'Error en sincronización');
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudo sincronizar',
        color: 'red',
      });
    }
    setSyncing(false);
  };

  // Firestore data
  const { instances: firestoreInstances } = useInstances();
  const { files: configFiles, loading: loadingFiles, error: filesError } = useConfigFiles(selectedInstance);
  const { saveEdit, saving } = useSaveConfigEdit(selectedInstance);

  const instances = firestoreInstances.length > 0 ? firestoreInstances : mockInstances;
  const isLiveData = configFiles.length > 0 && !filesError;
  
  const currentFile = configFiles.find((f) => f.name === activeFile);
  const currentContent = editedContent[activeFile] ?? currentFile?.content ?? '';
  const hasChanges = currentFile && editedContent[activeFile] !== undefined && editedContent[activeFile] !== currentFile.content;

  const handleContentChange = (content: string) => {
    setEditedContent({ ...editedContent, [activeFile]: content });
  };

  const handleSave = async () => {
    if (!currentFile || !hasChanges) return;
    
    const success = await saveEdit(activeFile, editedContent[activeFile], currentFile.content);
    
    if (success) {
      notifications.show({
        title: 'Cambios enviados',
        message: `Los cambios de ${activeFile} serán aplicados por Alvi en breve`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      // Clear edited state for this file
      const newEdited = { ...editedContent };
      delete newEdited[activeFile];
      setEditedContent(newEdited);
    } else {
      notifications.show({
        title: 'Error',
        message: 'No se pudieron guardar los cambios',
        color: 'red',
      });
    }
  };

  const handleRevert = () => {
    if (!currentFile) return;
    
    const newEdited = { ...editedContent };
    delete newEdited[activeFile];
    setEditedContent(newEdited);
    
    notifications.show({
      message: 'Cambios descartados',
      color: 'yellow',
    });
  };

  const handleCopy = () => {
    clipboard.copy(currentContent);
    notifications.show({
      message: 'Copiado al portapapeles',
      color: 'blue',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loadingFiles) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2}>Configuración</Title>
          <Text c="dimmed" mt={4}>
            Edita los archivos de configuración de tus instancias
          </Text>
        </Box>
        <Group>
          <Button
            variant="light"
            leftSection={<IconCloudUpload size={16} />}
            onClick={requestSync}
            loading={syncing}
          >
            Sincronizar ahora
          </Button>
          <Select
          value={selectedInstance}
          onChange={(v) => {
            setSelectedInstance(v || '');
            setEditedContent({});
            setActiveFile('SOUL.md');
          }}
          data={instances.map((i) => ({ 
            value: i.id, 
            label: `${i.emoji || '🤖'} ${i.name}` 
          }))}
          w={200}
          />
        </Group>
      </Group>

      {/* Data source indicator */}
      {isLiveData ? (
        <Alert color="green" mb="xl" icon={<IconCheck />}>
          <Group justify="space-between">
            <Text size="sm">
              <strong>✅ DATOS REALES</strong> — Archivos sincronizados desde el servidor
            </Text>
            <Badge color="green" variant="filled">LIVE</Badge>
          </Group>
        </Alert>
      ) : (
        <Alert color="orange" mb="xl" icon={<IconAlertTriangle />}>
          <Group justify="space-between">
            <Text size="sm">
              <strong>⚠️ SIN CONEXIÓN</strong> — No se pudieron cargar los archivos de configuración
            </Text>
            <Badge color="orange" variant="filled">OFFLINE</Badge>
          </Group>
        </Alert>
      )}

      <Group align="flex-start" gap="lg">
        {/* File tabs on the left */}
        <Paper w={200} radius="md" withBorder p="xs">
          <Stack gap={4}>
            {configFiles.map((file) => {
              const fileHasChanges = editedContent[file.name] !== undefined && editedContent[file.name] !== file.content;
              return (
                <Button
                  key={file.name}
                  variant={activeFile === file.name ? 'filled' : 'subtle'}
                  justify="space-between"
                  fullWidth
                  onClick={() => setActiveFile(file.name)}
                  rightSection={fileHasChanges && <Badge size="xs" color="yellow">•</Badge>}
                >
                  <Group gap={6}>
                    <IconFileText size={14} />
                    <Text size="sm">{file.name}</Text>
                  </Group>
                </Button>
              );
            })}
          </Stack>
        </Paper>

        {/* Editor */}
        <Paper style={{ flex: 1 }} radius="md" withBorder>
          {currentFile ? (
            <>
              {/* Header */}
              <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
                <Box>
                  <Group gap="xs">
                    <Text fw={600}>{currentFile.name}</Text>
                    {hasChanges && <Badge color="yellow" size="sm">Sin guardar</Badge>}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {configFileDescriptions[currentFile.name] || currentFile.name}
                  </Text>
                </Box>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    Modificado: {formatDate(currentFile.lastModified)}
                  </Text>
                  <Tooltip label="Copiar contenido">
                    <ActionIcon variant="subtle" onClick={handleCopy}>
                      <IconCopy size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>

              {/* Editor area */}
              <Box p="md">
                <Textarea
                  value={currentContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  minRows={20}
                  maxRows={30}
                  autosize
                  styles={{
                    input: {
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      backgroundColor: 'var(--mantine-color-dark-7)',
                    },
                  }}
                />
              </Box>

              {/* Footer */}
              <Group justify="space-between" p="md" style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}>
                <Group gap="xs">
                  <Code>{currentFile.path}</Code>
                </Group>
                <Group gap="xs">
                  <Button
                    variant="subtle"
                    leftSection={<IconRefresh size={16} />}
                    onClick={handleRevert}
                    disabled={!hasChanges}
                  >
                    Descartar
                  </Button>
                  <Button
                    leftSection={<IconDeviceFloppy size={16} />}
                    onClick={handleSave}
                    disabled={!hasChanges}
                    loading={saving}
                  >
                    Guardar
                  </Button>
                </Group>
              </Group>
            </>
          ) : (
            <Stack align="center" justify="center" h={400} gap="md">
              <IconFileText size={48} style={{ opacity: 0.5 }} />
              <Text c="dimmed">
                {configFiles.length === 0 
                  ? 'No hay archivos de configuración disponibles' 
                  : 'Selecciona un archivo para editar'}
              </Text>
            </Stack>
          )}
        </Paper>
      </Group>
    </Box>
  );
}
