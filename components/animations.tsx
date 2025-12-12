'use client'

import { motion, Variants, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

// Fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

// Easing values
const easeOut = [0.4, 0, 0.2, 1] as const

// Slide up animation
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
}

// Slide in from left
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOut } },
}

// Slide in from right
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOut } },
}

// Scale up animation
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: easeOut } },
}

// Stagger children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

// Stagger item
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// Pop animation for buttons/icons
export const pop: Variants = {
  hidden: { scale: 0 },
  visible: { 
    scale: 1, 
    transition: { 
      type: 'spring', 
      stiffness: 500, 
      damping: 30 
    } 
  },
}

// Bounce animation
export const bounce: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 400, 
      damping: 20 
    } 
  },
}

// Page transition
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: easeOut }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: 0.2 }
  },
}

// Card hover animation
export const cardHover: Variants = {
  rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: { 
    scale: 1.02, 
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },
}

// List item animation
export const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
}

// Animated components
interface AnimatedProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
}

export function FadeIn({ children, delay = 0, ...props }: AnimatedProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function SlideUp({ children, delay = 0, ...props }: AnimatedProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUp}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({ children, delay = 0, ...props }: AnimatedProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleUp}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({ children, ...props }: AnimatedProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, ...props }: AnimatedProps) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  )
}

export function PageTransition({ children, ...props }: AnimatedProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated card with hover effect
export function AnimatedCard({ children, className, ...props }: AnimatedProps & { className?: string }) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={cardHover}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Number counter animation
interface CounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({ value, duration = 1, className, prefix = '', suffix = '' }: CounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={value}
      >
        {prefix}
        <motion.span
          initial={{ scale: 1.2, color: 'var(--primary)' }}
          animate={{ scale: 1, color: 'inherit' }}
          transition={{ duration: 0.3 }}
        >
          {value.toLocaleString()}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  )
}

// Pulse animation for notifications
export function PulseIndicator({ className }: { className?: string }) {
  return (
    <span className={`relative flex h-3 w-3 ${className}`}>
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
        animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
    </span>
  )
}

// Skeleton loader with shimmer
export function SkeletonShimmer({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-muted rounded ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// Success checkmark animation
export function AnimatedCheckmark({ className }: { className?: string }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: easeOut }}
      />
    </motion.svg>
  )
}

// Loading spinner
export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      className="border-2 border-muted border-t-primary rounded-full"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )
}
