interface StreakCounterProps {
  streakCount: number;
  className?: string;
}

export function StreakCounter({ streakCount, className = "" }: StreakCounterProps) {
  const getStreakEmoji = (count: number) => {
    if (count === 0) return "❄️";
    if (count < 3) return "🔥";
    if (count < 7) return "🔥🔥";
    if (count < 14) return "🔥🔥🔥";
    if (count < 30) return "🔥🔥🔥🔥";
    return "🔥🔥🔥🔥🔥";
  };

  const getStreakMessage = (count: number) => {
    if (count === 0) return "Start your streak!";
    if (count === 1) return "Great start!";
    if (count < 7) return "Building momentum!";
    if (count < 14) return "On fire!";
    if (count < 30) return "Unstoppable!";
    return "Legendary!";
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-2xl">{getStreakEmoji(streakCount)}</span>
      <div className="flex flex-col">
        <span className="text-sm text-slate-300">Streak</span>
        <span className="font-bold text-yellow-400">{streakCount} days</span>
        <span className="text-xs text-slate-400">{getStreakMessage(streakCount)}</span>
      </div>
    </div>
  );
}
