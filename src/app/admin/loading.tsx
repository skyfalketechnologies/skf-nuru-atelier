import { AdminLoader } from "@/components/admin/AdminLoader";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[min(70vh,560px)] flex-col items-center justify-center py-12">
      <AdminLoader message="Loading workspace" />
    </div>
  );
}
