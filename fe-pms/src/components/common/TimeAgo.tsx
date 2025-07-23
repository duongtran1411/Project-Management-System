import { useTimeAgo } from "@/hooks/useTimeAgo";

interface TimeAgoProps {
  date: string;
  className?: string;
}

export const TimeAgo: React.FC<TimeAgoProps> = ({
  date,
  className = "text-xs text-gray-500 flex-shrink-0",
}) => {
  const timeAgo = useTimeAgo(date);

  return <span className={`${className} whitespace-nowrap`}>{timeAgo}</span>;
};
