import { create } from 'zustand';
import type { Instance, CronJob, ChatMessage, ConfigFile } from '@/types';

interface InstanceState {
  instances: Instance[];
  selectedInstance: Instance | null;
  cronJobs: CronJob[];
  messages: ChatMessage[];
  configFiles: ConfigFile[];
  
  // Actions
  setInstances: (instances: Instance[]) => void;
  selectInstance: (instance: Instance | null) => void;
  updateInstance: (id: string, updates: Partial<Instance>) => void;
  setCronJobs: (jobs: CronJob[]) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setConfigFiles: (files: ConfigFile[]) => void;
  updateConfigFile: (name: string, content: string) => void;
}

export const useInstanceStore = create<InstanceState>((set) => ({
  instances: [],
  selectedInstance: null,
  cronJobs: [],
  messages: [],
  configFiles: [],
  
  setInstances: (instances) => set({ instances }),
  
  selectInstance: (instance) => set({ selectedInstance: instance }),
  
  updateInstance: (id, updates) => set((state) => ({
    instances: state.instances.map((inst) =>
      inst.id === id ? { ...inst, ...updates } : inst
    ),
    selectedInstance: state.selectedInstance?.id === id
      ? { ...state.selectedInstance, ...updates }
      : state.selectedInstance,
  })),
  
  setCronJobs: (cronJobs) => set({ cronJobs }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  setMessages: (messages) => set({ messages }),
  
  setConfigFiles: (configFiles) => set({ configFiles }),
  
  updateConfigFile: (name, content) => set((state) => ({
    configFiles: state.configFiles.map((file) =>
      file.name === name ? { ...file, content, lastModified: new Date() } : file
    ),
  })),
}));
