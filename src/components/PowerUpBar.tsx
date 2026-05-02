import type { PowerUps } from '../store/gameStore';

interface PowerUpBarProps {
  powerUps: PowerUps;
  onUse: (type: keyof PowerUps) => void;
  disabled: boolean;
}

const powerUpConfig: { type: keyof PowerUps; icon: string; label: string }[] = [
  { type: 'fiftyFifty', icon: '🎯', label: '50/50' },
  { type: 'extraTime', icon: '🕐', label: '+5s' },
  { type: 'hint', icon: '💡', label: 'Hint' },
  { type: 'extraLife', icon: '❤️', label: '+Life' },
];

export default function PowerUpBar({ powerUps, onUse, disabled }: PowerUpBarProps) {
  return (
    <div className="flex gap-2 justify-center">
      {powerUpConfig.map(({ type, icon, label }) => (
        <button
          key={type}
          onClick={() => onUse(type)}
          disabled={disabled || powerUps[type] <= 0}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
            bg-earth/50 hover:bg-earth/80 disabled:opacity-30 disabled:cursor-not-allowed
            transition-all text-sm"
        >
          <span className="text-lg">{icon}</span>
          <span className="text-xs text-cream/80">{label} ({powerUps[type]})</span>
        </button>
      ))}
    </div>
  );
}
