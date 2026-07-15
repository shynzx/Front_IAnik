import type { ReactNode } from "react";
import ProtectedAppLayout from "@/components/layout/ProtectedAppLayout";

export default function Layout({ children }: { children: ReactNode }) { return <ProtectedAppLayout>{children}</ProtectedAppLayout>; }
