import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { InstancesPage } from '@/pages/InstancesPage';

// Placeholder pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
    <p className="text-gray-500 mt-2">Próximamente...</p>
  </div>
);

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
        return <PlaceholderPage title="Cron Jobs" />;
      case 'chat':
        return <PlaceholderPage title="Chat Unificado" />;
      case 'costs':
        return <PlaceholderPage title="Control de Costes" />;
      case 'llms':
        return <PlaceholderPage title="Gestión de LLMs" />;
      case 'config':
        return <PlaceholderPage title="Configuración" />;
      case 'terminal':
        return <PlaceholderPage title="Terminal SSH" />;
      case 'settings':
        return <PlaceholderPage title="Ajustes" />;
      default:
        return <InstancesPage />;
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}
