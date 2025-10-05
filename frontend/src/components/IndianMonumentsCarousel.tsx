'use client';

import React from 'react';

interface IndianMonumentsCarouselProps {
  showOverlay?: boolean;
  overlayOpacity?: number;
  className?: string;
}

/**
 * Auto-sliding background carousel of famous Indian monuments
 * Features smooth fade transitions and responsive images
 */
export default function IndianMonumentsCarousel({
  showOverlay = true,
  overlayOpacity = 0.4,
  className = ''
}: IndianMonumentsCarouselProps) {
  const monuments = [
    {
      url: '/monuments/abhinav-sharma-terkRDo1pt8-unsplash.jpg',
      alt: 'Taj Mahal, Agra - Symbol of eternal love'
    },
    {
      url: '/monuments/istockphoto-1146517111-612x612.jpg',
      alt: 'Mysore Palace - Illuminated at night'
    },
    {
      url: '/monuments/Rajasthan.jpg.webp',
      alt: 'Hawa Mahal, Jaipur - Palace of Winds'
    },
    {
      url: '/monuments/adarsh-prakas-NYEy6u4Au9I-unsplash.jpg',
      alt: 'India Gate, Delhi - War memorial'
    },
    {
      url: '/monuments/harsharan-singh-AGC8TusV2tI-unsplash.jpg',
      alt: 'Golden Temple, Amritsar - Spiritual sanctuary'
    },
    {
      url: '/monuments/iStock_000058485880_XXXLarge.jpg',
      alt: 'Gateway of India, Mumbai - Historic arch monument'
    },
    {
      url: '/monuments/nikhil-patel-Qrlslz4O9NQ-unsplash.jpg',
      alt: 'Qutub Minar, Delhi - Ancient minaret'
    },
    {
      url: '/monuments/attr_1568_20191102174918.jpg',
      alt: 'Sanchi Stupa - Buddhist monument'
    },
    {
      url: '/monuments/Bengaluru-Vidhana-Soudha-could-be-worth-over-Rs-3900-crores-FB-1200x700-compressed.jpg',
      alt: 'Vidhan Soudha, Bengaluru - Legislative building'
    },
    {
      url: '/monuments/premium_photo-1661919589683-f11880119fb7.avif',
      alt: 'Red Fort, Delhi - Historic fortification'
    },
    {
      url: '/monuments/city-palace-udaipur-rajasthan-1-musthead-hero.jpeg',
      alt: 'City Palace, Udaipur - Royal residence'
    },
    {
      url: '/monuments/attr_1448_20190212100722jpg.jpeg',
      alt: 'Amber Fort, Jaipur - Hilltop fortress'
    },
    {
      url: '/monuments/manikarnika-ghat-city-hero.jpeg',
      alt: 'Varanasi Ghats at sunset - Sacred riverfront'
    },
    {
      url: '/monuments/Hampi-places-to-visit-FI.jpg',
      alt: 'Hampi - Ancient ruins and temples'
    },
    {
      url: '/monuments/jayanth-muppaneni-CVUAJlOhzpM-unsplash.jpg',
      alt: 'Indian architectural marvel'
    },
    {
      url: '/monuments/mahendra-maddirala-x3y2phkf7fI-unsplash.jpg',
      alt: 'Historic Indian monument'
    },
    {
      url: '/monuments/premium_photo-1661962404003-e0ca40da40ef.avif',
      alt: 'Beautiful Indian heritage site'
    },
    {
      url: '/monuments/premium_photo-1697729600773-5b039ef17f3b.avif',
      alt: 'Majestic Indian architecture'
    },
    {
      url: '/monuments/Untitled-design-2024-07-17T005119.143.jpg',
      alt: 'Indian monument panorama'
    }
  ];

  // Calculate animation timing: 4 seconds per slide
  const totalDuration = monuments.length * 4;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Carousel Container */}
      <div className="carousel-container w-full h-full">
        {monuments.map((monument, index) => (
          <div
            key={index}
            className="carousel-slide"
            style={{
              animationDelay: `${index * 4}s`
            }}
          >
            <img
              src={monument.url}
              alt={monument.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Dark Overlay for Text Readability */}
      {showOverlay && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* CSS Animation Styles */}
      <style jsx>{`
        .carousel-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .carousel-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          animation: slideShow ${totalDuration}s infinite;
        }

        @keyframes slideShow {
          0% {
            opacity: 0;
            transform: scale(1);
          }
          1.5% {
            opacity: 1;
            transform: scale(1.05);
          }
          ${(4 / totalDuration) * 100 - 1.5}% {
            opacity: 1;
            transform: scale(1.05);
          }
          ${(4 / totalDuration) * 100}% {
            opacity: 0;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        /* Ensure smooth transitions with GPU acceleration */
        .carousel-slide img {
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
