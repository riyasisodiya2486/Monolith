import { useEffect, useState } from 'react';

interface AnimatedHeadingProps {
  text: string;
  delay?: number;
  charDelay?: number;
  className?: string;
}

export default function AnimatedHeading({
  text,
  delay = 0,
  charDelay = 35,
  className = '',
}: AnimatedHeadingProps) {
  const [isMounted, setIsMounted] = useState(false);
  const lines = text.split(/\\n|\n/);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={className}>
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="flex flex-wrap justify-center">
          {line.split('').map((char, charIndex) => {
            const calculatedDelay = (lineIndex * line.length * charDelay) + (charIndex * charDelay);
            const isSpace = char === ' ';

            return (
              <span
                key={charIndex}
                className="inline-block transition-all duration-500"
                style={{
                  opacity: isMounted ? 1 : 0,
                  transform: isMounted ? 'translateX(0)' : 'translateX(-18px)',
                  transitionDelay: `${calculatedDelay}ms`,
                }}
              >
                {isSpace ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
