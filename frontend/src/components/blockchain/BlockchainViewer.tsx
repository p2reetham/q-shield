import { BlockItem } from "../../types";
import BlockCard from "./BlockCard";

interface Props {
  blocks: BlockItem[];
  selected: BlockItem | null;
  onSelect: (b: BlockItem) => void;
}

export default function BlockchainViewer({ blocks, selected, onSelect }: Props) {
  return (
    <div className="panel p-4">
      <div className="data-label mb-3">Chain ({blocks.length} blocks)</div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {blocks.map((b, i) => (
          <BlockCard key={b.block_id} block={b} index={i} selected={selected?.block_id === b.block_id} onClick={() => onSelect(b)} />
        ))}
        {blocks.length === 0 && <p className="text-sm text-graphite-500 py-4">No blocks recorded yet — sign a document or run a threat analysis to create one.</p>}
      </div>
    </div>
  );
}
