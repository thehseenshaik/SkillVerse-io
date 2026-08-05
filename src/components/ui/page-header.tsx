import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-foreground font-medium">
                  {crumb.label}
                </span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="text-muted-foreground/50">/</span>
              )}
            </div>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
