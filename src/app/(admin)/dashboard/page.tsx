// app/(admin)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminDashboard() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && role !== 'admin') {
      router.replace('/home');
    }
  }, [role, isLoading, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Aggregate basic numbers (in production, use Cloud Function or Recharts with live data)
        const usersSnap = await getDocs(collection(db, 'users'));
        const contentSnap = await getDocs(collection(db, 'content'));
        const watchSnap = await getDocs(collection(db, 'watchHistory'));
        const revenue = 12345; // placeholder
        setStats({
          totalUsers: usersSnap.size,
          totalContent: contentSnap.size,
          totalWatchTime: watchSnap.docs.reduce((sum, doc) => sum + (doc.data().progress || 0), 0),
          revenue,
        });
      } catch (e) {
        console.error('Failed to load analytics', e);
      } finally {
        setLoadingData(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading || loadingData) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (role !== 'admin') return null;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-5 mb-10">
        {[
          { label: 'MAU', value: stats?.totalUsers ?? 0 },
          { label: 'Total Content', value: stats?.totalContent ?? 0 },
          { label: 'Watch Time (h)', value: Math.round((stats?.totalWatchTime ?? 0) / 3600) },
          { label: 'Revenue ($)', value: stats?.revenue ?? 0 },
          { label: 'Server Load', value: '42%' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className="glass rounded-xl p-5"
          >
            <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts (placeholder) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Active Users</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[{ month: 'May', users: 5000 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#B0B3C9" />
              <YAxis stroke="#B0B3C9" />
              <Tooltip />
              <Bar dataKey="users" fill="#6C5CE7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Content Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={[{ name: 'Movies', value: 40 }, { name: 'Series', value: 30 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#6C5CE7">
                <Cell fill="#6C5CE7" />
                <Cell fill="#00F2FE" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}