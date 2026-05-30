import { DjUser } from "@/lib/data";
import DjCard from "./DjCard";

type DjGridProps = {
  djs: DjUser[];
};

const DjGrid = ({ djs }: DjGridProps) => {
  if (djs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-lg">No DJs found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {djs.map((dj) => (
        <DjCard key={dj.id} {...dj} />
      ))}
    </div>
  );
};

export default DjGrid;
