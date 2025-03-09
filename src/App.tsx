import { SolaceProvider } from './context/SolaceContext';
import BrokerConnection from './components/BrokerConnection';
import AgentList from './components/AgentList';
import Visualizer from './components/Visualizer';
import Stimuli from './components/Stimuli';

function App() {
  return (
    <SolaceProvider>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Solace Agent Mesh Dashboard
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <BrokerConnection />
          </div>
          <div>
            <AgentList />
            <Visualizer />
            <Stimuli />
          </div>
        </main>
      </div>
    </SolaceProvider>
  );
}

export default App;