"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { AgingBucket } from "@/lib/types/finance"

interface AgingBarChartProps {
  data: AgingBucket[]
  onBucketClick?: (bucket: AgingBucket) => void
}

export function AgingBarChart({ data, onBucketClick }: AgingBarChartProps) {
  return (
    <ChartContainer
      config={{
        amount: {
          label: "Amount",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[200px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]} />}
          />
          <Bar
            dataKey="amount"
            fill="var(--color-amount)"
            radius={[4, 4, 0, 0]}
            cursor="pointer"
            onClick={(data) => onBucketClick?.(data)}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

interface AgingDonutChartProps {
  data: AgingBucket[]
  onBucketClick?: (bucket: AgingBucket) => void
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

export function AgingDonutChart({ data, onBucketClick }: AgingDonutChartProps) {
  return (
    <ChartContainer
      config={{
        percentage: {
          label: "Percentage",
        },
      }}
      className="h-[200px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="percentage"
            onClick={(data) => onBucketClick?.(data)}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => [
                  `${Number(value).toFixed(1)}% ($${props.payload.amount.toLocaleString()})`,
                  props.payload.label,
                ]}
              />
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
