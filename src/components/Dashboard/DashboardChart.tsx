
// import { Card } from '@/components/ui/card';
// import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

// export function DashboardChart({ data }: { data: any[] }) {
//   const formatCurrency = (value: number) => {
//     if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
//     if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
//     return `₹${value.toLocaleString()}`;
//   };

//   return (
//     <Card className="p-6 bg-gradient-card border-card-border">
//       <div className="mb-6">
//         <h3 className="text-lg font-semibold text-card-foreground">Investment & User Growth</h3>
//         <p className="text-sm text-muted-foreground">Monthly performance overview</p>
//       </div>

//       <div className="h-80">
//         <ResponsiveContainer width="100%" height="100%">
//           <ComposedChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

//             <XAxis
//               dataKey="month"
//               stroke="hsl(var(--muted-foreground))"
//               fontSize={12}
//             />

//             <YAxis
//               yAxisId="investments"
//               orientation="left"
//               stroke="hsl(var(--primary))"
//               fontSize={12}
//               tickFormatter={formatCurrency}
//             />

//             <YAxis
//               yAxisId="users"
//               orientation="right"
//               stroke="hsl(var(--sidebar-accent))"
//               fontSize={12}
//             />

//             <Tooltip
//               contentStyle={{
//                 backgroundColor: 'hsl(var(--card))',
//                 border: '1px solid hsl(var(--border))',
//                 borderRadius: '8px',
//                 color: 'hsl(var(--card-foreground))'
//               }}
//               formatter={(value, name) => [
//                 name === 'investments' ? formatCurrency(value as number) : value,
//                 name === 'investments' ? 'Investments' : 'New Users'
//               ]}
//             />

//             <Bar
//               yAxisId="investments"
//               dataKey="investments"
//               fill="hsl(var(--primary))"
//               radius={[4, 4, 0, 0]}
//               opacity={0.7}
//             />

//             <Line
//               yAxisId="users"
//               type="monotone"
//               dataKey="users"
//               stroke="hsl(var(--sidebar-accent))"
//               strokeWidth={3}
//               dot={{ fill: 'hsl(var(--sidebar-accent))', strokeWidth: 2, r: 4 }}
//               activeDot={{ r: 6, stroke: 'hsl(var(--sidebar-accent))', strokeWidth: 2 }}
//             />
//           </ComposedChart>
//         </ResponsiveContainer>
//       </div>
//     </Card>
//   );
// }

import { Card } from '@/components/ui/card';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

export function DashboardChart({ data }: { data: any[] }) {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString()}`;
  };

  return (
    <Card className="p-6 bg-gradient-card border-card-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Investment, Payments & User Growth</h3>
        <p className="text-sm text-muted-foreground">Monthly performance overview</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />

            {/* Investments Axis */}
            <YAxis
              yAxisId="investments"
              orientation="left"
              stroke="hsl(var(--primary))"
              fontSize={12}
              tickFormatter={formatCurrency}
            />

            {/* Users Axis */}
            <YAxis
              yAxisId="users"
              orientation="right"
              stroke="hsl(var(--sidebar-accent))"
              fontSize={12}
            />

            {/* Paid Amount Axis */}
            <YAxis
              yAxisId="paid"
              orientation="right"
              stroke="hsl(var(--chart-3))"
              fontSize={12}
              tickFormatter={formatCurrency}
              hide // hides axis but allows scaling
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))'
              }}
              formatter={(value, name) => {
                if (name === 'investments' || name === 'paid') {
                  return [formatCurrency(value as number), name === 'investments' ? 'Investments' : 'Paid Amount'];
                }
                return [value, 'New Users'];
              }}
            />

            {/* Investments Bar */}
            <Bar
              yAxisId="investments"
              dataKey="investments"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              opacity={0.7}
            />

            {/* Users Growth Line */}
            <Line
              yAxisId="users"
              type="monotone"
              dataKey="users"
              stroke="hsl(var(--sidebar-accent))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--sidebar-accent))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--sidebar-accent))', strokeWidth: 2 }}
            />

            {/* Paid Amount Line */}
            <Line
              yAxisId="paid"
              type="monotone"
              dataKey="paid"
              stroke="hsl(var(--chart-3))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--chart-3))', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

