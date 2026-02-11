// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Line, LineChart, XAxis, YAxis } from "recharts";

// interface Props {
//   data: { date: string; hours: number }[];
// }

// const PlaytimeLineChart = ({ data }: Props) => {
//   return (
//     <Card className="col-span-full">
//       <CardHeader>
//         <CardTitle>Playtime Over Time</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <ChartWrapper>
//           <LineChart data={data}>
//             <XAxis dataKey="date" />
//             <YAxis />
//             <Line
//               type="monotone"
//               dataKey="hours"
//               stroke="hsl(var(--chart-1))"
//               strokeWidth={2}
//             />
//           </LineChart>
//         </ChartWrapper>
//       </CardContent>
//     </Card>
//   );
// };

// export default PlaytimeLineChart;
