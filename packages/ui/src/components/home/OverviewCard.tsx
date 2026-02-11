import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface Props {
  label: string;
  value?: string | number;
}

export const OverviewCard = ({ label, value }: Props) => {
  return (
    <Card
      key={label}
      className="w-full py-2.5"
    >
      <CardHeader>
        <CardTitle className="mx-auto text-sm text-muted-foreground">
          {label}
        </CardTitle>

        {value !== undefined && (
          <CardContent className="text-2xl font-semibold mx-auto p-0">
            {value}
          </CardContent>
        )}
      </CardHeader>
    </Card>
  );
};
