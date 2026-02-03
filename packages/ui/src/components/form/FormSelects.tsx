import { SelectItem } from "@repo/ui/components/ui/select";

interface AfterCompletionGameStatusSelectProps {
  isDLC: boolean;
}

interface GameStatusSelectProps {
  completions: number;
  isDLC?: boolean;
}

export const AfterCompletionGameStatusSelect = ({
  isDLC,
}: AfterCompletionGameStatusSelectProps) => {
  return (
    <>
      <SelectItem value="Story Completed">Story Completed</SelectItem>
      <SelectItem value="Platinum">Platinum</SelectItem>
      {!isDLC && <SelectItem value="Platinum+">Platinum+</SelectItem>}
      <SelectItem value="100% Completed">100% Completed</SelectItem>
    </>
  );
};

export const GameStatusSelect = ({
  completions,
  isDLC = false,
}: GameStatusSelectProps) => {
  return (
    <>
      {completions === 0 && (
        <>
          <SelectItem value="Backlog">Backlog</SelectItem>
          <SelectItem value="Dropped">Dropped</SelectItem>
        </>
      )}
      <SelectItem value="Online">Online</SelectItem>
      <SelectItem value="On Hold">On Hold</SelectItem>
      <SelectItem value="Playing">Playing</SelectItem>
      <SelectItem value="Story Completed">Story Completed</SelectItem>
      <SelectItem value="Platinum">Platinum</SelectItem>
      {!isDLC && <SelectItem value="Platinum+">Platinum+</SelectItem>}
      <SelectItem value="100% Completed">100% Completed</SelectItem>
    </>
  );
};

export const CompletionStyleSelect = () => {
  return (
    <>
      <SelectItem value="Speed Run">Speed Run</SelectItem>
      <SelectItem value="Story">Story</SelectItem>
      <SelectItem value="Story + Some Extras">Story + Some Extras</SelectItem>
      <SelectItem value="Story + Lots of Extras">
        Story + Lots of Extras
      </SelectItem>
      <SelectItem value="Completionated">Completionated</SelectItem>
      <SelectItem value="NG+ Run">NG+ Run</SelectItem>
      <SelectItem value="Challenge Run">Challenge Run</SelectItem>
      <SelectItem value="Achievement Run">Achievement Run</SelectItem>
    </>
  );
};

export const OwnershipTypeSelect = () => {
  return (
    <>
      <SelectItem value="Free">Free</SelectItem>
      <SelectItem value="Gift">Gift</SelectItem>
      <SelectItem value="Bought">Bought</SelectItem>
      <SelectItem value="Rented">Rented</SelectItem>
      <SelectItem value="PS+">PS+</SelectItem>
      <SelectItem value="Steam Family">Steam Family</SelectItem>
      <SelectItem value="Game Pass">Game Pass</SelectItem>
    </>
  );
};

export const PSVersionSelect = () => {
  return (
    <>
      <SelectItem value="PS4">PS4</SelectItem>
      <SelectItem value="PS5">PS5</SelectItem>
    </>
  );
};
