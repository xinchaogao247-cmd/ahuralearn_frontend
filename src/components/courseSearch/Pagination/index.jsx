import React from 'react';
import styles from './pagination.module.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const renderPages = () => {
    let pages = [];
    
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 3) {
      pages = [1, 2, 3, '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      pages = [1, '...', totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }

    return pages;
  };

  return (
    <div className={styles.paginationContainer}>
      <button 
        className={styles.pageBtn} 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>

      <div className={styles.pagesWrapper}>
        {renderPages().map((page, index) => {
          if (page === '...') {
            return <span key={index} className={styles.dots}>...</span>;
          }

          return (
            <button
              key={index}
              className={`${styles.pageNumberBtn} ${currentPage === page ? styles.activePage : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button 
        className={styles.pageBtn} 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
