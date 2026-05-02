import { xpProgress } from '../data/levels';

interface XPBarProps {
  xp: number;
}

export default function XPBar({ xp }: XPBarProps) {
  const { level, currentXP, nextLevelXP, progress } = xpProgress(xp);

  return (
    <div className="flex items-center gap-2">
      <span className="font-heading font-bold text-golden text-sm">Lv.{level}</span>
      <div className="flex-1 h-2.5 bg-black/30 rounded-full overflow-hidden min-w-[80px]">
        <div
          className="h-full bg-golden rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="text-xs text-cream/70">{currentXP}/{nextLevelXP}</span>
    </div>
  );
}
