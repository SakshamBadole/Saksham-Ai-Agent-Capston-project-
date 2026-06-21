import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileBarChart2, 
  Plus, 
  Trash2, 
  Calendar, 
  Download, 
  Eye, 
  BrainCircuit, 
  ChevronRight,
  Sparkles,
  Info,
  Mail,
  Send,
  Check
} from 'lucide-react';
import api from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [reportTitle, setReportTitle] = useState('');

  // Download and Email states
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [emailMode, setEmailMode] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    setEmailMode(false);
    setEmailAddress('');
    setEmailStatus(null);
  }, [selectedReport]);

  const handleDownloadPDF = async () => {
    if (!selectedReport) return;
    setDownloadingPdf(true);
    try {
      const response = await api.get(`/api/reports/${selectedReport.id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let filename = `smartseller_report_${selectedReport.id}.pdf`;
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF report. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleEmailReport = async (e) => {
    e.preventDefault();
    if (!selectedReport || !emailAddress.trim()) return;
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await api.post(`/api/reports/${selectedReport.id}/email?email=${encodeURIComponent(emailAddress.trim())}`);
      setEmailStatus({
        type: 'success',
        message: res.data.message || `Strategy report successfully emailed to ${emailAddress}`
      });
      setTimeout(() => {
        setEmailMode(false);
        setEmailStatus(null);
        setEmailAddress('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setEmailStatus({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to email the strategy report.'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/api/reports');
      setReports(res.data);
      if (res.data.length > 0) {
        setSelectedReport(res.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;
    setCompiling(true);
    try {
      const res = await api.post('/api/reports', {
        title: reportTitle,
        report_type: 'full'
      });
      setReportTitle('');
      setReports(prev => [res.data, ...prev]);
      setSelectedReport(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to compile master e-commerce intelligence briefing.');
    } finally {
      setCompiling(false);
    }
  };

  const handleDeleteReport = async (rId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/api/reports/${rId}`);
      const updated = reports.filter(r => r.id !== rId);
      setReports(updated);
      if (selectedReport && selectedReport.id === rId) {
        setSelectedReport(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Custom light-weight Markdown-to-HTML parser to avoid npm dependencies
  // Translates headers, lists, bolding, and markdown tables into responsive HTML
  const renderMarkdown = (mdString) => {
    if (!mdString) return null;
    
    const lines = mdString.split('\n');
    let insideTable = false;
    let tableHeaders = [];
    let tableRows = [];
    let htmlElements = [];

    const parseInlineStyles = (text) => {
      // Bold **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      let parsedText = text.replace(boldRegex, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
      // Italic *text*
      const italicRegex = /\*(.*?)\*/g;
      parsedText = parsedText.replace(italicRegex, '<em class="italic text-slate-500">$1</em>');
      return parsedText;
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Check for markdown table rows (starts and ends with |)
      if (line.startsWith('|') && line.endsWith('|')) {
        insideTable = true;
        const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        // Skip separator row (like |:---|:---:|)
        if (cells.every(c => c.includes('---'))) {
          continue;
        }

        if (tableHeaders.length === 0) {
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        continue;
      } else if (insideTable) {
        // Table ended, compile it to element
        const headers = [...tableHeaders];
        const rows = [...tableRows];
        const tableKey = `table-${i}`;
        
        htmlElements.push(
          <div key={tableKey} className="my-6 overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-800/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 font-bold border-b border-slate-200/50 dark:border-slate-800/40">
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="p-3" dangerouslySetInnerHTML={{ __html: parseInlineStyles(h) }}></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/35">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-100/10 dark:hover:bg-slate-900/5">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="p-3 font-medium text-slate-850 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: parseInlineStyles(cell) }}></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

        // Reset state
        insideTable = false;
        tableHeaders = [];
        tableRows = [];
      }

      if (line === '') {
        continue;
      }

      // Headers # ## ###
      if (line.startsWith('# ')) {
        htmlElements.push(<h1 key={i} className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight mt-6 mb-4 font-sans border-b border-slate-200/40 dark:border-slate-800/30 pb-2">{line.replace('# ', '')}</h1>);
      } else if (line.startsWith('## ')) {
        htmlElements.push(<h2 key={i} className="text-md font-bold text-slate-800 dark:text-slate-100 tracking-tight mt-6 mb-3 font-sans">{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('### ')) {
        htmlElements.push(<h3 key={i} className="text-sm font-semibold text-brand-500 mt-5 mb-2 font-sans">{line.replace('### ', '')}</h3>);
      }
      // Bullet lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.replace(/^[-*]\s+/, '');
        htmlElements.push(
          <ul key={i} className="list-disc pl-5 my-2 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <li dangerouslySetInnerHTML={{ __html: parseInlineStyles(itemText) }}></li>
          </ul>
        );
      }
      // Standard paragraphs
      else {
        htmlElements.push(<p key={i} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed my-3" dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }}></p>);
      }
    }

    return htmlElements;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <BrainCircuit className="w-12 h-12 text-brand-500 animate-pulse" />
          <span className="text-sm text-slate-500">Formatting analytics summaries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List panel */}
      <div className="space-y-6">
        {/* Compiler Form */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Trigger Compiler Agent</h3>
          </div>
          
          <form onSubmit={handleCreateReport} className="space-y-3">
            <input 
              type="text"
              required
              placeholder="e.g. Master Pricing Strategy Q3"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
            />
            <button 
              type="submit"
              disabled={compiling}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 transition-all"
            >
              {compiling ? 'Compiling briefings...' : 'Compile Global Briefing'}
            </button>
          </form>
        </div>

        {/* List of Previous Reports */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40">
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/40 bg-slate-100/20 dark:bg-slate-900/10">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Previous Compiled Reports</h3>
          </div>

          <div className="divide-y divide-slate-200/30 dark:divide-slate-800/30 max-h-[360px] overflow-y-auto">
            {reports.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No reports compiled yet.
              </div>
            ) : (
              reports.map((r) => (
                <div 
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-4 cursor-pointer hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition-all flex items-center justify-between group ${
                    selectedReport && selectedReport.id === r.id ? 'bg-brand-500/5 border-l-4 border-brand-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 overflow-hidden">
                    <FileBarChart2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${selectedReport && selectedReport.id === r.id ? 'text-brand-500' : 'text-slate-400'}`} />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-semibold text-slate-850 dark:text-slate-250 truncate group-hover:text-brand-500">
                        {r.title}
                      </span>
                      <span className="text-[9px] text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteReport(r.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Viewer Panel */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {selectedReport ? (
            <motion.div 
              key={selectedReport.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 rounded-2xl relative overflow-hidden"
            >
              {/* Document header */}
              <div className="border-b border-slate-200/50 dark:border-slate-800/40 pb-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-brand-500 tracking-widest uppercase">Briefing Document</span>
                    <h2 className="text-md font-bold text-slate-800 dark:text-white mt-1 leading-snug">{selectedReport.title}</h2>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={handleDownloadPDF}
                      disabled={downloadingPdf}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all flex items-center gap-2 text-xs font-bold shrink-0 disabled:opacity-50"
                    >
                      <Download className={`w-4 h-4 ${downloadingPdf ? 'animate-bounce' : ''}`} />
                      {downloadingPdf ? 'Downloading...' : 'Download PDF'}
                    </button>
                    <button 
                      onClick={() => setEmailMode(!emailMode)}
                      className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold shrink-0 ${
                        emailMode 
                          ? 'border-brand-500 bg-brand-500/10 text-brand-500 dark:text-brand-400' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email Report
                    </button>
                  </div>
                </div>

                {/* Email dispatch panel */}
                <AnimatePresence>
                  {emailMode && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-900"
                    >
                      <form onSubmit={handleEmailReport} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                          <input 
                            type="email"
                            required
                            placeholder="recipient@example.com"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                          />
                          <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        </div>
                        <button 
                          type="submit"
                          disabled={sendingEmail}
                          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 transition-all shrink-0"
                        >
                          {sendingEmail ? (
                            <>Sending...</>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Send Report
                            </>
                          )}
                        </button>
                      </form>

                      {emailStatus && (
                        <div className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                          emailStatus.type === 'success' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400'
                        }`}>
                          {emailStatus.type === 'success' ? (
                            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <span>{emailStatus.message}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Parsed Markdown content container */}
              <div className="max-h-[500px] overflow-y-auto pr-2">
                {renderMarkdown(selectedReport.content)}
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 h-64 flex items-center justify-center flex-col text-slate-500 text-xs">
              <FileBarChart2 className="w-10 h-10 text-slate-400 mb-2" />
              <span>No document selected. Compile or select a report on the side panel.</span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Reports;
