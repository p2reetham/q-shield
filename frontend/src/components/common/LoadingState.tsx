export default function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-8 justify-center text-graphite-500 font-mono text-xs">
      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
      {label}...
    </div>
  );
}
