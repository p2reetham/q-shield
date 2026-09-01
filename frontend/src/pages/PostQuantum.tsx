import { ShieldQuestion } from "lucide-react";
import RiskBadge from "../components/common/RiskBadge";

const ALGORITHMS = [
  { name: "RSA", type: "Classical", risk: "HIGH", note: "Broken in polynomial time by Shor's algorithm on a sufficiently large quantum computer." },
  { name: "ECDSA", type: "Classical", risk: "HIGH", note: "Also vulnerable to Shor's algorithm; smaller keys don't change the underlying quantum risk." },
  { name: "ML-DSA (CRYSTALS-Dilithium)", type: "Post-Quantum", risk: "LOW", note: "Lattice-based; standardized by NIST as FIPS 204." },
  { name: "SLH-DSA (SPHINCS+)", type: "Post-Quantum", risk: "LOW", note: "Hash-based; standardized by NIST as FIPS 205. Conservative security assumptions, larger signatures." },
];

export default function PostQuantum() {
  return (
    <div className="space-y-6">
      <div className="panel p-4">
        <div className="flex items-start gap-3">
          <ShieldQuestion size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-graphite-500">
            This is an <span className="text-offwhite">educational / prototype risk comparison</span>, not a
            cryptographic certification. Q-SHIELD's demo signing flow uses classical RSA-PSS
            today; this page illustrates why a production system handling long-lived signatures
            should plan a migration path toward standardized post-quantum or hybrid algorithms.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><span className="data-label">Algorithm Risk Comparison</span></div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite-700">
              <th className="data-label px-4 py-2 font-normal">Algorithm</th>
              <th className="data-label px-4 py-2 font-normal">Type</th>
              <th className="data-label px-4 py-2 font-normal">Quantum Risk</th>
              <th className="data-label px-4 py-2 font-normal">Notes</th>
            </tr>
          </thead>
          <tbody>
            {ALGORITHMS.map((a) => (
              <tr key={a.name} className="border-b border-graphite-800">
                <td className="px-4 py-3 font-mono text-xs">{a.name}</td>
                <td className="px-4 py-3 text-xs text-graphite-500">{a.type}</td>
                <td className="px-4 py-3"><RiskBadge level={a.risk} size="sm" /></td>
                <td className="px-4 py-3 text-xs text-graphite-500">{a.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel p-5">
        <div className="data-label mb-2">Hybrid Signatures</div>
        <p className="text-sm text-graphite-500 max-w-2xl">
          A common migration strategy pairs a classical signature (e.g. ECDSA) with a
          post-quantum signature (e.g. ML-DSA) on the same document, so verification
          succeeds only if <em>both</em> signatures are valid. This preserves compatibility
          with existing verifiers while adding quantum resistance, at the cost of larger
          signature sizes. Q-SHIELD's architecture is designed so a hybrid signer could be
          added alongside the existing RSA-PSS path without changing the blockchain or
          threat-detection modules.
        </p>
      </div>
    </div>
  );
}
