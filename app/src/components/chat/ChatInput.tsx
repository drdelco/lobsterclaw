import { useState, useRef, useEffect } from 'react';
import { Textarea, ActionIcon, Group, Paper, Tooltip, Loader } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, loading, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled && !loading) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <Paper p="md" radius={0} style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}>
      <Group gap="sm" align="flex-end">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder || 'Escribe un mensaje...'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          autosize
          minRows={1}
          maxRows={6}
          style={{ flex: 1 }}
          styles={{
            input: {
              backgroundColor: 'var(--mantine-color-dark-7)',
            },
          }}
        />
        
        <Tooltip label="Enviar (Enter)">
          <ActionIcon
            size="lg"
            variant="filled"
            color="blue"
            onClick={handleSend}
            disabled={!message.trim() || disabled || loading}
          >
            {loading ? <Loader size={18} color="white" /> : <IconSend size={18} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    </Paper>
  );
}
