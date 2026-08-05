import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  isLoading?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  debounceMs = 300,
  isLoading = false,
  className,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      const handler = setTimeout(() => {
        onSearch(searchQuery);
      }, debounceMs);

      return () => clearTimeout(handler);
    },
    [onSearch, debounceMs],
  );

  useEffect(() => {
    const cleanup = debouncedSearch(query);
    return cleanup;
  }, [query, debouncedSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center",
        isFocused && "ring-2 ring-ring ring-offset-2 rounded-md",
        className,
      )}
    >
      <Search
        className={cn(
          "absolute left-3 h-4 w-4 text-muted-foreground transition-colors",
          isFocused && "text-foreground",
        )}
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        className="pl-9 pr-20"
        aria-label="Search"
      />
      <div className="absolute right-2 flex items-center gap-1">
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {query && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
