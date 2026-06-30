import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  className?: string;
  placeholderClassName?: string;
  parentClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export function LazyImage({ 
  src, 
  alt, 
  className, 
  placeholderClassName = '', 
  parentClassName = 'w-full h-full',
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      {
        rootMargin: '150px', // start downloading slightly earlier
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${parentClassName} ${placeholderClassName}`}>
      {/* Transparent or subtle shimmer/Skeleton placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-zinc-800 animate-pulse w-full h-full z-[1]" />
      )}
      
      {isInView ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`${className || ''} transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          {...props}
        />
      ) : (
        <div className="w-full h-full bg-slate-100 dark:bg-zinc-850" />
      )}
    </div>
  );
}
