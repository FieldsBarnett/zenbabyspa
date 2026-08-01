import { Label } from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
import * as React from "react";

const LabelRoot = Label;

const LabelComponent = React.forwardRef<
  React.ElementRef<typeof LabelRoot>,
  React.ComponentPropsWithoutRef<typeof LabelRoot>
>(({ className, ...props }, ref) => (
  <LabelRoot
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
));
LabelComponent.displayName = LabelRoot.displayName;

export { LabelComponent as Label };
