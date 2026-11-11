import { Star } from "lucide-react";

export default function Rating({ value, className = "" }) {
  if (!value) return null;
  return (
    <span className={`inline-flex items-center gap-1 font-bold text-primary ${className}`}>
      <Star className="h-3.5 w-3.5 fill-primary" />
      {value.toFixed(1)}
    </span>
  );
}
