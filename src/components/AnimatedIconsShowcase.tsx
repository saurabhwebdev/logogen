'use client';

import React, { useEffect, useState } from 'react';
import {
  Heart, Star, Sun, Moon, Cloud,
  Music, Camera, Coffee, Compass, Feather,
  Flag, Gift, Globe, Home, Key
} from 'lucide-react';

const icons = [Heart, Star, Sun, Moon, Cloud, Music, Camera, Coffee, Compass, Feather, Flag, Gift, Globe, Home, Key];

const backgrounds = [
  'bg-gradient-to-r from-violet-500/90 to-indigo-500/90',
  'bg-gradient-to-r from-blue-500/90 to-cyan-500/90',
  'bg-gradient-to-r from-rose-500/90 to-pink-500/90',
  'bg-gradient-to-r from-amber-500/90 to-orange-500/90',
  'bg-gradient-to-r from-emerald-500/90 to-teal-500/90'
];

interface IconState {
  Icon: typeof icons[0];
  background: string;
  opacity: number;
  scale: number;
}

const AnimatedIconsShowcase: React.FC = () => {
  const [iconStates, setIconStates] = useState<IconState[]>([]);

  // Initialize and update icons
  useEffect(() => {
    const updateIcons = () => {
      const shuffled = [...icons]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map(Icon => ({
          Icon,
          background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
          opacity: 1,
          scale: 1
        }));
      
      // Fade out current icons
      setIconStates(prev => {
        if (prev.length === 0) return shuffled;
        return prev.map(state => ({
          ...state,
          opacity: 0,
          scale: 0.8
        }));
      });

      // Fade in new icons after a short delay
      setTimeout(() => {
        setIconStates(shuffled);
      }, 200);
    };

    updateIcons();
    const interval = setInterval(updateIcons, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4">
      {iconStates.map((state, index) => (
        <div
          key={index}
          className={`
            p-2 rounded-lg
            ${state.background}
            shadow-sm
            transition-all duration-500 ease-in-out
            hover:shadow-md hover:scale-110
          `}
          style={{
            opacity: state.opacity,
            transform: `scale(${state.scale})`,
          }}
        >
          <state.Icon 
            className="w-5 h-5 text-white/90 transition-transform duration-300 hover:scale-110"
          />
        </div>
      ))}
    </div>
  );
};

export default AnimatedIconsShowcase;
