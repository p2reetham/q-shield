import { BlockItem } from "../../types";

interface Props {
  block: BlockItem;
  selected: boolean;
  onClick: () => void;
  index: number;
}

export default function BlockCard({ block, selected, onClick, index }: Props) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 w-44 text-left rounded border p-3 font-mono transition-colors animate-block-appear ${
        selected ? "border-cyan-400/60 bg-cyan-400/5" : "border-graphite-700 bg-graphite-900 hover:border-graphite-600"
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="text-[10px] text-graphite-500 mb-1">BLOCK #{block.index}</div>
      <div className="text-xs mb-2 truncate">{block.block_id}</div>
      <div className="text-[10px] text-graphite-600 truncate">hash: {block.current_hash.slice(0, 10)}...</div>
      <div className="text-[10px] text-graphite-600 truncate mb-2">prev: {block.previous_hash.slice(0, 10)}...</div>
      <div className="text-[10px]" style={{ color: block.threat_score > 60 ? "#d1493f" : "#4c9a6a" }}>
        score {block.threat_score}
      </div>
    </button>
  );
}
