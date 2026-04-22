import { InfoIcon } from "lucide-react";

const SteamInstructions = () => {
  return (
    <div className="text-sm text-muted-foreground space-y-1">
      <p className="flex items-center gap-1">
        <InfoIcon className="h-4 w-4" />
        Used to sync your Steam achievements and games.
      </p>

      <ol className="list-decimal list-inside ml-5 space-y-0.5">
        <li>
          Open{" "}
          <a
            href="https://store.steampowered.com"
            target="_blank"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Steam
          </a>{" "}
          (browser or app)
        </li>

        <li>
          Click on your username on the top right corner beside your avatar, and
          select account details.
        </li>

        <li>
          You will see {`<`}&quot;your account name&quot;{`>`} &apos;s account
          in big bold letters.
        </li>

        <li>
          Below it You will see something like:{" "}
          <code>
            &quot;Steam Id:&quot; {`<`}&quot;17 digit number&quot;{`>`}
          </code>
        </li>

        <li>Copy the 17 digit number and paste it here</li>
      </ol>
    </div>
  );
};

export default SteamInstructions;
