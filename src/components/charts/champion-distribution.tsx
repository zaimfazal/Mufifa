/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#A855F7', '#EF4444', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#8B5CF6']

export function ChampionDistribution({ data }: { data: { name: string, value: number }[] }) {
  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No predictions yet</div>

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: any) => [value, 'Predictions']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

