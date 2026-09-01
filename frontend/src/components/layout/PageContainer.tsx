import { ReactNode } from "react";

export default function PageContainer({ children }: { children: ReactNode }) {
  return <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>;
}
