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

  const { cardType, directLink, imageOnly, nsfw } = filters;

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

      <div className="flex items-center gap-2">
        <p>NSFW Only</p>
        <Switch
          checked={nsfw}
          onCheckedChange={(v) => setFilters({ nsfw: v })}
        />
      </div>

      <div className="flex items-center gap-2">
        <p>Image Only</p>
        <Switch
          checked={imageOnly}
          onCheckedChange={(v) => setFilters({ imageOnly: v })}
        />
      </div>

      <div className="flex items-center gap-2">
        <p>Show Selected</p>
        <Switch
          checked={directLink}
          onCheckedChange={(v) => setFilters({ directLink: v })}
        />
      </div>
    </div>
  );
};
