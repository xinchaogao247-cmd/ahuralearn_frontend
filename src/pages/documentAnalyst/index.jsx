import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import TopNav from '../../components/common/TopNav';
import Footer from '../../components/common/Footer';
import DropZone from '../../components/documentAnalyst/DropZone';
import UploadList from '../../components/documentAnalyst/UploadList';
import FeaturePill from '../../components/documentAnalyst/FeaturePill';
import { uploadDocument, fetchDocuments, deleteDocument } from '../../api/ai/aiService';
import { showToast } from '../../components/common/toast';
import styles from './documentAnalyst.module.css';

const ACCEPTED = /\.(pdf|docx|pptx)$/i;

// Map a backend DocumentVo into an upload-list row.
function documentToRow(vo) {
  const processing = vo.status === 'PROCESSING';
  const documentId = vo.id == null ? undefined : String(vo.id);
  const fileSize = Number(vo.fileSize);
  return {
    id: `doc-${documentId ?? vo.originalName}`,
    documentId,
    name: vo.originalName,
    size: Number.isFinite(fileSize) ? fileSize : vo.fileSize,
    status: processing ? 'uploading' : 'done',
    progress: processing ? 95 : 100,
    url: vo.url,
  };
}

export default function DocumentAnalyst() {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  // Each row: { id, name, size, status: 'uploading'|'done'|'failed', progress, documentId, url }
  const [uploads, setUploads] = useState([]);

  // On load, repopulate from the backend so already-uploaded files survive a
  // page refresh (they persist server-side; React state alone does not).
  useEffect(() => {
    let cancelled = false;
    fetchDocuments()
      .then((res) => {
        // request.js already unwraps the Result envelope → res is the documents array
        const docs = Array.isArray(res) ? res : (res?.data ?? []);
        if (!cancelled && Array.isArray(docs)) setUploads(docs.map(documentToRow));
      })
      .catch(() => { /* no backend / empty list → just start with an empty list */ });
    return () => { cancelled = true; };
  }, []);

  const patchRow = (id, patch) =>
    setUploads((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  // Upload one already-added file. Files are stored in the cloud by the
  // backend; we keep the returned document record (id + url), never the file.
  const startUpload = useCallback((file, rowId) => {
    uploadDocument(file, (e) => {
      const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
      patchRow(rowId, { progress: pct });
    })
      .then((res) => {
        // request.js already unwraps the Result envelope → res is the UploadVO
        const doc = res ?? {};
        const documentId = doc.documentId ?? doc.id;
        patchRow(rowId, {
          status: documentId ? 'done' : 'failed',
          progress: 100,
          documentId: documentId ? String(documentId) : undefined,
          url: doc.url,
        });
      })
      .catch(() => {
        patchRow(rowId, { status: 'failed', progress: 100 });
      });
  }, []);

  const addFiles = useCallback(
    (fileList) => {
      // De-duplicate by name + size against BOTH the existing list and other
      // files in this same drop, so the exact same file can't be added twice.
      const seen = new Set(uploads.map((r) => `${r.name}|${r.size}`));
      const accepted = [];
      Array.from(fileList).forEach((file) => {
        if (!ACCEPTED.test(file.name)) {
          showToast(`"${file.name}" is not a supported type (PDF, DOCX, PPTX).`, 'warning');
          return;
        }
        const key = `${file.name}|${file.size}`;
        if (seen.has(key)) {
          showToast(`"${file.name}" has already been added.`, 'warning');
          return;
        }
        seen.add(key);
        accepted.push({ file, rowId: `${key}|${Date.now()}|${Math.random()}` });
      });
      if (!accepted.length) return;

      setUploads((prev) => [
        ...prev,
        ...accepted.map(({ file, rowId }) => ({
          id: rowId, name: file.name, size: file.size, status: 'uploading', progress: 0,
        })),
      ]);
      accepted.forEach(({ file, rowId }) => startUpload(file, rowId));
    },
    [uploads, startUpload]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeUpload = (id) => {
    const row = uploads.find((r) => r.id === id);
    // Drop it from the list right away for a responsive feel.
    setUploads((prev) => prev.filter((r) => r.id !== id));
    // If it was saved on the backend, delete it there too — otherwise it would
    // come back on the next refresh (fetchDocuments reloads it from the DB).
    if (row?.documentId) {
      deleteDocument(row.documentId).catch(() => {
        showToast('Could not delete the file on the server. It may reappear on refresh.', 'warning');
      });
    }
  };

  // Carry the uploaded documents to the summary page so it can offer a
  // per-file dropdown when more than one file was uploaded.
  const goToSummary = () => {
    const documents = uploads
      .filter((r) => r.status !== 'failed' && r.documentId)
      .map((r) => ({ id: String(r.documentId), name: r.name }));
    if (!documents.length) {
      showToast('Please wait until the upload finishes before opening the summary.', 'warning');
      return;
    }
    navigate('/aiSummarization', { state: { documents } });
  };

  const hasUploads = uploads.some((r) => r.status !== 'failed' && r.documentId);

  return (
    <div className={styles.pageWrapper}>
      <TopNav />

      <main className={styles.pageContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>Upload Course Materials</h1>
          <p className={styles.subtitle}>Our AI will process your documents</p>
        </div>

        <div className={styles.content}>
          <DropZone
            dragging={dragging}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onFiles={addFiles}
          />

          <UploadList uploads={uploads} onRemove={removeUpload} />

          <div className={styles.pillRow}>
            <FeaturePill
              icon={<Sparkles size={22} color="#2563eb" />}
              title="AI Analysis"
              description="Smart categorization and indexing of all your content."
            />
            <FeaturePill
              icon={<ShieldCheck size={22} color="#2563eb" />}
              title="Secure Storage"
              description="Your files are stored securely in the cloud, private to your account."
            />
          </div>

          {hasUploads && (
            <div className={styles.summaryRow}>
              <button type="button" className={styles.summaryButton} onClick={goToSummary}>
                View AI Summary
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
