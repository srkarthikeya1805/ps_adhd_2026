import React from 'react';
import { motion } from 'framer-motion';

interface AuraBounceHeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'p' | 'span';
  delay?: number;
  gradient?: boolean;
}

/**
 * Bouncing spring heading that floats up smoothly on scroll,
 * inspired directly by https://auraeeg.com typography and scroll dynamics.
 */
export const AuraBounceHeading: React.FC<AuraBounceHeadingProps> = ({
  children,
  className = '',
  as = 'h2',
  delay = 0.05,
  gradient = false,
}) => {
  const Component = motion[as] as any;

  return (
    <Component
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 18,
        mass: 0.8,
        delay,
      }}
      className={`${gradient ? 'aura-gradient-title' : ''} ${className}`}
    >
      {children}
    </Component>
  );
};

interface AuraScrollParagraphProps {
  text: string;
  className?: string;
  delay?: number;
}

/**
 * Word-by-word staggered spring float and highlight on scroll,
 * recreating the signature AURA EEG text reveal on scroll.
 */
export const AuraScrollParagraph: React.FC<AuraScrollParagraphProps> = ({
  text,
  className = 'text-sm md:text-base text-[#C9E5FF]/80 leading-relaxed font-normal',
  delay = 0.1,
}) => {
  const words = text.split(' ');

  return (
    <motion.p
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ staggerChildren: 0.025, delayChildren: delay }}
      className={`flex flex-wrap gap-x-1.5 gap-y-1 ${className}`}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0.15, y: 14, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 16,
              },
            },
          }}
          className="desc-word"
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
};

interface AuraBounceBoxProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Bouncing spring container for cards, metrics, and interactive blocks on scroll.
 */
export const AuraBounceBox: React.FC<AuraBounceBoxProps> = ({
  children,
  className = '',
  delay = 0.05,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        mass: 0.9,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
