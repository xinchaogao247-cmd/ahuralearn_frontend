import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHeroBanners } from '../../../api/course/course';
import { Link } from 'react-router-dom';
import styles from './HeroBanner.module.css';
import { showToast } from '../../common/toast';

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [transitionDuration, setTransitionDuration] = useState(500);
  const isTransitioning = React.useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await getHeroBanners();

        setBanners(response);
      } catch (err) {
        // 请求报错时的处理机制 (Error Handling)
        showToast('Failed to load banners.', 'error');
        // skeleton placeholder banners
        setBanners([
          {
            title: 'Banner 1',
            isPlaceholder: true,
            targetUrl: '#'
          },
          {
            title: 'Banner 2',
            isPlaceholder: true,
            targetUrl: '#'
          },
          {
            title: 'Banner 3',
            isPlaceholder: true,
            targetUrl: '#'
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  /**
   * left arrow
   */
  const handlePrev = () => {
    if (banners.length <= 1 || isTransitioning.current) return;
    isTransitioning.current = true;
    setTransitionDuration(500);
    setCurrentIndex((prevIndex) => prevIndex - 1);
  };

  /**
   * right arrow
   */
  const handleNext = () => {
    if (banners.length <= 1 || isTransitioning.current) return;
    isTransitioning.current = true;
    setTransitionDuration(500);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  /**
   * to implement the infinite loop effect, we need to listen to the transition end event
   * when the transition ends, we check if we are at the cloned first or last slide, and jump to the    real first or last slide without transition
   * this is a common technique for infinite carousels
   */
  const handleTransitionEnd = () => {
    isTransitioning.current = false;
    if (currentIndex === 0) {
      setTransitionDuration(0);
      setCurrentIndex(banners.length);
    } else if (currentIndex === banners.length + 1) {
      setTransitionDuration(0);
      setCurrentIndex(1);
    }
  };

  /**
   * switch to next banner every 3 seconds
   */
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      if (!isTransitioning.current) {
        isTransitioning.current = true;
        setTransitionDuration(500);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [banners.length, currentIndex]);

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.carouselWrapper}>
        {loading && <div className={styles.loadingText}>Loading banners...</div>}

        {!loading && banners.length > 0 && (
          <>
            <div
              className={styles.slider}
              style={{
                transform: `translateX(-${(banners.length > 1 ? currentIndex : 0) * 100}%)`,
                transition: `transform ${transitionDuration}ms ease-in-out`
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {(banners.length > 1 ? [banners[banners.length - 1], ...banners, banners[0]] : banners).map((banner, index) => (
                <Link
                  key={index}
                  to={banner.targetUrl}
                  className={styles.slideItem}
                  style={banner.isPlaceholder ? { pointerEvents: 'none' } : {}} // if it's just a skeleton, disable pointer events to prevent clicking
                >
                  {banner.isPlaceholder ? (
                    <div className={styles.placeholderBanner}>
                      <span>{banner.title}</span>
                    </div>
                  ) : (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className={styles.carouselImage}
                    />
                  )}
                </Link>
              ))}
            </div>

            {banners.length > 1 && (
              <>
                <button className={`${styles.heroArrowButton} ${styles.heroArrowLeft}`} onClick={handlePrev}>
                  <ChevronLeft size={36} />
                </button>
                <button className={`${styles.heroArrowButton} ${styles.heroArrowRight}`} onClick={handleNext}>
                  <ChevronRight size={36} />
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}