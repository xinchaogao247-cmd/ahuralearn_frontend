import React from 'react';
import styles from './submitConfirmModal.module.css';

export default function SubmitConfirmModal({ isOpen, flaggedCount, onCancel, onConfirm }) {
  // nothing to render if isOpen is false
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.title}>
          You have completed all questions. Are you sure you want to submit?
        </h3>

        {flaggedCount !== 0 && (
          <div className={styles.warningText}>
            Note: You still have {flaggedCount} questions marked for review.
          </div>
        )}

        <div className={styles.buttonsWrapper}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Go Back
          </button>

          <button className={styles.submitBtn} onClick={onConfirm}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
