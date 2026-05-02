interface LivesDisplayProps {
  lives: number;
}

export default function LivesDisplay({ lives }: LivesDisplayProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-lg ${i < lives ? 'opacity-100' : 'opacity-30'}`}>
          {i < lives ? '❤️' : '🖤'}
        </span>
      ))}
    </div>
  );
}
