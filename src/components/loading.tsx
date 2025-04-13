import Spinner from "./ui/spinner";
import { cn } from "@/lib/utils";

type TLoadingProps = {
  text?: string;
  isLoading?: boolean;
  className?: string;
};
const Loading = ({ text, isLoading, className }: TLoadingProps) => {
  return (
    <div
      className={cn(
        "flex items-center",
        {
          hidden: !isLoading,
        },
        className
      )}
    >
      <Spinner className="" />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
};

export default Loading;
