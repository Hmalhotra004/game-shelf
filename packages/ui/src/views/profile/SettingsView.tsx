import { Button } from "@repo/ui/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

interface Props {
  renderLink: (to: string, children: React.ReactNode) => React.ReactNode;
}

export const SettingsView = ({ renderLink }: Props) => {
  return (
    <div className="max-w-5xl mx-auto container h-full w-full flex flex-col gap-y-2">
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Profile Settings</CardTitle>
        </CardHeader>

        <CardContent>
          Profile Form
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Other Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex max-md:flex-col justify-center">
            <div className="flex flex-col">
              <h3 className="font-bold">Change Variant</h3>
              <p className="text-sm text-muted-foreground">
                Change collection Card Variant
              </p>
            </div>

            <Button
              variant="secondary"
              type="button"
              className="max-md:mt-6 w-fit ml-auto"
              asChild
            >
              {renderLink("/profile/change-variant", "Change Variant")}
            </Button>
          </div>

          {/* <div className="flex max-md:flex-col justify-center">
            <div className="flex flex-col">
              <h3 className="font-bold">Change Email</h3>
              <p className="text-sm text-muted-foreground">
                Deleting a account is irreversible and will remove all
                associated data
              </p>
            </div>

            <Button
              variant="secondary"
              type="button"
              className="max-md:mt-6 w-fit ml-auto"
            >
              Change Email
            </Button>
          </div> */}

          {/* TODO */}
          <div className="flex max-md:flex-col justify-center">
            <div className="flex flex-col">
              <h3 className="font-bold">Change Password</h3>
              <p className="text-sm text-muted-foreground">
                Changing Password will requrie verified email
              </p>
            </div>

            <Button
              variant="secondary"
              type="button"
              className="max-md:mt-6 w-fit ml-auto"
              asChild
            >
              {renderLink("/profile/reset-password", "Change Password")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TODO */}
      <Card className="w-full border-none shadow-none bg-background-100">
        <CardContent className="px-2">
          <div className="flex max-md:flex-col justify-center">
            <div className="flex flex-col">
              <h3 className="font-bold text-red-500">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Deleting a account is irreversible and will remove all
                associated data
              </p>
            </div>

            <Button
              variant="destructive"
              type="button"
              className="max-md:mt-6 w-fit ml-auto"
              asChild
            >
              {renderLink("/profile/delete-account", "Delete Account")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
