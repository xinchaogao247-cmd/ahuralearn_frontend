import React from 'react';
import TopNav from '../../components/common/TopNav';
import HeroBanner from '../../components/homepage/HeroBanner';
import TrendingCourses from '../../components/homepage/TrendingCourses';
import NewRecommendations from '../../components/homepage/NewRecommendations';
import Footer from '../../components/common/Footer';

import styles from './homepage.module.css';

export default function Homepage() {
  return (
    <div className={styles.homepageContainer}>
      <TopNav />

      <HeroBanner />

      <main className={styles.homepageMainContent}>
        <TrendingCourses />

        <NewRecommendations />
      </main>

      <Footer />
    </div>
  );
}
