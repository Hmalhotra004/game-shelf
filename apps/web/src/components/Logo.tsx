import { Gamepad2Icon } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <Gamepad2Icon className="size-8 text-foreground" />
      <h1 className="text-xl font-bold text-foreground">GameShelf</h1>
    </div>
  );
};

export default Logo;
