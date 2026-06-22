import React from 'react';
import styles from './filterMenu.module.css';

export default function FilterMenu({ filters, onFilterChange }) {
  return (
    <div className={styles.filterMenuContainer}>
      <div className={styles.filtersWrapper}>
        {/* Rating Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Course Rating</label>
          <div className={styles.selectWrapper}>
            <select 
              className={styles.select}
              value={filters.minRating}
              onChange={(e) => onFilterChange('minRating', e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5 & Up</option>
              <option value="4.0">4.0 & Up</option>
              <option value="3.5">3.5 & Up</option>
            </select>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>Difficulty</label>
          <div className={styles.selectWrapper}>
            <select 
              className={styles.select}
              value={filters.difficulty}
              onChange={(e) => onFilterChange('difficulty', e.target.value)}
            >
              <option value="">Any Difficulty</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sort Filter */}
      <div className={styles.sortWrapper}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Sort by</label>
          <div className={styles.selectWrapper}>
            <select 
              className={styles.select}
              value={filters.sortBy}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
            >
              <option value="relevance">Most Relevant</option>
              <option value="highest_rated">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
