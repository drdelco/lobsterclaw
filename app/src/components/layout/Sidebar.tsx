import { 
  Monitor, 
  Clock, 
  MessageSquare, 
  DollarSign, 
  Bot, 
  FileText, 
  Terminal,
  Settings,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'instances', label: 'Instancias', icon: Monitor },
  { id: 'cron', label: 'Cron Jobs', icon: Clock },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'costs', label: 'Costes', icon: DollarSign },
  { id: 'llms', label: 'LLMs', icon: Bot },
  { id: 'config', label: 'Configuración', icon: FileText },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
];

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🦞</span>
          <div>
            <h1 className="font-bold text-lg">OpenClaw</h1>
            <p className="text-xs text-gray-400">Command Center</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Bottom actions */}
      <div className="p-4 border-t border-gray-800 space-y-1">
        <button
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium">Ajustes</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
