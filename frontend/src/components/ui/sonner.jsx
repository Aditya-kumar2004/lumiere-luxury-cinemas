import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      richColors={true}
      toastOptions={{
        classNames: {
          toast: "group toast shadow-2xl text-sm font-medium",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
