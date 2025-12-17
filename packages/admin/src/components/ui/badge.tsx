import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#00000006] text-[#616161]",
        info: "border-transparent bg-[#E0F0FF] text-[#00527C]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-[#CDFEE1] text-[#0C5132]",
        orange: "border-transparent text-[#5E4200]",
        blue: "border-transparent bg-[#E0F0FF] text-[#00527C]",
        yellow: "border-transparent bg-[#FFEF9D] text-[#4F4700]",
        purple: "border-transparent text-[#5C32AA13] bg-[#7126FF13]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
