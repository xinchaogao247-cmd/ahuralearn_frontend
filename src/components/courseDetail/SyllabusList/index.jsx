import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './SyllabusList.module.css';

export default function SyllabusList({ syllabusData }) {
  
  const [expandedId, setExpandedId] = useState(null);

  const toggleAccordion = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  if (!syllabusData || syllabusData.length === 0) {
    return <div className={styles.syllabusEmptyText}>No syllabus available.</div>;
  }

  return (
    <div className={styles.syllabusContainer}>
      <h2 className={styles.syllabusTitle}>Syllabus</h2>
      <div className={styles.accordionList}>
        {syllabusData.map((item, index) => {
          const isExpanded = expandedId === item.id;
          
          return (
            <div 
              key={item.id || index} 
              className={`${styles.accordionItem} ${isExpanded ? styles.expanded : ''}`}
            >
              <div 
                className={styles.accordionHeader} 
                onClick={() => toggleAccordion(item.id)}
              >
                <div className={styles.accordionLeft}>
                  
                  <div className={styles.weekNumberCircle}>
                    {index + 1}
                  </div>
                  <div className={styles.accordionTitleBox}>
                    <h4 className={styles.accordionTitle}>{item.title}</h4>
                    <p className={styles.accordionSummary}>{item.description}</p>
                  </div>
                </div>
                
                <div className={styles.accordionRight}>
                  {isExpanded ? (
                    <ChevronUp className={styles.chevronIcon} size={24} />
                  ) : (
                    <ChevronDown className={styles.chevronIcon} size={24} />
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className={styles.accordionBody}>
                  {item.sections && item.sections.length > 0 ? (
                    <ul className={styles.sectionList}>
                      {item.sections.map((section, idx) => (
                        <li key={section.id || idx} className={styles.sectionItem}>
                          <div className={styles.sectionLeft}>
                            <span className={styles.sectionIcon}>▶</span>
                            <span className={styles.sectionTitle}>{section.title}</span>
                          </div>
                          {(section.durationFormat || section.duration) && (
                            <span className={styles.sectionDuration}>
                              {section.durationFormat || `${section.duration} seconds`}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.placeholderText}>
                      No sections available for this chapter.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
