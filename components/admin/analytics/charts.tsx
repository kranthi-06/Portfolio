"use client";

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];
const BGS = ['rgba(99,102,241,0.1)', 'rgba(139,92,246,0.1)', 'rgba(236,72,153,0.1)', 'rgba(244,63,94,0.1)', 'rgba(245,158,11,0.1)', 'rgba(16,185,129,0.1)'];

export function TrafficAreaChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-sm text-gray-500">No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} dx={-10} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
          itemStyle={{ color: '#e5e5e5' }}
        />
        <Area type="monotone" dataKey="visitors" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AnalyticsPieChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-sm text-gray-500">No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
