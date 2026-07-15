import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  validatePAN, validateAadhaar, getHistory, clearHistory, getStatistics 
} from '../api';
import type { ValidationResponse, Stats as StatsType } from '../api';
import { 
  Shield, Moon, Sun, ArrowLeft, Trash2, Download, Search, Check, 
  AlertTriangle, Copy, RotateCcw, HelpCircle, Keyboard, LayoutGrid,
  CheckCircle2, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PipelineStep {
  name: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
}

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  decimals = 0, 
  duration = 500 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = startValue + progress * (value - startValue);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue.toFixed(decimals)}</span>;
};

interface DashboardPageProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  // Tabs: 'PAN' | 'AADHAAR'
  const [activeTab, setActiveTab] = useState<'PAN' | 'AADHAAR'>('PAN');
  const [inputValue, setInputValue] = useState('');
  
  // Real-time debounced checks
  const [isValidating, setIsValidating] = useState(false);
  const [currentResult, setCurrentResult] = useState<ValidationResponse | null>(null);
  
  // Statistics and History Lists
  const [history, setHistory] = useState<ValidationResponse[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ValidationResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<StatsType>({
    totalValidations: 0,
    totalValid: 0,
    totalInvalid: 0,
    successRate: 0,
    pan: { total: 0, valid: 0, invalid: 0 },
    aadhaar: { total: 0, valid: 0, invalid: 0 }
  });

  // Advanced Sorting & Pagination state
  const [filterType, setFilterType] = useState<'ALL' | 'PAN' | 'AADHAAR'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VALID' | 'INVALID'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Live Pipeline stages
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [runPipeline, setRunPipeline] = useState(false);

  // UI Utilities
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load backend details
  const loadData = async (query?: string) => {
    try {
      const historyData = await getHistory(query);
      setHistory(historyData);
      const statsData = await getStatistics();
      setStats(statsData);
    } catch (err) {
      showToast('Failed to load validation aggregates from Spring Boot', 'error');
    }
  };

  useEffect(() => {
    loadData(searchQuery);
  }, [searchQuery]);

  // Handle local lists filter and sort operations
  useEffect(() => {
    let result = [...history];

    // Apply Type Filter
    if (filterType !== 'ALL') {
      result = result.filter(item => item.details.type === filterType);
    }

    // Apply Status Filter
    if (filterStatus !== 'ALL') {
      result = result.filter(item => item.status === filterStatus);
    }

    // Apply Sorting
    if (sortOrder === 'NEWEST') {
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
      result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    setFilteredHistory(result);
    setCurrentPage(1); // reset to first page on filter change
  }, [history, filterType, filterStatus, sortOrder]);

  // Toast manager
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Debounced real-time validation handler
  useEffect(() => {
    if (!inputValue.trim()) {
      setCurrentResult(null);
      setRunPipeline(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      triggerPipelineAndValidation();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, activeTab]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setActiveTab('PAN');
        setInputValue('');
        setCurrentResult(null);
        showToast('Switched to PAN Validator', 'info');
      }
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveTab('AADHAAR');
        setInputValue('');
        setCurrentResult(null);
        showToast('Switched to Aadhaar Validator', 'info');
      }
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setInputValue('');
        setCurrentResult(null);
        if (inputRef.current) inputRef.current.focus();
        showToast('Form entries cleared', 'info');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, inputValue]);

  // Focus input automatically on tab changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setCurrentResult(null);
    setRunPipeline(false);
  }, [activeTab]);

  // Cleansing formula
  const clientSideNormalize = (val: string, type: 'PAN' | 'AADHAAR') => {
    if (type === 'PAN') {
      return val.trim().replace(/[- ]/g, "").toUpperCase();
    } else {
      return val.replace(/[- ]/g, "");
    }
  };

  const normalizedValue = clientSideNormalize(inputValue, activeTab);

  // Validation execution with animated progress pipeline
  const triggerPipelineAndValidation = async () => {
    setIsValidating(true);
    setRunPipeline(true);
    
    // Initialize standard progress stages
    const steps: PipelineStep[] = [
      { name: 'Input Normalization', status: 'loading' },
      { name: 'Structure Verification', status: 'pending' },
      { name: 'Category Checks', status: 'pending' },
      { name: 'Checksum Analysis', status: 'pending' }
    ];
    setPipelineSteps([...steps]);

    try {
      // Step 1: Normalization animation delay
      await delay(120);
      steps[0].status = 'success';
      steps[0].message = `Normalized: ${normalizedValue}`;
      steps[1].status = 'loading';
      setPipelineSteps([...steps]);

      // Step 2: Basic format and structure match
      await delay(120);
      let localFormatValid = false;
      if (activeTab === 'PAN') {
        localFormatValid = normalizedValue.length === 10 && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(normalizedValue);
      } else {
        localFormatValid = normalizedValue.length === 12 && /^[0-9]{12}$/.test(normalizedValue);
      }

      if (!localFormatValid && normalizedValue.length > 0) {
        steps[1].status = 'error';
        steps[1].message = activeTab === 'PAN' ? 'Expected AAAAA9999A structure' : 'Expected 12 numeric digits';
        setPipelineSteps([...steps]);
      } else {
        steps[1].status = 'success';
        steps[1].message = 'Structural pattern matches requirements';
      }
      steps[2].status = 'loading';
      setPipelineSteps([...steps]);

      // Step 3: Entity details/categories checks
      await delay(120);
      let apiResult: ValidationResponse;
      if (activeTab === 'PAN') {
        apiResult = await validatePAN(inputValue);
      } else {
        apiResult = await validateAadhaar(inputValue);
      }

      if (activeTab === 'PAN') {
        if (apiResult.status === 'VALID') {
          steps[2].status = 'success';
          steps[2].message = `Category: ${apiResult.details.categoryName}`;
        } else if (apiResult.reason.toLowerCase().includes('category')) {
          steps[2].status = 'error';
          steps[2].message = apiResult.reason;
        } else {
          steps[2].status = 'success';
          steps[2].message = 'Checks completed';
        }
        steps[3].status = 'success';
        steps[3].message = 'Not applicable for PAN';
      } else {
        steps[2].status = 'success';
        steps[2].message = 'Not applicable for Aadhaar';
        steps[3].status = 'loading';
        setPipelineSteps([...steps]);

        // Step 4: Verhoeff algorithm
        await delay(120);
        if (apiResult.status === 'VALID') {
          steps[3].status = 'success';
          steps[3].message = 'Verhoeff checksum matches signature';
        } else {
          steps[3].status = 'error';
          steps[3].message = apiResult.reason;
        }
      }

      setPipelineSteps([...steps]);
      setCurrentResult(apiResult);

      if (apiResult.status === 'VALID') {
        showToast(`${activeTab} verification matches compliance`, 'success');
      } else {
        showToast(`${activeTab} validation error: ${apiResult.reason}`, 'error');
      }

      loadData(searchQuery);
    } catch (err: any) {
      showToast('Validation request error on server connection', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Reset logs
  const handleClearHistory = async () => {
    if (window.confirm('Clear all logs and reset metric aggregates on Spring Boot?')) {
      try {
        await clearHistory();
        setCurrentResult(null);
        setInputValue('');
        setRunPipeline(false);
        showToast('System validation audit logs reset successfully', 'success');
        loadData();
      } catch (err) {
        showToast('Reset failed', 'error');
      }
    }
  };

  // Clipboard copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied value to clipboard', 'success');
  };

  // Example Loader
  const loadExample = (ex: string) => {
    setInputValue(ex);
    setCurrentResult(null);
    setRunPipeline(false);
    showToast('Preset loaded', 'info');
  };

  // CSV Audit Generator
  const exportCSV = () => {
    if (history.length === 0) {
      showToast('Log is currently empty', 'error');
      return;
    }
    const headers = ['Time', 'Type', 'Original Input', 'Normalized Value', 'Status', 'Message'];
    const rows = history.map(item => [
      item.timestamp,
      item.details.type,
      item.details.originalInput,
      item.normalizedValue,
      item.status,
      item.reason || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SecureKYC_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Audit Logs Downloaded', 'success');
  };

  // Upgraded PDF document generation
  const exportPDF = () => {
    if (history.length === 0) {
      showToast('Log is currently empty', 'error');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocker prevented compilation window. Allow popups.', 'error');
      return;
    }

    printWindow.document.write(`
      <html>
      <head>
        <title>SecureKYC Audit Report</title>
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
          .header { border-bottom: 4px solid #008DDA; padding-bottom: 24px; margin-bottom: 35px; display: flex; justify-content: space-between; align-items: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: #0B192C; }
          .header p { margin: 4px 0 0 0; color: #64748b; font-size: 13px; }
          .logo { font-size: 24px; font-weight: 900; color: #008DDA; tracking-wider; }
          
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 35px; }
          .stat-card { border: 1px solid #e2e8f0; padding: 18px; border-radius: 16px; text-align: center; background: #f8fafc; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .stat-num { font-size: 24px; font-weight: 800; color: #008DDA; margin-bottom: 4px; }
          .stat-lbl { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02); }
          th, td { border: 1px solid #e2e8f0; padding: 14px 16px; text-align: left; font-size: 12px; }
          th { background-color: #0B192C; color: #ffffff; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .status-valid { color: #10B981; font-weight: 800; background: #ecfdf5; padding: 3px 8px; border-radius: 9999px; }
          .status-invalid { color: #EF4444; font-weight: 800; background: #fef2f2; padding: 3px 8px; border-radius: 9999px; }
          
          .footer { margin-top: 60px; font-size: 11px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>SecureKYC Compliance Summary</h1>
            <p>Verification Log Audit • Compiled on: ${new Date().toLocaleString()}</p>
          </div>
          <div class="logo">SecureKYC</div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-num">${stats.totalValidations}</div>
            <div class="stat-lbl">Total Validations</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${stats.totalValid}</div>
            <div class="stat-lbl">Valid Items</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${stats.totalInvalid}</div>
            <div class="stat-lbl">Invalid Items</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${stats.successRate}%</div>
            <div class="stat-lbl">Success Rate</div>
          </div>
        </div>

        <h3>KYC Verification Logs</h3>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Doc Type</th>
              <th>Original Entry</th>
              <th>Normalized Value</th>
              <th>Outcome</th>
              <th>Reason Code / Diagnosis</th>
            </tr>
          </thead>
          <tbody>
            ${history.map(row => `
              <tr>
                <td>${new Date(row.timestamp).toLocaleTimeString()}</td>
                <td><strong>${row.details.type}</strong></td>
                <td><code>${row.details.originalInput}</code></td>
                <td><code>${row.normalizedValue || '-'}</code></td>
                <td><span class="${row.status === 'VALID' ? 'status-valid' : 'status-invalid'}">${row.status}</span></td>
                <td>${row.reason || 'Verified'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Confidential audit summary document compiled automatically by SecureKYC Core Engine.
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    showToast('PDF Export compiled successfully', 'success');
  };

  // Highlight input parsing segments dynamically
  const renderSegmentHighlighting = () => {
    if (!inputValue) {
      return (
        <div className="flex space-x-1 justify-center py-2 text-xs font-semibold text-slate-400">
          <span>Awaiting input...</span>
        </div>
      );
    }

    if (activeTab === 'PAN') {
      const parsed = normalizedValue;
      const first5 = parsed.substring(0, Math.min(5, parsed.length));
      const next4 = parsed.substring(5, Math.min(9, parsed.length));
      const last1 = parsed.substring(9, Math.min(10, parsed.length));

      const isFirst5Valid = first5.length === 5 && /^[A-Z]{5}$/.test(first5);
      const isNext4Valid = next4.length === 4 && /^[0-9]{4}$/.test(next4);
      const isLast1Valid = last1.length === 1 && /^[A-Z]{1}$/.test(last1);

      return (
        <div className="flex flex-wrap gap-3 items-center text-xs font-semibold pt-1">
          <span className={`px-2.5 py-1 rounded-lg border ${
            isFirst5Valid ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800' : 'bg-red-50/70 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800'
          }`}>
            Letters (5): <span className="font-mono">{first5 || '-'}</span> {isFirst5Valid ? '✅' : '❌'}
          </span>
          <span className={`px-2.5 py-1 rounded-lg border ${
            isNext4Valid ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800' : 'bg-red-50/70 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800'
          }`}>
            Digits (4): <span className="font-mono">{next4 || '-'}</span> {isNext4Valid ? '✅' : '❌'}
          </span>
          <span className={`px-2.5 py-1 rounded-lg border ${
            isLast1Valid ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800' : 'bg-red-50/70 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800'
          }`}>
            Letter (1): <span className="font-mono">{last1 || '-'}</span> {isLast1Valid ? '✅' : '❌'}
          </span>
        </div>
      );
    } else {
      const parsed = normalizedValue;
      const isAllDigits = /^[0-9]*$/.test(parsed);
      const isLengthValid = parsed.length === 12;

      return (
        <div className="flex flex-wrap gap-3 items-center text-xs font-semibold pt-1">
          <span className={`px-2.5 py-1 rounded-lg border ${
            isAllDigits ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800' : 'bg-red-50/70 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800'
          }`}>
            Digits only: {isAllDigits ? '✅' : '❌ Contains letters/symbols'}
          </span>
          <span className={`px-2.5 py-1 rounded-lg border ${
            isLengthValid ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800' : 'bg-red-50/70 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800'
          }`}>
            Length (12): {parsed.length} / 12 {isLengthValid ? '✅' : '❌'}
          </span>
        </div>
      );
    }
  };

  // Pie chart variables
  const totalVal = stats.totalValidations;
  const validCount = stats.totalValid;
  const validPercent = totalVal > 0 ? (validCount / totalVal) * 100 : 0;
  const invalidPercent = totalVal > 0 ? (stats.totalInvalid / totalVal) * 100 : 0;
  const circ = 314.16;
  const validOffset = circ - (validPercent / 100) * circ;

  // Bar chart height scales
  const maxBarValue = Math.max(stats.pan.total, stats.aadhaar.total, 4);
  const getBarHeight = (value: number) => (value / maxBarValue) * 100;

  // Pagination details
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistoryItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  // SVG Line Chart coordinates calculations based on mock timestamps
  // Represents verification volumes over time blocks: [T1, T2, T3, T4, T5]
  const mockLinePoints = [2, 5, stats.totalValidations, stats.totalValid, Math.max(stats.totalValidations - 1, 0)];
  const maxValPoints = Math.max(...mockLinePoints, 5);

  const getLineSvgPoints = () => {
    // Width = 280, Height = 100. padding 10
    const points = mockLinePoints.map((val, idx) => {
      const x = 15 + idx * 62; // spreads evenly
      const y = 90 - (val / maxValPoints) * 70; // scales vertically
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  const getAreaSvgPoints = () => {
    const points = mockLinePoints.map((val, idx) => {
      const x = 15 + idx * 62;
      const y = 90 - (val / maxValPoints) * 70;
      return `${x},${y}`;
    });
    const startX = 15;
    const endX = 15 + (mockLinePoints.length - 1) * 62;
    return `${startX},90 ${points.join(' ')} ${endX},90`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B14] transition-colors duration-300 relative pb-20 text-slate-800 dark:text-slate-100">
      {/* Grid patterns */}
      <div className="absolute inset-0 bg-grid-pattern dark:bg-grid-pattern-dark pointer-events-none" />

      {/* Toast popup alerts */}
      <div className="fixed top-6 right-6 z-50 space-y-3 w-80 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center justify-between translate-y-0 transition-transform duration-300 pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-300'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/70 dark:border-red-800 dark:text-red-300'
                : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-slate-900/70 dark:border-slate-800 dark:text-blue-300'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/40 dark:bg-[#050B14]/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="bg-banking-teal p-2 rounded-lg text-white">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold text-banking-navy dark:text-white">Validation Console</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/about')}
              className="text-xs font-bold text-slate-500 hover:text-banking-teal mr-2"
            >
              About Spec
            </button>
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className={`p-2.5 rounded-xl border transition-all ${
                showShortcuts
                  ? 'bg-banking-teal/15 border-banking-teal/30 text-banking-teal'
                  : 'bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
              }`}
              title="View Keyboard Shortcuts"
            >
              <Keyboard className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Shortcuts Guideline banner */}
        {showShortcuts && (
          <div className="lg:col-span-12 glass-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-banking-teal/20 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2 font-bold text-banking-teal">
              <Keyboard className="w-4 h-4" />
              <span>Accessibility Hotkeys Bindings:</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span>Switch to PAN: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border">Alt + P</kbd></span>
              <span>Switch to Aadhaar: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border">Alt + A</kbd></span>
              <span>Clear entries: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border">Alt + C</kbd></span>
            </div>
            <button 
              onClick={() => setShowShortcuts(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Left Column: Validator Form & Segment-level highlights (5 cols) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl shadow-glass-light dark:shadow-glass-dark relative overflow-hidden">
            
            {/* Custom Tab Switcher */}
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 mb-6">
              <button
                onClick={() => { setActiveTab('PAN'); setInputValue(''); }}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  activeTab === 'PAN'
                    ? 'bg-white dark:bg-[#1E3E62] shadow text-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                PAN Card
              </button>
              <button
                onClick={() => { setActiveTab('AADHAAR'); setInputValue(''); }}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  activeTab === 'AADHAAR'
                    ? 'bg-white dark:bg-[#1E3E62] shadow text-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Aadhaar Card
              </button>
            </div>

            {/* Input area */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Enter {activeTab} Identifier
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    disabled={isValidating}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={activeTab === 'PAN' ? 'e.g. ABCPD1234Z' : 'e.g. 9999-3399-9936'}
                    className="w-full px-4 py-4 rounded-xl glass-input text-base font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-banking-teal text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 uppercase disabled:opacity-60"
                  />
                  {inputValue && (
                    <button
                      onClick={() => { setInputValue(''); setCurrentResult(null); setRunPipeline(false); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      title="Clear entries"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Character Segment-level Checklist (Real-time syntax feedback) */}
              <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  Dynamic Syntax segments checks
                </span>
                {renderSegmentHighlighting()}
              </div>

              {/* Scenarios Preset items */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  Validation Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeTab === 'PAN' ? (
                    <>
                      <button 
                        onClick={() => loadExample('ABCPD1234Z')}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 hover:bg-banking-teal hover:text-white dark:hover:bg-banking-teal transition-all"
                      >
                        Valid Individual
                      </button>
                      <button 
                        onClick={() => loadExample('ABCCD5678A')}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 hover:bg-banking-teal hover:text-white dark:hover:bg-banking-teal transition-all"
                      >
                        Valid Company
                      </button>
                      <button 
                        onClick={() => loadExample('ABCXD1234Z')}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all"
                      >
                        Bad Category
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => loadExample('9999-3399-9936')}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 hover:bg-banking-teal hover:text-white dark:hover:bg-banking-teal transition-all"
                      >
                        Valid Aadhaar
                      </button>
                      <button 
                        onClick={() => loadExample('9999-3399-9932')}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all"
                      >
                        Bad Checksum
                      </button>
                      <button 
                        onClick={() => loadExample('99993399993०')}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all"
                      >
                        Devanagari Digits
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Validation Skeletons and Result Details */}
          {isValidating && (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 glass-card animate-pulse space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                </div>
              </div>
              <div className="h-16 bg-slate-200/50 dark:bg-slate-900/30 rounded-2xl" />
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          )}

          {!isValidating && currentResult && (
            <div className={`p-6 rounded-3xl border animate-fade-in ${
              currentResult.status === 'VALID'
                ? 'bg-emerald-50/60 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50'
                : 'bg-red-50/60 dark:bg-red-950/10 border-red-200 dark:border-red-900/50'
            } glass-card`}>
              
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl text-white ${
                    currentResult.status === 'VALID' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}>
                    {currentResult.status === 'VALID' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">
                      {currentResult.status === 'VALID' ? '✔ Valid Document' : '❌ Verification Failed'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Checked at {new Date(currentResult.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(currentResult.normalizedValue)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                  title="Copy Normalized Value"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* Diagnostic Explanation Banner (Hackathon Specific) */}
              {currentResult.status === 'INVALID' && (
                <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs space-y-2">
                  <div>
                    <span className="font-bold text-red-500 uppercase tracking-wider block">Diagnostic Reason:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 font-semibold">
                      {currentResult.details.errorDescription || currentResult.reason}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-500 uppercase tracking-wider block">Resolution Suggestion:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {currentResult.details.errorSuggestion || 'Check characters format and length limits.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Scores Aggregates */}
              {currentResult.status === 'VALID' && (
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Confidence</span>
                    <div className="font-bold text-emerald-500 text-sm mt-0.5">
                      {currentResult.details.confidenceScore}%
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Input Quality</span>
                    <div className="font-bold text-banking-teal text-sm mt-0.5">
                      {currentResult.details.qualityScore}%
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Security</span>
                    <div className="font-bold text-indigo-500 text-sm mt-0.5">
                      {currentResult.details.securityScore}%
                    </div>
                  </div>
                </div>
              )}

              {/* Table stats */}
              <div className="mt-4 space-y-2 text-xs border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Original input</span>
                  <span className="font-mono font-bold">{currentResult.details.originalInput}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Normalized Value</span>
                  <span className="font-mono font-bold">{currentResult.normalizedValue}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Duration Speed</span>
                  <span className="font-bold text-banking-teal">
                    {currentResult.details.validationTimeMs} ms
                  </span>
                </div>
                {currentResult.status === 'VALID' && activeTab === 'PAN' && (
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Category Type</span>
                    <span className="font-bold text-banking-teal text-right">
                      {currentResult.details.categoryName} ({currentResult.details.categoryCode})
                    </span>
                  </div>
                )}
                {currentResult.status === 'VALID' && activeTab === 'AADHAAR' && (
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Masked Display</span>
                    <span className="font-mono font-bold text-banking-teal">
                      {currentResult.details.maskedValue}
                    </span>
                  </div>
                )}
              </div>

            </div>
          )}

        </section>

        {/* Right Column: Statistics dashboard and History log lists (7 cols) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Key Metrics cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Validations</span>
              <div className="text-2xl font-extrabold text-banking-navy dark:text-white mt-1">
                <AnimatedCounter value={stats.totalValidations} />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Passed Runs</span>
              <div className="text-2xl font-extrabold text-emerald-500 mt-1">
                <AnimatedCounter value={stats.totalValid} />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-red-500">Failed Runs</span>
              <div className="text-2xl font-extrabold text-red-500 mt-1">
                <AnimatedCounter value={stats.totalInvalid} />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-banking-teal">Success Rate</span>
              <div className="text-2xl font-extrabold text-banking-teal mt-1">
                <AnimatedCounter value={stats.successRate} decimals={1} />%
              </div>
            </div>
          </div>

          {/* Validation Pipeline tracker */}
          {runPipeline && (
            <div className="glass-card p-6 rounded-3xl animate-fade-in border border-banking-teal/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-banking-teal mb-4">
                Validation Processing Pipeline
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pipelineSteps.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-2xl border bg-slate-100/30 dark:bg-slate-900/30 text-xs space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] text-slate-500 uppercase">{step.name}</span>
                      {step.status === 'loading' && (
                        <div className="w-3.5 h-3.5 rounded-full border border-banking-teal border-t-transparent animate-spin" />
                      )}
                      {step.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {step.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                      {step.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal truncate" title={step.message}>
                      {step.message || 'Waiting...'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Graphical Analytics Charts (3 SVG Visuals) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* SVG Pie Quality chart */}
            <div className="glass-card p-5 rounded-3xl flex flex-col justify-between">
              <h5 className="text-xs font-bold text-banking-navy dark:text-white uppercase tracking-wider mb-2">Quality Ratio</h5>
              <div className="flex items-center justify-center py-4">
                {stats.totalValidations > 0 ? (
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" className="stroke-red-500" strokeWidth="12" fill="transparent" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      className="stroke-emerald-500 transition-all duration-1000"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={circ}
                      strokeDashoffset={validOffset}
                    />
                  </svg>
                ) : (
                  <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                )}
              </div>
              <div className="text-[10px] text-center text-slate-400 font-semibold mt-1">
                Valid: {validPercent.toFixed(0)}% • Invalid: {invalidPercent.toFixed(0)}%
              </div>
            </div>

            {/* SVG Bar Chart for Volumes */}
            <div className="glass-card p-5 rounded-3xl flex flex-col justify-between">
              <h5 className="text-xs font-bold text-banking-navy dark:text-white uppercase tracking-wider mb-2">Docs Volume</h5>
              <div className="h-20 flex items-end justify-around border-b border-slate-200 dark:border-slate-800 pb-1">
                {stats.totalValidations > 0 ? (
                  <>
                    <div className="flex flex-col items-center flex-1">
                      <div className="flex items-end space-x-1 h-14">
                        <div className="w-3 bg-emerald-500 rounded-t-sm" style={{ height: `${getBarHeight(stats.pan.valid)}px` }} title={`PAN Passed: ${stats.pan.valid}`} />
                        <div className="w-3 bg-red-500 rounded-t-sm" style={{ height: `${getBarHeight(stats.pan.invalid)}px` }} title={`PAN Failed: ${stats.pan.invalid}`} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase mt-1">PAN</span>
                    </div>

                    <div className="flex flex-col items-center flex-1">
                      <div className="flex items-end space-x-1 h-14">
                        <div className="w-3 bg-emerald-500 rounded-t-sm" style={{ height: `${getBarHeight(stats.aadhaar.valid)}px` }} title={`Aadhaar Passed: ${stats.aadhaar.valid}`} />
                        <div className="w-3 bg-red-500 rounded-t-sm" style={{ height: `${getBarHeight(stats.aadhaar.invalid)}px` }} title={`Aadhaar Failed: ${stats.aadhaar.invalid}`} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase mt-1">AADHAAR</span>
                    </div>
                  </>
                ) : (
                  <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                )}
              </div>
              <div className="text-[10px] text-center text-slate-400 font-semibold mt-1">
                PAN Total: {stats.pan.total} • Aadhaar Total: {stats.aadhaar.total}
              </div>
            </div>

            {/* SVG Line Chart for Time Timeline */}
            <div className="glass-card p-5 rounded-3xl flex flex-col justify-between">
              <h5 className="text-xs font-bold text-banking-navy dark:text-white uppercase tracking-wider mb-2">Trendline</h5>
              <div className="h-20 flex items-center justify-center relative">
                {stats.totalValidations > 0 ? (
                  <svg className="w-full h-full" viewBox="0 0 280 100">
                    <defs>
                      <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#008DDA" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#008DDA" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={getAreaSvgPoints()}
                      fill="url(#chartAreaGradient)"
                      className="transition-all duration-1000"
                    />
                    {/* Line Chart path */}
                    <polyline
                      fill="none"
                      stroke="#008DDA"
                      strokeWidth="3.5"
                      points={getLineSvgPoints()}
                      className="transition-all duration-1000"
                    />
                    {/* Grid nodes */}
                    {mockLinePoints.map((val, idx) => {
                      const x = 15 + idx * 62;
                      const y = 90 - (val / maxValPoints) * 70;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r={4}
                          className="fill-banking-accent stroke-white dark:stroke-[#050B14]"
                          strokeWidth={2}
                        >
                          <title>{`Value: ${val}`}</title>
                        </circle>
                      );
                    })}
                  </svg>
                ) : (
                  <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                )}
              </div>
              <div className="text-[9px] flex justify-between text-slate-400 font-semibold mt-1 px-1">
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
              </div>
            </div>

          </div>

          {/* Validation Logs Audit list */}
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-4">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-banking-navy dark:text-white">Validation Audit Logs</h3>
                <p className="text-xs text-slate-400 font-semibold">Pagination and query controls activated</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={exportCSV}
                  className="p-2 border border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl text-slate-600 dark:text-slate-400 hover:text-banking-teal flex items-center space-x-1.5 text-xs font-semibold"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={exportPDF}
                  className="p-2 border border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl text-slate-600 dark:text-slate-400 hover:text-banking-teal flex items-center space-x-1.5 text-xs font-semibold"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>PDF Audit</span>
                </button>
                <button
                  onClick={handleClearHistory}
                  className="p-2 border border-red-200 dark:border-red-950/40 bg-red-50/10 hover:bg-red-500 dark:hover:bg-red-900/30 rounded-xl text-red-500 hover:text-white flex items-center space-x-1.5 text-xs font-semibold transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Filter and Sort options panel */}
            <div className="p-4 rounded-2xl border bg-slate-100/30 dark:bg-slate-900/10 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              
              {/* Type Filter */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Doc Type</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-banking-teal text-xs font-bold"
                >
                  <option value="ALL">All Documents</option>
                  <option value="PAN">PAN Cards</option>
                  <option value="AADHAAR">Aadhaar Cards</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Outcome Status</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-banking-teal text-xs font-bold"
                >
                  <option value="ALL">All States</option>
                  <option value="VALID">Passed (Valid)</option>
                  <option value="INVALID">Failed (Invalid)</option>
                </select>
              </div>

              {/* Sorting Order */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sort Time</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-banking-teal text-xs font-bold"
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                </select>
              </div>

              {/* Search query box */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Query Search</span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Filter values..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-banking-teal placeholder:text-slate-400 dark:placeholder:text-slate-600 font-bold"
                  />
                </div>
              </div>

            </div>

            {/* List Table */}
            <div className="overflow-x-auto border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-900/30 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800/80">
                    <th className="p-4">Time</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Original Entry</th>
                    <th className="p-4">Normalized</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Diagnosis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 text-xs">
                  {currentHistoryItems.length > 0 ? (
                    currentHistoryItems.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10 cursor-pointer font-medium"
                        onClick={() => {
                          setActiveTab(row.details.type);
                          setInputValue(row.details.originalInput);
                          setCurrentResult(row);
                          showToast('Loaded records details panel', 'info');
                        }}
                      >
                        <td className="p-4 text-slate-400 text-[10px] whitespace-nowrap">
                          {new Date(row.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-banking-teal">{row.details.type}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {row.details.originalInput}
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {row.normalizedValue || '-'}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.status === 'VALID' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[120px]" title={row.reason}>
                          {row.reason || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No validations record matched filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-xs px-2 pt-2">
                <span className="font-semibold text-slate-400">
                  Page {currentPage} of {totalPages} ({filteredHistory.length} total entries)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </section>

      </main>
    </div>
  );
};
