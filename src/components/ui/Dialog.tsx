"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogRoot = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-stone-900/35 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideCloseButton?: boolean;
  }
>(({ className, children, hideCloseButton, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 flex flex-col w-[94vw] sm:w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-3.5 sm:gap-4 rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-6 md:p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[90dvh] overflow-y-auto overflow-x-hidden text-stone-900 min-w-0",
        className,
      )}
      {...props}
    >
      {children}
      {!hideCloseButton && (
        <DialogPrimitive.Close className="absolute right-2.5 top-2.5 sm:right-4 sm:top-4 z-30 rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors focus:outline-none disabled:pointer-events-none bg-white/90 sm:bg-transparent backdrop-blur-xs shadow-xs sm:shadow-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-left pr-8", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl font-serif font-medium tracking-tight text-stone-900",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-xs sm:text-sm text-stone-500 leading-relaxed",
      className,
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export interface DialogProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  isOpen,
  onOpenChange,
  onClose,
  children,
  title,
  description,
  className,
}: DialogProps) {
  const isCurrentlyOpen = open !== undefined ? open : Boolean(isOpen);
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (!nextOpen && onClose) {
      onClose();
    }
  };

  // 1. If title or description is passed, use the managed DialogContent wrapper
  if (title || description) {
    return (
      <DialogRoot open={isCurrentlyOpen} onOpenChange={handleOpenChange}>
        <DialogContent className={className}>
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </DialogRoot>
    );
  }

  // 2. Check if children already contains a DialogContent to prevent duplicate portals
  const isDirectContent =
    React.isValidElement(children) &&
    ((children.type as { displayName?: string })?.displayName ===
      "DialogContent" ||
      children.type === DialogContent);

  if (isDirectContent) {
    return (
      <DialogRoot open={isCurrentlyOpen} onOpenChange={handleOpenChange}>
        {children}
      </DialogRoot>
    );
  }

  // 3. If a custom className was passed to Dialog without DialogContent children, wrap it
  if (className) {
    return (
      <DialogRoot open={isCurrentlyOpen} onOpenChange={handleOpenChange}>
        <DialogContent className={className}>{children}</DialogContent>
      </DialogRoot>
    );
  }

  return (
    <DialogRoot open={isCurrentlyOpen} onOpenChange={handleOpenChange}>
      {children}
    </DialogRoot>
  );
}

export {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
