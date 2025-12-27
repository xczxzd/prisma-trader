import { cn } from "@/lib/utils";

interface PrismaLogoProps {
  className?: string;
}

export function PrismaLogo({ className }: PrismaLogoProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Glow effect */}
      <div className="absolute inset-0 blur-2xl opacity-50">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,10 90,80 10,80"
            fill="hsl(175, 80%, 50%)"
          />
        </svg>
      </div>
      
      {/* Main prism */}
      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
        <defs>
          <linearGradient id="prismGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(175, 80%, 60%)" />
            <stop offset="50%" stopColor="hsl(175, 80%, 50%)" />
            <stop offset="100%" stopColor="hsl(180, 70%, 40%)" />
          </linearGradient>
          <linearGradient id="prismShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        
        {/* Triangle outline */}
        <polygon
          points="50,15 85,75 15,75"
          fill="none"
          stroke="url(#prismGradient)"
          strokeWidth="2"
        />
        
        {/* Inner triangle */}
        <polygon
          points="50,25 75,68 25,68"
          fill="url(#prismGradient)"
          opacity="0.2"
        />
        
        {/* Shine line */}
        <line
          x1="50"
          y1="15"
          x2="35"
          y2="50"
          stroke="url(#prismShine)"
          strokeWidth="2"
        />
        
        {/* Light refraction lines */}
        <g stroke="hsl(175, 80%, 50%)" strokeWidth="1" opacity="0.6">
          <line x1="50" y1="45" x2="30" y2="55" />
          <line x1="50" y1="45" x2="40" y2="58" />
          <line x1="50" y1="45" x2="60" y2="58" />
          <line x1="50" y1="45" x2="70" y2="55" />
        </g>
      </svg>
    </div>
  );
}
