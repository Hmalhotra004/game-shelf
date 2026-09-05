import { GameStatusSelect } from "@/components/form/FormSelects";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { useCollectionFilters } from "@/hooks/useCollectionFilters";
import { api } from "@/lib/api";
import { listGetManyQueryOptions } from "@repo/utils/queries/list";
import { useQuery } from "@tanstack/react-query";
import { FilterIcon, ListIcon, X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Filters = () => {
  const [filters, setFilters] = useCollectionFilters();

  const { data: lists, isLoading } = useQuery(listGetManyQueryOptions(api));

  const { platform, search, status, list } = filters;

  const hasSearch = !!search;

  function clearSearch() {
    setFilters({ search: "" });
  }

  return (
    <div className="flex md:flex-row flex-col md:items-center gap-2 max-md:w-full">
      <InputGroup className="md:w-57.25 w-full">
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

      {!isLoading && lists !== undefined && lists.length > 0 && (
        <Select
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
        </Select>
      )}

      <Select
        value={status}
        onValueChange={(value) =>
          setFilters({ status: value as typeof status })
        }
      >
        <SelectTrigger className="max-md:w-full w-fit">
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
        <SelectTrigger className="max-md:w-full w-fit">
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
