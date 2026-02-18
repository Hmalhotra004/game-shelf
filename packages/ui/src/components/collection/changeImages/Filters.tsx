import { useChangeImageFilters } from "@repo/ui/hooks/useChangeImageFilters";
import { Switch } from "../../ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

export const Filters = () => {
  const [filters, setFilters] = useChangeImageFilters();

  const { cardType, directLink } = filters;

  return (
    <div className="flex items-center gap-4 mr-2">
      <Select
        value={cardType}
        onValueChange={(value) =>
          setFilters({ cardType: value as typeof cardType })
        }
      >
        <SelectTrigger className="w-fit">
          <SelectValue placeholder="Card Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="compact">Compact</SelectItem>
          <SelectItem value="overlay">Overlay</SelectItem>
          <SelectItem value="slideUp">SlideUp</SelectItem>
        </SelectContent>
      </Select>

      <p>Direct Link</p>
      <Switch
        checked={directLink}
        onCheckedChange={(v) => setFilters({ directLink: v })}
      />
    </div>
  );
};
