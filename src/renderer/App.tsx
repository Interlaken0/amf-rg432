import { useState } from 'react';
import type { BoardRegistration, TestResult } from '../shared/types';

function App() {
  const [serialNumber, setSerialNumber] = useState('');
  const [operator, setOperator] = useState('');
  const [result, setResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);

  const handleRegister = async (): Promise<void> => {
    const registration: BoardRegistration = {
      serialNumber,
      operator,
      timestamp: new Date().toISOString(),
    };

    await window.electronAPI.registerBoard(registration);
  };

  const handleTest = async (): Promise<void> => {
    const testResult = await window.electronAPI.runTest(serialNumber);
    setResult(testResult);
    const updatedHistory = await window.electronAPI.getTestHistory();
    setHistory(updatedHistory);
  };

  return (
    <main style={{ padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>RG432 Test Rig</h1>

      <section style={{ marginBottom: '1rem' }}>
        <h2>Board Registration</h2>
        <label>
          Serial Number
          <input
            value={serialNumber}
            onChange={(event) => setSerialNumber(event.target.value)}
            type="text"
          />
        </label>
        <label>
          Operator
          <input
            value={operator}
            onChange={(event) => setOperator(event.target.value)}
            type="text"
          />
        </label>
        <button onClick={handleRegister} type="button">
          Register Board
        </button>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h2>Run Test</h2>
        <button onClick={handleTest} type="button">
          Start Test
        </button>
        {result && (
          <div>
            <p>Status: {result.status}</p>
            {result.diagnostics && <p>Diagnostics: {result.diagnostics}</p>}
          </div>
        )}
      </section>

      <section>
        <h2>Test History</h2>
        <ul>
          {history.map((entry) => (
            <li key={entry.id}>
              {entry.serialNumber} — {entry.status} — {entry.operator}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
