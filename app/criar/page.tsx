import { Suspense } from "react";
import { CreateWizard } from "@/components/CreateWizard";

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-paper" />}>
      <CreateWizard />
    </Suspense>
  );
}
