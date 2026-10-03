import { useEffect, useState } from 'react';
import { isValidSerial } from '../shared/validation';
import type { BoardRegistration, TestResult } from '../shared/types';

/**
 * Persisted UI theme preference
 */
type Theme = 'light' | 'dark';

const THEME_KEY = 'rg432-theme';

/**
 * Read the saved theme or fall back to the OS preference
 */
/**
 * Unwrap the "Error invoking remote method '...': Error:" prefix Electron
 * adds to IPC handler rejections, leaving the operator-facing message
 */
function errorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  return message.replace(/^Error invoking remote method '[^']+':\s*/, '').replace(/^Error:\s*/, '');
}

function initialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Main application component for the RG432 Test Rig
 */
function App() {
  const [serialNumber, setSerialNumber] = useState('');
  const [operator, setOperator] = useState('');
  const [result, setResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [confirmReRegister, setConfirmReRegister] = useState(false);
  const [regMessage, setRegMessage] = useState<{
    kind: 'ok' | 'warn' | 'err';
    text: string;
  } | null>(null);
  const [failurePercent, setFailurePercent] = useState(20);

  const trimmedSerial = serialNumber.trim();
  const serialInvalid = trimmedSerial.length > 0 && !isValidSerial(trimmedSerial);
  const canRegister = isValidSerial(trimmedSerial) && operator.trim().length > 0;
  // A pass or terminal (non-retryable) fail ends this board's flow; only a
  // retryable connexion fail keeps Start Test enabled (TestScheduleNotes §9).
  const boardDone = result !== null && !result.retryable;
  const canTest = trimmedSerial.length > 0 && !isRunning && !boardDone;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.electronAPI.getMockMode().then(setMockMode);
    window.electronAPI.getTestHistory().then(setHistory);
    window.electronAPI.getFailurePercent().then(setFailurePercent);
  }, []);

  const filteredHistory = history.filter((entry) => {
    const query = historySearch.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return (
      entry.serialNumber.toLowerCase().includes(query) ||
      entry.operator.toLowerCase().includes(query) ||
      entry.status.includes(query) ||
      new Date(entry.timestamp).toLocaleString().toLowerCase().includes(query)
    );
  });

  // History is newest-first; collapsed view shows a short preview while
  // searching always searches every record.
  const HISTORY_PREVIEW = 5;
  const searching = historySearch.trim().length > 0;
  const visibleHistory =
    historyExpanded || searching ? filteredHistory : filteredHistory.slice(0, HISTORY_PREVIEW);
  const hiddenCount = filteredHistory.length - visibleHistory.length;

  /**
   * Handle mock mode toggle
   */
  const handleMockToggle = async (enabled: boolean): Promise<void> => {
    setMockMode(await window.electronAPI.setMockMode(enabled));
  };

  /**
   * Generate the next free RG432-XXXX serial into the serial field
   */
  const handleNewBoard = async (): Promise<void> => {
    setError(null);
    setNotice(null);
    try {
      setSerialNumber(await window.electronAPI.nextBoardSerial());
      setConfirmReRegister(false);
      setResult(null);
      setRegMessage(null);
    } catch (err) {
      setError(`Could not generate a serial: ${errorMessage(err)}`);
    }
  };

  /**
   * Handle board registration
   */
  const handleRegister = async (): Promise<void> => {
    if (!canRegister) {
      setRegMessage({
        kind: 'err',
        text: 'Enter a serial number and operator before registering.',
      });
      return;
    }

    const registration: BoardRegistration = {
      serialNumber: trimmedSerial,
      operator: operator.trim(),
      timestamp: new Date().toISOString(),
    };

    setError(null);
    setNotice(null);
    try {
      if (!confirmReRegister && (await window.electronAPI.isBoardRegistered(trimmedSerial))) {
        setConfirmReRegister(true);
        setRegMessage({
          kind: 'warn',
          text: `Board ${trimmedSerial} is already registered. Click Confirm Registration to update it.`,
        });
        return;
      }
      await window.electronAPI.registerBoard(registration);
      setConfirmReRegister(false);
      setRegMessage({
        kind: 'ok',
        text: `Board ${registration.serialNumber} registered and ready for testing.`,
      });
    } catch (err) {
      setRegMessage({ kind: 'err', text: `Registration failed: ${errorMessage(err)}` });
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
    setNotice(null);
    setResult(null);
    try {
      const testResult = await window.electronAPI.runTest(serialNumber.trim());
      setResult(testResult);
      setHistory(await window.electronAPI.getTestHistory());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Persist a new overall failure-percentage target (0-100, per Jeff's
   * byType semantics); invalid input reverts to the saved value
   */
  const handleFailurePercent = async (value: string): Promise<void> => {
    const percent = Number(value);
    if (!Number.isFinite(percent)) {
      setFailurePercent(await window.electronAPI.getFailurePercent());
      return;
    }
    const clamped = Math.min(100, Math.max(0, Math.round(percent)));
    setFailurePercent(await window.electronAPI.setFailurePercent(clamped));
  };

  /**
   * Handle batch report export
   */
  const handleExportReport = async (): Promise<void> => {
    setError(null);
    setNotice(null);
    try {
      const path = await window.electronAPI.exportBatchReport();
      if (path) {
        setNotice(`Batch report saved to ${path}`);
      }
    } catch (err) {
      setError(`Export failed: ${errorMessage(err)}`);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 ' +
    'placeholder-zinc-400 outline-none transition focus:border-indigo-500 focus:ring-2 ' +
    'focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';

  const buttonPrimary =
    'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ' +
    'transition hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed ' +
    'disabled:opacity-40';

  const buttonWarn =
    'rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ' +
    'transition hover:bg-amber-500 active:bg-amber-700 disabled:cursor-not-allowed ' +
    'disabled:opacity-40';

  const buttonSecondary =
    'rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold ' +
    'text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 ' +
    'dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700';

  const card =
    'rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm ' +
    'dark:border-zinc-800 dark:bg-zinc-900';

  const heading = 'mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400';

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h1 className="text-xl font-bold tracking-tight">AMF RG432 Test Rig</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Board programming &amp; verification
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Mock mode toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <button
              type="button"
              role="switch"
              aria-checked={mockMode}
              aria-label="Mock mode"
              onClick={() => handleMockToggle(!mockMode)}
              className={`relative h-6 w-11 rounded-full transition ${
                mockMode ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  mockMode ? 'translate-x-5' : ''
                }`}
              />
            </button>
            Mock mode
          </label>
          {/* Theme toggle */}
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={buttonSecondary + ' px-3'}
          >
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-5 p-6 lg:grid-cols-[380px_1fr]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* Registration */}
          <section className={card}>
            <h2 className={heading}>Board Registration</h2>
            <div className="flex flex-col gap-3">
              <input
                className={inputClass}
                value={serialNumber}
                onChange={(event) => {
                  setSerialNumber(event.target.value);
                  setConfirmReRegister(false);
                  setResult(null);
                  setRegMessage(null);
                }}
                type="text"
                placeholder="Serial number (e.g. RG432-001)"
                aria-label="Serial number"
                disabled={isRunning}
              />
              <input
                className={inputClass}
                value={operator}
                onChange={(event) => setOperator(event.target.value)}
                type="text"
                placeholder="Operator name"
                aria-label="Operator name"
                disabled={isRunning}
              />
              {serialInvalid && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Letters, numbers and dashes only (3–32 characters), e.g. RG432-001.
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleNewBoard}
                  type="button"
                  disabled={isRunning}
                  className={buttonSecondary}
                >
                  New Board
                </button>
                <button
                  onClick={handleRegister}
                  type="button"
                  disabled={!canRegister || isRunning}
                  className={(confirmReRegister ? buttonWarn : buttonPrimary) + ' flex-1'}
                >
                  {confirmReRegister ? 'Confirm Registration' : 'Register Board'}
                </button>
              </div>
              {regMessage && (
                <p
                  role="status"
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    regMessage.kind === 'ok'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : regMessage.kind === 'warn'
                        ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}
                >
                  {regMessage.text}
                </p>
              )}
            </div>
          </section>

          {/* Test execution */}
          <section className={card}>
            <h2 className={heading}>Run Test</h2>
            <label className="mb-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Failure % (0–100)
              </span>
              <input
                className={inputClass + ' w-20 text-right'}
                type="number"
                min={0}
                max={100}
                value={failurePercent}
                onChange={(event) => handleFailurePercent(event.target.value)}
                aria-label="Failure percentage"
                disabled={isRunning}
              />
            </label>
            <button
              onClick={handleTest}
              type="button"
              disabled={!canTest}
              className={buttonPrimary + ' w-full'}
            >
              {isRunning ? 'Running…' : 'Start Test'}
            </button>

            {isRunning && (
              <p role="status" className="mt-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                Test in progress, please wait…
              </p>
            )}

            {result && (
              <div
                className={`mt-4 rounded-xl border-2 px-4 py-5 text-center ${
                  result.status === 'pass'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    : result.retryable
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                }`}
              >
                <p
                  className={`text-4xl font-extrabold tracking-widest ${
                    result.status === 'pass'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : result.retryable
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {result.status === 'pass' ? '✓ PASS' : result.retryable ? '⚠ RETEST' : '✗ FAIL'}
                </p>
                {result.testSummary && (
                  <p className="mt-3 text-sm font-medium">{result.testSummary}</p>
                )}
                {result.statusDetails && (
                  <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {result.statusDetails}
                  </p>
                )}
                {result.retryable && (
                  <p className="mt-3 text-xs">
                    Bad connexion — check the board and start the test again.
                  </p>
                )}
                {result.diagnostics && !result.testSummary && (
                  <p className="mt-3 break-all text-left text-xs text-zinc-500 dark:text-zinc-400">
                    {result.diagnostics}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Status messages */}
          {(error || notice) && (
            <div
              role={error ? 'alert' : 'status'}
              className={`rounded-xl border px-4 py-3 text-sm ${
                error
                  ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              {error ?? notice}
            </div>
          )}

          {/* History */}
          <section className={card + ' flex-1'}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className={heading + ' mb-0'}>Test History</h2>
              <div className="flex items-center gap-2">
                <input
                  className={inputClass + ' w-72'}
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  type="search"
                  placeholder="Search history…"
                  title="Search by serial, operator, status, or date/time"
                  aria-label="Search test history"
                />
                <button onClick={handleExportReport} type="button" className={buttonSecondary}>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <th className="py-2 pr-4 font-medium">Serial</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Operator</th>
                    <th className="py-2 font-medium">Tested at</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHistory.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                    >
                      <td className="py-2 pr-4 font-mono text-xs sm:text-sm">{entry.serialNumber}</td>
                      <td className="py-2 pr-4">
                        <span
                          title={entry.testSummary ?? undefined}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            entry.status === 'pass'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          ● {entry.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4">{entry.operator}</td>
                      <td className="py-2 text-zinc-500 dark:text-zinc-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-zinc-500">
                        {history.length === 0
                          ? 'No tests recorded yet.'
                          : 'No records match your search.'}
                      </td>
                    </tr>
                  )}
                  {hiddenCount > 0 && (
                    <tr>
                      <td colSpan={4} className="pt-3 text-center">
                        <button
                          type="button"
                          onClick={() => setHistoryExpanded(true)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          View all {filteredHistory.length} results ({hiddenCount} more) ↓
                        </button>
                      </td>
                    </tr>
                  )}
                  {historyExpanded && !searching && filteredHistory.length > HISTORY_PREVIEW && (
                    <tr>
                      <td colSpan={4} className="pt-3 text-center">
                        <button
                          type="button"
                          onClick={() => setHistoryExpanded(false)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Show recent {HISTORY_PREVIEW} only ↑
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
