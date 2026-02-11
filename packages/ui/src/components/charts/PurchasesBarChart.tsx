// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Bar, BarChart, XAxis, YAxis } from "recharts";
// import { ChartConfig, ChartContainer } from "../ui/chart";

// interface Props {
//   data: { month: string; games: number; amount: number }[];
// }

// const PurchasesBarChart = ({ data }: Props) => {
//   const chartConfig = {
//     games: {
//       label: "Games",
//       color: "#2563eb",
//     },
//     amount: {
//       label: "Amount",
//       color: "#60a5fa",
//     },
//   } satisfies ChartConfig;

//   return (
//     <Card className="col-span-full">
//       <CardHeader>
//         <CardTitle>Purchases Per Month</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer
//           config={chartConfig}
//           className="h-65 w-full"
//         >
//           <BarChart data={data}>
//             <XAxis dataKey="month" />
//             <YAxis />
//             <Bar
//               dataKey="games"
//               fill="hsl(var(--chart-2))"
//             />
//           </BarChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// };

// export default PurchasesBarChart;
