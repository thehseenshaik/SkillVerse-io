import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
}

export function LazyImage({
  src,
  alt,
  fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3C/svg%3E",
  className,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (imgRef.current) {
      imgRef.current.src = fallback;
    }
  };

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        "transition-opacity duration-300",
        !isLoaded && "opacity-0",
        isLoaded && "opacity-100",
        className,
      )}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}
