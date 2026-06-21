import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerLeft}>
        <Link to="/homepage" className={styles.footerLogoArea}>
          <h2 className={styles.footerLogoTitle}>AhuraLearn</h2>
        </Link>
        <p className={styles.footerDescription}>
          Empowering learners worldwide with affordable and expert-led education.
        </p>
      </div>

      <div className={styles.footerLinksContainer}>
        
        <div className={styles.footerColumn}>
          <h3 className={styles.footerColumnTitle}>Explore</h3>
          <a href="#" className={styles.footerLinkItem}>Business</a>
          <a href="#" className={styles.footerLinkItem}>Tech</a>
          <a href="#" className={styles.footerLinkItem}>Design</a>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerColumnTitle}>Company</h3>
          <a href="#" className={styles.footerLinkItem}>About Us</a>
          <a href="#" className={styles.footerLinkItem}>Careers</a>
          <a href="#" className={styles.footerLinkItem}>Terms</a>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerColumnTitle}>Support</h3>
          <a href="#" className={styles.footerLinkItem}>Help Center</a>
          <a href="#" className={styles.footerLinkItem}>Affiliate</a>
          <a href="#" className={styles.footerLinkItem}>Contact Us</a>
        </div>
        
      </div>
    </footer>
  );
}
