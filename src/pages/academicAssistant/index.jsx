import React, { useState, useRef } from 'react';
import TopNav from '../../components/common/TopNav';
import Footer from '../../components/common/Footer';
import QueryCard from '../../components/academicAssistant/QueryCard';
import ToolCard from '../../components/academicAssistant/ToolCard';
import ResultPanel from '../../components/academicAssistant/ResultPanel';
import { analyzeQuery } from '../../api/ai/aiService';
import styles from './academicAssistant.module.css';

const TOOL_CARDS = [
  {
    title: 'Citation Generator',
    description: 'APA, MLA, Harvard styles',
    mode: 'citation',
    promptPrefix: 'Generate APA, MLA, and Harvard citations for',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    title: 'Concept Translation',
    description: 'Simplify complex jargon',
    promptPrefix: 'Translate into simple language',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
        <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
      </svg>
    ),
  },
];

const CITATION_FIELDS = [
  { key: 'author', label: "Author's name", placeholder: 'e.g. Rumelhart, D. E.' },
  { key: 'date', label: 'Publication date', placeholder: 'e.g. 1986' },
  { key: 'title', label: 'Title of the article or book', placeholder: 'e.g. Learning representations by back-propagating errors' },
  { key: 'publisher', label: 'Publisher', placeholder: 'e.g. Nature' },
  { key: 'source', label: 'URL or DOI', placeholder: 'e.g. https://doi.org/10.1038/323533a0' },
];

export default function AcademicAssistant() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  // Citation Generator opens a form first (author/date/title/publisher/URL) instead of running immediately.
  const [citationOpen, setCitationOpen] = useState(false);
  const [citation, setCitation] = useState({ author: '', date: '', title: '', publisher: '', source: '' });
  const queryRef = useRef(null);

  const runAnalysis = (queryText) => {
    setLoading(true);
    setError('');
    analyzeQuery(queryText)
      .then((res) => {
        // request.js already unwraps the Result envelope → res is the AnalysisVO
        const data = res ?? null;
        setResult(data);
      })
      .catch(() => {
        setResult(null);
        setError('Could not reach the assistant service. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    runAnalysis(query);
  };

  // Prefill the query box with the tool's prefix (do NOT run) and focus it, so the
  // user pastes the jargon/text they want simplified right after it, then submits.
  const handleToolPick = (prefix) => {
    const text = `${prefix}: `;
    setQuery(text);
    requestAnimationFrame(() => {
      const el = queryRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(text.length, text.length);
      }
    });
  };

  // Build a citation request from the form fields, then run it.
  const handleCitationSubmit = () => {
    const { author, date, title, publisher, source } = citation;
    if (!title.trim() && !author.trim()) return; // need at least a title or an author
    const details = [
      author && `Author: ${author}`,
      date && `Publication date: ${date}`,
      title && `Title: ${title}`,
      publisher && `Publisher: ${publisher}`,
      source && `URL or DOI: ${source}`,
    ].filter(Boolean).join('; ');
    const composed = `Generate a full citation for the following source in APA, MLA, and Harvard styles. `
      + `Clearly label each style on its own line. Source details — ${details}.`;
    setCitationOpen(false);
    runAnalysis(composed);
  };

  return (
    <div className={styles.pageWrapper}>
      <TopNav />

      <main className={styles.pageContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>Academic Assistant</h1>
          <p className={styles.subtitle}>Ask conceptual questions or analyze research papers.</p>
        </div>

        <div className={styles.layout}>
          <div className={styles.left}>
            {citationOpen && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Citation Generator</h3>
                  <button type="button" onClick={() => setCitationOpen(false)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 18, lineHeight: 1 }}>×</button>
                </div>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b7280' }}>
                  Enter the source details, then generate APA, MLA and Harvard citations.
                </p>
                {CITATION_FIELDS.map((f) => (
                  <div key={f.key} style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{f.label}</label>
                    <input
                      type="text"
                      value={citation[f.key]}
                      placeholder={f.placeholder}
                      onChange={(e) => setCitation((c) => ({ ...c, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <button type="button" onClick={handleCitationSubmit} disabled={loading}
                  style={{ marginTop: 6, padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'default' : 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Generating…' : 'Generate Citations'}
                </button>
              </div>
            )}
            <QueryCard value={query} onChange={setQuery} onSubmit={handleSubmit} loading={loading} inputRef={queryRef} />
            <div className={styles.toolGrid}>
              {TOOL_CARDS.map((tool) => (
                <ToolCard
                  key={tool.title}
                  icon={tool.icon}
                  title={tool.title}
                  description={tool.description}
                  onClick={() => (tool.mode === 'citation' ? setCitationOpen(true) : handleToolPick(tool.promptPrefix))}
                />
              ))}
            </div>
          </div>

          <div className={styles.right}>
            {loading ? (
              <div className={styles.stateBox}><div className={styles.loader} /><p>Analyzing your query…</p></div>
            ) : error ? (
              <div className={styles.stateBox}><p>{error}</p></div>
            ) : result ? (
              <ResultPanel result={result} />
            ) : (
              <div className={styles.stateBox}><p>Ask a question to see a structured analysis here.</p></div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
