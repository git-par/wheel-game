import React, { useState, useRef, useEffect } from "react";
import styles from "./MediaCarousel.module.scss";

const MediaCarousel = ({ mediaItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const sliderRef = useRef(null);
  const currentItem = mediaItems[currentIndex];

  // Transition effect for slides
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex]);

  // Update video state when current item changes
  useEffect(() => {
    if (currentItem.type === "video" && videoRef.current) {
      videoRef.current.muted = isMuted;
      // Reset play state when changing items
      setIsPlaying(false);
    }
  }, [currentIndex, isMuted, currentItem]);

  // Pause video when changing slides
  const handleSlideChange = (newIndex) => {
    // Pause current video if it's playing
    if (currentItem.type === "video" && videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    // Change to the new slide
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const nextIndex =
      currentIndex === mediaItems.length - 1 ? 0 : currentIndex + 1;
    handleSlideChange(nextIndex);
  };

  const goToPrevious = () => {
    const prevIndex =
      currentIndex === 0 ? mediaItems.length - 1 : currentIndex - 1;
    handleSlideChange(prevIndex);
  };

  const togglePlay = () => {
    if (currentItem.type === "video") {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (currentItem.type === "video" && videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  return (
    <div
      className={styles.carouselContainer}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Media Display with Slider */}
      <div className={styles.sliderWrapper}>
        <div ref={sliderRef} className={styles.slider}>
          {mediaItems.map((item, index) => (
            <div key={index} className={styles.slide}>
              {item.type === "image" ? (
                <img
                  src={item.src}
                  alt={item.alt || "Carousel image"}
                  className={styles.media}
                />
              ) : (
                <video
                  ref={index === currentIndex ? videoRef : null}
                  className={styles.media}
                  src={item.src}
                  onEnded={() => setIsPlaying(false)}
                  muted={isMuted}
                  loop={item.loop}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div
        className={`${styles.navigationControls} ${
          isHovering ? styles.visible : ""
        }`}
      >
        <button
          className={styles.navButton}
          onClick={goToPrevious}
          aria-label="Previous"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={styles.navIcon}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          className={styles.navButton}
          onClick={goToNext}
          aria-label="Next"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={styles.navIcon}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Bottom Controls */}
      <div
        className={`${styles.bottomControls} ${
          isHovering ? styles.visible : ""
        }`}
      >
        {/* Left control area */}
        <div className={styles.controlArea}>
          {currentItem.type === "video" && (
            <button
              className={styles.controlButton}
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.controlIcon}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.controlIcon}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Center indicator area - always centered */}
        <div className={styles.indicators}>
          {mediaItems.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                currentIndex === index ? styles.active : ""
              }`}
              onClick={() => handleSlideChange(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Right control area */}
        <div className={styles.controlArea}>
          {currentItem.type === "video" && (
            <button
              className={styles.controlButton}
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.controlIcon}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.controlIcon}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaCarousel;
