import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LessonInstructorCard.module.css';

export default function LessonInstructorCard({ instructorDetails }) {
  const navigate = useNavigate();

  if (!instructorDetails) return null;

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.instructorTitle}>Instructor</h3>
      
      <div className={styles.profileInfo}>
        {instructorDetails.avatar && (
           <img 
             src={instructorDetails.avatar} 
             alt={instructorDetails.name} 
             className={styles.avatar} 
           />
        )}
        <div className={styles.nameBlock}>
          <h4 className={styles.name}>{instructorDetails.name}</h4>
        </div>
      </div>

      {instructorDetails.bio && (
        <p className={styles.bio}>{instructorDetails.bio}</p>
      )}
    </div>
  );
}
