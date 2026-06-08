import { EditProfileSkeleton } from "@/components/ui/skeletons";

export default function EditProfileLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <EditProfileSkeleton />
      </div>
    </div>
  );
}
