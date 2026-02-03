"use client";

import { Button } from "@repo/ui/components/ui/button";
import { InputGroup, InputGroupInput } from "@repo/ui/components/ui/input-group";
import { useCollectionFilters } from "@repo/ui/hooks/useCollectionFilters";
import { useQuery, useSuspenseQuery, } from "@tanstack/react-query";
import { GameStatusSelect } from "@repo/ui/components/form/formSelects";

import {
  FilterIcon,
  LayoutGridIcon,
  ListIcon,
  TableIcon,
  X,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

const Filters = () => {
  const [filters, setFilters] = useCollectionFilters();

  // const { data: lists } = useQuery({queryKey:["list"],queryFn:async });

  const { list, platform, search, view, status } = filters;

  const hasSearch = !!search;

  function clearSearch() {
    setFilters({ search: "" });
  }

  return (
    <div className="flex items-center gap-3">
      <InputGroup className="w-57.25">
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
      </InputGroup>

      {/* <Select
        value={list}
        onValueChange={(value) => setFilters({ list: value })}
      >
        <SelectTrigger className="w-fit">
          <ListIcon className="size-4 mr-1" />
          <SelectValue placeholder="Lists" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {lists.map((l) => (
            <SelectItem
              key={l.id}
              value={l.name}
            >
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select> */}

      <Select
        value={status}
        onValueChange={(value) =>
          setFilters({ status: value as typeof status })
        }
      >
        <SelectTrigger className="w-fit">
          <FilterIcon className="size-4 mr-1" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <GameStatusSelect completions={0} />
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

      {/* <div className="flex items-center gap-1 border border-border rounded-lg p-1">
        <Button
          variant={view === "GRID" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilters({ view: "GRID" })}
        >
          <LayoutGridIcon className="size-4" />
        </Button>

        <Button
          variant={view === "TABLE" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilters({ view: "TABLE" })}
        >
          <TableIcon className="size-4" />
        </Button>
      </div> */}
    </div>
  );
};

export default Filters;
