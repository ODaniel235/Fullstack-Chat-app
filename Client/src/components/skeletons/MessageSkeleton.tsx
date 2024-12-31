import { Skeleton } from "../ui/skeleton";

const MessageSkeleton = () => {
  // Create an array of 6 items for skeleton messages
  const skeletonMessages = Array(6).fill(2);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {skeletonMessages.map((_, idx) => (
        <div
          key={idx}
          className={`flex${idx % 2 ? " justify-end " : "justify-start"}`}
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            {idx % 2 ? (
              <Skeleton className="h-4 w-[200px] ml-auto" />
            ) : (
              <Skeleton className="h-4 w-[200px]  mr-auto" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
