import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const toggleVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      pressed: {
        true: "border-transparent bg-primary/30 text-primary-foreground",
        false: "border-border/70 bg-transparent text-muted-foreground hover:text-foreground"
      }
    },
    defaultVariants: {
      pressed: false
    }
  }
);

const Toggle = React.forwardRef(({ className, pressed = false, ...props }, ref) => (
  <button
    ref={ref}
    data-state={pressed ? "on" : "off"}
    className={cn(toggleVariants({ pressed }), className)}
    {...props}
  />
));
Toggle.displayName = "Toggle";

export { Toggle };
