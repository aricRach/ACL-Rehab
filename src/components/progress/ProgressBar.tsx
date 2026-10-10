interface Props {
  percent: number;
  optimalPercent: number;
}

export default function ProgressBar({ percent, optimalPercent }: Props) {
  const missing = optimalPercent - percent;

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded h-4 relative">
        <div
          className="h-4 bg-green-200 rounded transition-all absolute top-0 left-0"
          style={{ width: `${optimalPercent}%` }}
        />
        <div
          className="h-4 bg-green-500 rounded transition-all absolute top-0 left-0"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm mt-1 text-center">{percent.toFixed(2)}%</p>
      <p className="text-sm text-gray-600 text-center">
        {missing >= 0.01
          ? `With optimal training: ${optimalPercent.toFixed(2)}% (+${missing.toFixed(2)}%)`
          : 'You are at the maximum for this week'}
      </p>
    </div>
  );
}
