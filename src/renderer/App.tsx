import { useEffect, useState } from 'react';
import type { BoardRegistration, TestResult } from '../shared/types';

/**
 * Main application component for the RG432 Test Rig
 */
function App() {
  const [serialNumber, setSerialNumber] = useState('');
  const [operator, setOperator] = useState('');
  const [result, setResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [mockMode, setMockMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRegister = serialNumber.trim().length > 0 && operator.trim().length > 0;
  const canTest = serialNumber.trim().length > 0 && !isRunning;

  useEffect(() => {
    window.electronAPI.getMockMode().then(setMockMode);
    window.electronAPI.getTestHistory().then(setHistory);
  }, []);

  /**
   * Handle mock mode toggle
   */
  const handleMockToggle = async (enabled: boolean): Promise<void> => {
    setMockMode(await window.electronAPI.setMockMode(enabled));
  };

  /**
   * Handle board registration
   */
  const handleRegister = async (): Promise<void> => {
    if (!canRegister) {
      setError('Enter a serial number and operator before registering.');
      return;
    }

    const registration: BoardRegistration = {
      serialNumber: serialNumber.trim(),
      operator: operator.trim(),
      timestamp: new Date().toISOString(),
    };

    setError(null);
    try {
      await window.electronAPI.registerBoard(registration);
    } catch (err) {
      setError(`Registration failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  /**
   * Handle test execution
   */
  const handleTest = async (): Promise<void> => {
    if (!canTest) {
      setError('Enter a serial number before starting a test.');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResult(null);
    try {
      const testResult = await window.electronAPI.runTest(serialNumber.trim());
      setResult(testResult);
      setHistory(await window.electronAPI.getTestHistory());
    } catch (err) {
      setError(`Test failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main style={{ padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>AMF RG432 Test Rig</h1>

      <section style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={mockMode}
            onChange={(event) => handleMockToggle(event.target.checked)}
          />
          {' '}Mock mode (simulate hardware without DLL)
        </label>
      </section>

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
        <button onClick={handleRegister} type="button" disabled={!canRegister}>
          Register Board
        </button>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h2>Run Test</h2>
        <button onClick={handleTest} type="button" disabled={!canTest}>
          {isRunning ? 'Running…' : 'Start Test'}
        </button>
        {isRunning && <p role="status">Test in progress, please wait…</p>}
        {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
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
