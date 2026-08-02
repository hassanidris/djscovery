import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";

export default function Loading() {
  return <AdminTableSkeleton cols={8} rows={8} includeHeader={false} />;
}
