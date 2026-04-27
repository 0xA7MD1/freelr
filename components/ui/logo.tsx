import React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)} {...props}>
      <rect width="100" height="100" rx="20" fill="#0052FC"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M 23 14 H 77 L 59 32 H 41 V 50 H 59 V 68 H 41 V 50 H 23 Z M 23 68 H 41 V 86 H 23 Z" fill="white" />
    </svg>
  );
}
