import React, { useMemo } from "react";
import { motion } from "motion/react";

const BALLS = ["🏀", "⚽", "🏐", "🎾", "🏈", "⚾", "🥎", "🎳"];

interface BallProps {
  icon: string;
  delay: number;
  duration: number;
  size: number;
  startX: number;
  startY: number;
}

const Ball = ({ icon, delay, duration, size, startX, startY }: BallProps) => {
  return (
    <motion.div
      initial={{ left: `${startX}%`, top: `${startY}%`, opacity: 0 }}
      animate={{
        left: [`${startX}%`, `${(startX + 20) % 100}%`, `${(startX + 50) % 100}%`, `${startX}%`],
        top: [`${startY}%`, `${(startY + 30) % 100}%`, `${(startY + 10) % 100}%`, `${startY}%`],
        rotate: [0, 360],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
      style={{
        position: "fixed",
        fontSize: size,
        pointerEvents: "none",
        zIndex: 5,
        userSelect: "none",
      }}
    >
      {icon}
    </motion.div>
  );
};

export const BouncingBallsBackground = () => {
  const balls = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      icon: BALLS[Math.floor(Math.random() * BALLS.length)],
      delay: Math.random() * 2,
      duration: 15 + Math.random() * 10,
      size: 40 + Math.random() * 40,
      startX: Math.random() * 90,
      startY: Math.random() * 90,
    }));
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none", zIndex: 5 }}>
      {balls.map((ball) => (
        <Ball key={ball.id} {...ball} />
      ))}
    </div>
  );
};
