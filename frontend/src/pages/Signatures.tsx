import { useEffect, useState } from "react";
import { api } from "../services/api";
import { KeyItem, SignatureItem } from "../types";
import KeyGenerator from "../components/signatures/KeyGenerator";
import SignDocument from "../components/signatures/SignDocument";
import VerifySignature from "../components/signatures/VerifySignature";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";

export default function Signatures() {
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);

  const refresh = async () => {
    const [k, s] = await Promise.all([api.listKeys(), api.listSignatures()]);
    setKeys(k as KeyItem[]);
    setSignatures(s as SignatureItem[]);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KeyGenerator onGenerated={refresh} />
        <SignDocument keys={keys} onSigned={refresh} />
        <VerifySignature />
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="data-label">Recent Signatures</span>
        </div>
        <DataTable
          rows={signatures}
          keyField={(s) => s.signature_id}
          columns={[
            { header: "Signature ID", render: (s) => <span className="font-mono text-xs">{s.signature_id}</span> },
            { header: "Key ID", render: (s) => <span className="font-mono text-xs text-graphite-500">{s.key_id}</span> },
            { header: "Document Hash", render: (s) => <span className="font-mono text-xs text-graphite-500 truncate block max-w-[220px]">{s.document_hash}</span> },
            { header: "Status", render: (s) => <StatusBadge status={s.verification_status} size="sm" /> },
            { header: "Timestamp", render: (s) => <span className="text-xs text-graphite-500">{new Date(s.created_at).toLocaleString()}</span> },
          ]}
        />
      </div>
    </div>
  );
}
