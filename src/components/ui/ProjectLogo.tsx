import { cn } from "@/lib/utils";

interface ProjectLogoProps {
  logo?: string;
  title: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProjectLogo({ logo, title, size = "md", className }: ProjectLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg"
  };

  const initials = (title || 'P').slice(0, 2).toUpperCase();

  if (logo) {
    return (
      <img 
        src={logo} 
        alt={`${title} logo`} 
        className={cn(
          "rounded-lg object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div 
      className={cn(
        "rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center font-semibold text-primary",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
