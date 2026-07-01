import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import TopNav from '../../components/common/TopNav';
import Footer from '../../components/common/Footer';
import SummaryPanel from '../../components/aiSummarization/SummaryPanel';
import ChatPanel from '../../components/aiSummarization/ChatPanel';
import { fetchDocuments, fetchSummary, regenerateSummary, sendSummaryChat } from '../../api/ai/aiService';
import styles from './aiSummarization.module.css';

const GREETING = { role: 'ai', text: 'Hello! I am your AI tutor. How can I help you with this document today?' };

function normalizeDocument(doc) {
  const id = doc?.documentId ?? doc?.id;
  if (id == null) return null;
  return {
    id: String(id),
    name: doc.name ?? doc.originalName ?? doc.filename ?? 'Untitled document',
    status: doc.status,
  };
}

function normalizeDocuments(docs) {
  if (!Array.isArray(docs)) return [];
  return docs.map(normalizeDocument).filter(Boolean);
}

export default function AiSummarization() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialDocuments = normalizeDocuments(location.state?.documents ?? []);
  const initialDocumentName = initialDocuments[0]?.name ?? null;

  // Documents arrive from the Document Analyst page via navigation state.
  const [documents, setDocuments] = useState(initialDocuments);
  const [activeId, setActiveId] = useState(initialDocuments[0]?.id ?? null);

  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [summaryMessage, setSummaryMessage] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  // Refresh from the backend so direct page loads and stale navigation state
  // recover to exact string ids returned by the API.
  useEffect(() => {
    let cancelled = false;
    fetchDocuments()
      .then((res) => {
        if (cancelled) return;
        // request.js already unwraps the Result envelope → res is the documents array
        const backendDocuments = normalizeDocuments(res);
        if (!backendDocuments.length) return;
        const matchingDocument = initialDocumentName
          ? backendDocuments.find((doc) => doc.name === initialDocumentName)
          : null;
        setDocuments(backendDocuments);
        setActiveId((currentId) => {
          if (backendDocuments.some((doc) => doc.id === String(currentId))) {
            return String(currentId);
          }
          return matchingDocument?.id ?? backendDocuments[0].id;
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Fall back to the first document if the selected id isn't in the current
  // list (e.g. the document set changed), so the header is never blank.
  const activeDoc = documents.find((d) => d.id === String(activeId)) ?? documents[0] ?? null;
  const activeDocId = activeDoc?.id ?? null;

  // Load the selected document's summary; reset the chat for the new document.
  useEffect(() => {
    if (activeDocId == null) return;
    setMessages([GREETING]);
    setSummary('');
    setKeyPoints([]);
    setSummaryMessage('');
    setSummaryLoading(true);
    let cancelled = false;
    fetchSummary(activeDocId)
      .then((res) => {
        if (cancelled) return;
        // request.js already unwraps the Result envelope → res is the payload object
        const data = res ?? {};
        setSummary(data.summary || '');
        setKeyPoints(Array.isArray(data.keyPoints) ? data.keyPoints : []);
        setSummaryMessage(data.message || '');
      })
      .catch(() => {
        if (!cancelled) {
          setSummaryMessage('Could not load this summary yet. Go back to Upload and open the document again.');
        }
      })
      .finally(() => { if (!cancelled) setSummaryLoading(false); });
    return () => { cancelled = true; };
  }, [activeDocId]);

  const handleRegenerate = useCallback(() => {
    if (activeDocId == null) return;
    setSummaryLoading(true);
    // Backend regenerate returns only { message, documentId }, so re-fetch the
    // summary afterwards to load the freshly generated text + key points.
    regenerateSummary(activeDocId)
      .then(() => fetchSummary(activeDocId))
      .then((res) => {
        // request.js already unwraps the Result envelope → res is the payload object
        const data = res ?? {};
        setSummary(data.summary || '');
        setKeyPoints(Array.isArray(data.keyPoints) ? data.keyPoints : []);
        setSummaryMessage(data.message || '');
      })
      .catch(() => {
        setSummaryMessage('Could not regenerate this summary. Please try again.');
      })
      .finally(() => setSummaryLoading(false));
  }, [activeDocId]);

  const handleCopy = () => {
    navigator.clipboard?.writeText([summary, ...keyPoints].filter(Boolean).join('\n')).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    sendSummaryChat({ documentId: activeDocId, userMessage: text })
      .then((res) => {
        // Backend ChatMessageVo returns the reply in `text`.
        // request.js already unwraps the Result envelope → res is the payload object
        const data = res ?? {};
        const reply = data.text ?? data.reply ?? '';
        setMessages((prev) => [...prev, { role: 'ai', text: reply || 'Here is what I found in this document.' }]);
      })
      .catch(() => {
        setMessages((prev) => [...prev, { role: 'ai', text: 'I could not reach the tutor service. Please try again.' }]);
      })
      .finally(() => setTyping(false));
  };

  return (
    <div className={styles.pageWrapper}>
      <TopNav />

      <main className={styles.pageContainer}>
        {/* Fix #9: a clear back button out of the summary view. */}
        <div className={styles.topBar}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/documentAnalyst')}>
            <ArrowLeft size={16} />
            Back to Upload
          </button>

          <nav className={styles.breadcrumb}>
            <span>Document Analyst</span>
            <ChevronRight size={14} />
            <span className={styles.crumbActive}>AI Summarization</span>
          </nav>
        </div>

        {documents.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No document selected. Upload a course file first, then open its summary.</p>
          </div>
        ) : (
          <div className={styles.layout}>
            <SummaryPanel
              summary={summary}
              keyPoints={keyPoints}
              loading={summaryLoading}
              message={summaryMessage}
              copied={copied}
              onRegenerate={handleRegenerate}
              onCopy={handleCopy}
            />
            <ChatPanel
              documentName={activeDoc?.name}
              documents={documents}
              activeDocId={activeDocId}
              onSelectDoc={setActiveId}
              messages={messages}
              typing={typing}
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
