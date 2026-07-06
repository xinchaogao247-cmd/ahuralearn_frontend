import React from 'react';
import styles from './LeftBanner.module.css';
import bgImage from '../../../assets/images/bg.png';

export default function LeftBanner() {
  return (
    <div className={styles.bannerWrapper}>

      <div className={styles.bannerBackgroundImage} style={{ backgroundImage: `url(${bgImage})` }}></div>

      <div className={styles.bannerTitleWrapper}>
        <h1 className={styles.bannerTitle}>
          Unlock Your<br />
          Potential<br />
          with AhuraLearn.
        </h1>
        <p className={styles.bannerDescription}>
          Join a community of dedicated learners and<br />
          access premium resources designed to elevate<br />
          your professional journey.
        </p>
      </div>
    </div>
  );
}