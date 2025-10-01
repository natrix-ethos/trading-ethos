interface EmbodimentScoreProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function EmbodimentScore({ 
  score, 
  maxScore = 10, 
  size = "md", 
  showLabel = true,
  className = "" 
}: EmbodimentScoreProps) {
  const percentage = (score / maxScore) * 100;
  
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20", 
    lg: "w-24 h-24"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl"
  };

  const strokeWidth = size === "sm" ? 3 : size === "md" ? 4 : 5;
  const radius = size === "sm" ? 26 : size === "md" ? 32 : 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score < 3) return "text-red-400";
    if (score < 5) return "text-orange-400";
    if (score < 7) return "text-yellow-400";
    if (score < 9) return "text-green-400";
    return "text-emerald-400";
  };

  const getScoreMessage = (score: number) => {
    if (score < 3) return "Needs attention";
    if (score < 5) return "Building awareness";
    if (score < 7) return "Good presence";
    if (score < 9) return "Strong embodiment";
    return "Fully embodied";
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          className="transform -rotate-90"
          width={sizeClasses[size].split(' ')[0].replace('w-', '') + 'px'}
          height={sizeClasses[size].split(' ')[1].replace('h-', '') + 'px'}
        >
          {/* Background circle */}
          <circle
            cx={size === "sm" ? 32 : size === "md" ? 40 : 48}
            cy={size === "sm" ? 32 : size === "md" ? 40 : 48}
            r={radius}
            stroke="rgb(51 65 85)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size === "sm" ? 32 : size === "md" ? 40 : 48}
            cy={size === "sm" ? 32 : size === "md" ? 40 : 48}
            r={radius}
            stroke="rgb(250 204 21)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${getScoreColor(score)} ${textSizeClasses[size]}`}>
            {score}
          </span>
        </div>
      </div>
      
      {showLabel && (
        <div className="mt-2 text-center">
          <div className="text-sm text-slate-300">Embodiment</div>
          <div className={`text-xs ${getScoreColor(score)}`}>
            {getScoreMessage(score)}
          </div>
        </div>
      )}
    </div>
  );
}
