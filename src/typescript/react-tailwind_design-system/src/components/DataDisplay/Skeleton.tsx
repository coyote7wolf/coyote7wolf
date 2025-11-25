import React from 'react';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  // Always apply skeleton base classes for clarity if not provided
  const base = 'skeleton skeleton--animate';
  // Make skeleton more visible: override bg to bg-neutral-300 and add shadow if not provided
  const strongBg = 'bg-neutral-300 shadow-sm';
  return (
    <div
      className={
        className
          ? `${base} border border-border ${strongBg} ${className}`
          : `${base} border border-border ${strongBg} skeleton--w-full skeleton--h-6 rounded`
      }
    />
  );
};

export default Skeleton;
