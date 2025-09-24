import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Building2,
  Check,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleDotDashed,
  CircleEllipsis,
  CircleX,
  FileText,
  Signal,
  Tag,
  X,
} from "lucide-react";
import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";

interface AnimateChangeInHeightProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimateChangeInHeight: React.FC<AnimateChangeInHeightProps> = ({
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        const observedHeight = entries[0].contentRect.height;
        setHeight(observedHeight);
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <motion.div
      className={cn(className, "overflow-hidden")}
      style={{ height }}
      animate={{ height }}
      transition={{ duration: 0.1, damping: 0.2, ease: "easeIn" }}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  );
};

export enum FilterType {
  SOURCE = "Source",
  TYPE = "Type",
  AUTHOR = "Author",
}

export enum FilterOperator {
  IS = "is",
  IS_NOT = "is not",
  IS_ANY_OF = "is any of",
  INCLUDE = "include",
  DO_NOT_INCLUDE = "do not include",
  INCLUDE_ALL_OF = "include all of",
  INCLUDE_ANY_OF = "include any of",
  EXCLUDE_ALL_OF = "exclude all of",
  EXCLUDE_IF_ANY_OF = "exclude if any of",
}

export enum Source {
  PITCHBOOK_ALERT = "PitchBook Alert",
  BLOOMBERG_GREEN = "Bloomberg Green", 
  CARBON_BRIEF_DAILY = "Carbon Brief Daily",
  FINANCIAL_TIMES = "Financial Times",
}

export enum Type {
  EMAIL_ALERT = "email_alert",
  RSS = "rss",
  HTML = "html",
}

export enum Author {
  PITCHBOOK = "PitchBook",
  JOHN_AINGER = "John Ainger",
}

export type FilterOption = {
  name: FilterType | Source | Type | Author;
  icon: React.ReactNode | undefined;
  label?: string;
};

export type Filter = {
  id: string;
  type: FilterType;
  operator: FilterOperator;
  value: string[];
};

const FilterIcon = ({
  type,
}: {
  type: FilterType | Source | Type | Author;
}) => {
  switch (type) {
    case FilterType.SOURCE:
      return <Building2 className="size-3.5" />;
    case FilterType.TYPE:
      return <FileText className="size-3.5" />;
    case FilterType.AUTHOR:
      return <Avatar className="size-3.5 rounded-full text-[9px] text-white">
        <AvatarFallback className="bg-blue-300 text-[8px]">AU</AvatarFallback>
      </Avatar>;
    case Source.PITCHBOOK_ALERT:
      return <div className="bg-orange-400 rounded-full size-2.5" />;
    case Source.BLOOMBERG_GREEN:
      return <div className="bg-blue-400 rounded-full size-2.5" />;
    case Source.CARBON_BRIEF_DAILY:
      return <div className="bg-green-400 rounded-full size-2.5" />;
    case Source.FINANCIAL_TIMES:
      return <div className="bg-pink-400 rounded-full size-2.5" />;
    case Type.EMAIL_ALERT:
      return <div className="bg-purple-400 rounded-full size-2.5" />;
    case Type.RSS:
      return <div className="bg-cyan-400 rounded-full size-2.5" />;
    case Type.HTML:
      return <div className="bg-amber-400 rounded-full size-2.5" />;
    case Author.PITCHBOOK:
      return <Avatar className="size-3.5 rounded-full text-[9px] text-white">
        <AvatarFallback className="bg-orange-300 text-[8px]">PB</AvatarFallback>
      </Avatar>;
    case Author.JOHN_AINGER:
      return <Avatar className="size-3.5 rounded-full text-[9px] text-white">
        <AvatarFallback className="bg-blue-300 text-[8px]">JA</AvatarFallback>
      </Avatar>;
    default:
      return <Circle className="size-3.5" />;
  }
};

export const filterViewOptions: FilterOption[][] = [
  [
    {
      name: FilterType.SOURCE,
      icon: <FilterIcon type={FilterType.SOURCE} />,
    },
    {
      name: FilterType.TYPE,
      icon: <FilterIcon type={FilterType.TYPE} />,
    },
    {
      name: FilterType.AUTHOR,
      icon: <FilterIcon type={FilterType.AUTHOR} />,
    },
  ],
];

export const sourceFilterOptions: FilterOption[] = Object.values(Source).map(
  (source) => ({
    name: source,
    icon: <FilterIcon type={source} />,
  })
);

export const typeFilterOptions: FilterOption[] = Object.values(Type).map(
  (type) => ({
    name: type,
    icon: <FilterIcon type={type} />,
    label: type.replace('_', ' '),
  })
);

export const authorFilterOptions: FilterOption[] = Object.values(Author).map(
  (author) => ({
    name: author,
    icon: <FilterIcon type={author} />,
  })
);

export const filterViewToFilterOptions: Record<FilterType, FilterOption[]> = {
  [FilterType.SOURCE]: sourceFilterOptions,
  [FilterType.TYPE]: typeFilterOptions,
  [FilterType.AUTHOR]: authorFilterOptions,
};

const filterOperators = ({
  filterType,
  filterValues,
}: {
  filterType: FilterType;
  filterValues: string[];
}) => {
  switch (filterType) {
    case FilterType.SOURCE:
    case FilterType.TYPE:
    case FilterType.AUTHOR:
      if (Array.isArray(filterValues) && filterValues.length > 1) {
        return [FilterOperator.IS_ANY_OF, FilterOperator.IS_NOT];
      } else {
        return [FilterOperator.IS, FilterOperator.IS_NOT];
      }
    default:
      return [];
  }
};

const FilterOperatorDropdown = ({
  filterType,
  operator,
  filterValues,
  setOperator,
}: {
  filterType: FilterType;
  operator: FilterOperator;
  filterValues: string[];
  setOperator: (operator: FilterOperator) => void;
}) => {
  const operators = filterOperators({ filterType, filterValues });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-muted hover:bg-muted/50 px-1.5 py-1 text-muted-foreground hover:text-primary transition shrink-0">
        {operator}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-fit min-w-fit">
        {operators.map((operator) => (
          <DropdownMenuItem
            key={operator}
            onClick={() => setOperator(operator)}
          >
            {operator}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FilterValueCombobox = ({
  filterType,
  filterValues,
  setFilterValues,
}: {
  filterType: FilterType;
  filterValues: string[];
  setFilterValues: (filterValues: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);
  const nonSelectedFilterValues = filterViewToFilterOptions[filterType]?.filter(
    (filter) => !filterValues.includes(filter.name)
  );
  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setTimeout(() => {
            setCommandInput("");
          }, 200);
        }
      }}
    >
      <PopoverTrigger
        className="rounded-none px-1.5 py-1 bg-muted hover:bg-muted/50 transition
  text-muted-foreground hover:text-primary shrink-0"
      >
        <div className="flex gap-1.5 items-center">
          <div className="flex items-center flex-row -space-x-1">
            <AnimatePresence mode="popLayout">
              {filterValues?.slice(0, 3).map((value) => (
                <motion.div
                  key={value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FilterIcon type={value as FilterType} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {filterValues?.length === 1
            ? filterValues?.[0]
            : `${filterValues?.length} selected`}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <AnimateChangeInHeight>
          <Command>
            <CommandInput
              placeholder={filterType}
              className="h-9"
              value={commandInput}
              onInputCapture={(e) => {
                setCommandInput(e.currentTarget.value);
              }}
              ref={commandInputRef}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {filterValues.map((value) => (
                  <CommandItem
                    key={value}
                    className="group flex gap-2 items-center"
                    onSelect={() => {
                      setFilterValues(filterValues.filter((v) => v !== value));
                      setTimeout(() => {
                        setCommandInput("");
                      }, 200);
                      setOpen(false);
                    }}
                  >
                    <Checkbox checked={true} />
                    <FilterIcon type={value as FilterType} />
                    {value}
                  </CommandItem>
                ))}
              </CommandGroup>
              {nonSelectedFilterValues?.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    {nonSelectedFilterValues.map((filter: FilterOption) => (
                      <CommandItem
                        className="group flex gap-2 items-center"
                        key={filter.name}
                        value={filter.name}
                        onSelect={(currentValue: string) => {
                          setFilterValues([...filterValues, currentValue]);
                          setTimeout(() => {
                            setCommandInput("");
                          }, 200);
                          setOpen(false);
                        }}
                      >
                        <Checkbox
                          checked={false}
                          className="opacity-0 group-data-[selected=true]:opacity-100"
                        />
                        {filter.icon}
                        <span className="text-accent-foreground">
                          {filter.label || filter.name}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  );
};

export default function Filters({
  filters,
  setFilters,
}: {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
}) {
  return (
    <div className="flex gap-2">
      {filters
        .filter((filter) => filter.value?.length > 0)
        .map((filter) => (
          <div key={filter.id} className="flex gap-[1px] items-center text-xs">
            <div className="flex gap-1.5 shrink-0 rounded-l bg-muted px-1.5 py-1 items-center">
              <FilterIcon type={filter.type} />
              {filter.type}
            </div>
            <FilterOperatorDropdown
              filterType={filter.type}
              operator={filter.operator}
              filterValues={filter.value}
              setOperator={(operator) => {
                setFilters((prev) =>
                  prev.map((f) => (f.id === filter.id ? { ...f, operator } : f))
                );
              }}
            />
            <FilterValueCombobox
              filterType={filter.type}
              filterValues={filter.value}
              setFilterValues={(filterValues) => {
                setFilters((prev) =>
                  prev.map((f) =>
                    f.id === filter.id ? { ...f, value: filterValues } : f
                  )
                );
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFilters((prev) => prev.filter((f) => f.id !== filter.id));
              }}
              className="bg-muted rounded-l-none rounded-r-sm h-6 w-6 text-muted-foreground hover:text-primary hover:bg-muted/50 transition shrink-0"
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}
    </div>
  );
}