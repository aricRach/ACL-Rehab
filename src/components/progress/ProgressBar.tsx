export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full bg-gray-200 rounded h-4">
      <div
        className="h-4 bg-green-500 rounded transition-all"
        style={{ width: `${percent}%` }}
      />
      <p className="text-sm mt-1 text-center">{percent.toFixed(2)}%</p>
    </div>
  );
}