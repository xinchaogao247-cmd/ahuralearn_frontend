import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Pause, Maximize, Loader } from 'lucide-react';
import { saveVideoProgress } from '../../../api/course/course';
import styles from './VideoPlayer.module.css';

const formatTime = (timeInSeconds) => {
  if (!timeInSeconds || isNaN(timeInSeconds)) return '00:00';
  const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function VideoPlayer({ lesson, lastWatchTime, onLessonComplete }) {
  const { courseId } = useParams();

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const isCompletedRef = useRef(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // ----- Resume Playback -----
  useEffect(() => {
    
    isCompletedRef.current = false;
    setIsFinished(false);
    setIsPlaying(false);
    setIsVideoLoading(true);
    setCurrentTime(lastWatchTime || 0);

    const videoEl = videoRef.current;
    if (videoEl && lastWatchTime > 0) {
      videoEl.currentTime = lastWatchTime;
    }
  }, [lesson, lastWatchTime]);

  // send record request per 15s
  useEffect(() => {
    let intervalId;
    if (isPlaying && courseId && lesson?.id) {
      intervalId = setInterval(async () => {
        try {
          setIsSaving(true);
          const currTime = videoRef.current?.currentTime || 0;
          const firstFinish = await saveVideoProgress(Number(courseId), lesson.id, Math.floor
            (currTime));

          if (firstFinish && !isFinished) {
            setIsFinished(true);
          }
          setTimeout(() => setIsSaving(false), 2000);
        } catch (err) {
          console.error("Failed to save progress", err);
          setIsSaving(false);
        }
      }, 15000);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, courseId, lesson?.id]);

  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play();
      setIsPlaying(true);
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  useEffect(() => {
    if (isFinished && !isCompletedRef.current) {
      isCompletedRef.current = true;
      if (onLessonComplete) {
        onLessonComplete(lesson.id);
      }
    }
  }, [isFinished, lesson?.id, onLessonComplete]);

  return (
    <div>
      <div className={styles.playerContainer} ref={containerRef}>
        {isVideoLoading && (
          <div className={styles.loaderOverlay}>
            <Loader className={styles.loaderSpinner} size={48} />
          </div>
        )}
        <video
          ref={videoRef}
          src={lesson.videoUrl}
          className={styles.videoElement}
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onLoadStart={() => setIsVideoLoading(true)}
          onWaiting={() => setIsVideoLoading(true)}
          onCanPlay={() => setIsVideoLoading(false)}
          onPlaying={() => { setIsPlaying(true); setIsVideoLoading(false); }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          poster={lesson.thumbnailUrl}
        />

        <div className={styles.controlsWrapper}>
          
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className={styles.progressInput}
            />
          </div>

          <div className={styles.controlsRow}>
            <button className={styles.controlButton} onClick={togglePlay}>
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>

            <div className={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <div style={{ flex: 1 }}></div>

            <button className={styles.controlButton} onClick={toggleFullscreen}>
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ minHeight: "24px" }}>
        {isSaving && (
          <div className={styles.savingIndicator}>
            <div className={styles.savingIndicatorDot}></div>
            Saving progress...
          </div>
        )}
      </div>
    </div>
  );
}
