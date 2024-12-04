'use client';

import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  duration?: number;
}

interface Particle {
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  gravity: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'circle' | 'square' | 'triangle';
}

const Confetti: React.FC<ConfettiProps> = ({ duration = 2000 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>();
  const startTime = useRef<number>(0);

  const colors = [
    '#FF1461', '#18FF92', '#5A87FF', '#FBF38C',
    '#FF85FF', '#FF432E', '#00E4FF', '#90FF00',
    '#FFB800', '#FF5E00', '#FF00E4', '#00FFA8'
  ];

  const createParticle = (x: number, y: number, direction: 'top' | 'bottom' | 'left' | 'right'): Particle => {
    const size = Math.random() * 8 + 6;
    let angle: number;
    let speed = Math.random() * 8 + 4;
    
    switch (direction) {
      case 'top':
        angle = Math.random() * Math.PI + Math.PI; // Downward
        speed *= 0.7; // Slower for top particles
        break;
      case 'bottom':
        angle = Math.random() * Math.PI; // Upward
        break;
      case 'left':
        angle = Math.random() * Math.PI - Math.PI / 2; // Rightward
        break;
      case 'right':
        angle = Math.random() * Math.PI + Math.PI / 2; // Leftward
        break;
    }
    
    return {
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      size,
      speedX: Math.cos(angle) * speed,
      speedY: Math.sin(angle) * speed + (direction === 'bottom' ? -10 : 0),
      gravity: direction === 'top' ? 0.3 : 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      opacity: 1,
      shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle'
    };
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;

    switch (particle.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(-particle.size / 2, particle.size / 2);
        ctx.lineTo(particle.size / 2, particle.size / 2);
        ctx.lineTo(0, -particle.size / 2);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  };

  const initParticles = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    particles.current = [];

    // Bottom burst points
    const bottomPoints = [
      { x: canvas.width * 0.2, y: canvas.height },
      { x: canvas.width * 0.4, y: canvas.height },
      { x: canvas.width * 0.6, y: canvas.height },
      { x: canvas.width * 0.8, y: canvas.height }
    ];

    // Top burst points
    const topPoints = [
      { x: canvas.width * 0.3, y: 0 },
      { x: canvas.width * 0.5, y: 0 },
      { x: canvas.width * 0.7, y: 0 }
    ];

    // Side burst points
    const leftPoints = [
      { x: 0, y: canvas.height * 0.3 },
      { x: 0, y: canvas.height * 0.6 }
    ];

    const rightPoints = [
      { x: canvas.width, y: canvas.height * 0.4 },
      { x: canvas.width, y: canvas.height * 0.7 }
    ];

    // Create particles from each point
    bottomPoints.forEach(point => {
      for (let i = 0; i < 30; i++) {
        particles.current.push(createParticle(point.x, point.y, 'bottom'));
      }
    });

    topPoints.forEach(point => {
      for (let i = 0; i < 20; i++) {
        particles.current.push(createParticle(point.x, point.y, 'top'));
      }
    });

    leftPoints.forEach(point => {
      for (let i = 0; i < 15; i++) {
        particles.current.push(createParticle(point.x, point.y, 'left'));
      }
    });

    rightPoints.forEach(point => {
      for (let i = 0; i < 15; i++) {
        particles.current.push(createParticle(point.x, point.y, 'right'));
      }
    });
  };

  const animate = (timestamp: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!startTime.current) {
      startTime.current = timestamp;
    }

    const progress = timestamp - startTime.current;
    const fadeStart = duration * 0.7;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.current = particles.current.filter(particle => {
      // Remove particles that are off screen or fully transparent
      return particle.opacity > 0 &&
             particle.x > -50 && particle.x < canvas.width + 50 &&
             particle.y > -50 && particle.y < canvas.height + 50;
    });

    particles.current.forEach(particle => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.speedY += particle.gravity;

      // Add some wind effect
      particle.speedX += (Math.random() - 0.5) * 0.1;

      // Update rotation
      particle.rotation += particle.rotationSpeed;

      // Fade out particles gradually
      if (progress > fadeStart) {
        particle.opacity = Math.max(0, particle.opacity - 0.02);
      }

      // Add some natural movement
      particle.x += Math.sin(timestamp / 1000 + particle.rotation) * 0.3;

      drawParticle(ctx, particle);
    });

    if (progress < duration && particles.current.length > 0) {
      animationFrameId.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize and start animation
    initParticles();
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
};

export default Confetti;
