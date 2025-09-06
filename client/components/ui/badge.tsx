import * as React from "react";
import { cn } from "@/lib/utils";

export const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground", className)}>{children}</span>
);

export default Badge;
