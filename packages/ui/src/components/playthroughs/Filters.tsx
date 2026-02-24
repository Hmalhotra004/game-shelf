"use client";

import { usePlaythroughFilters } from "@repo/ui/hooks/usePlaythroughFilters";
import { FilterIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

const Filters = () => {
  const [filters, setFilters] = usePlaythroughFilters();

  const { status, platform } = filters;

  return (
    <div className="flex items-center gap-3">
      {/* <InputGroup className="w-[229px]">
        <InputGroupInput
          value={search}
          onChange={(v) => setFilters({ search: v.target.value })}
          placeholder="search..."
        />
        {hasSearch && (
          <Button
            size="icon-sm"
            variant="link"
            onClick={clearSearch}
          >
            <X />
          </Button>
        )}
      </InputGroup> */}

      <Select
        value={status}
        onValueChange={(value) =>
          setFilters({ status: value as typeof filters.status })
        }
      >
        <SelectTrigger className="w-fit">
          <FilterIcon className="size-4 mr-1" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="On Hold">On Hold</SelectItem>
          <SelectItem value="Archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={platform}
        onValueChange={(value) =>
          setFilters({ platform: value as typeof filters.platform })
        }
      >
        <SelectTrigger className="w-fit">
          <FilterIcon className="size-4 mr-1" />
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="PS">PlayStation</SelectItem>
          <SelectItem value="PC">PC</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Filters;
