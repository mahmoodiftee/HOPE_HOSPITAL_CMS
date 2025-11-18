'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, User, TrendingUp } from 'lucide-react';
import GenerateTimeslotsButton from '@/components/generate';

interface Stats {
  totalDoctors: number;
  totalUsers: number;
  totalTimeSlots: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalDoctors: 0,
    totalUsers: 0,
    totalTimeSlots: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // These would be actual API endpoints that aggregate data
        // For now, we'll use placeholder values
        setStats({
          totalDoctors: 12,
          totalUsers: 45,
          totalTimeSlots: 156,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: Users,
      href: '/dashboard/doctors',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: User,
      href: '/dashboard/users',
      color: 'bg-green-50 text-green-700',
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your Hospital management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Manage Doctors</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add, edit, or remove doctors from your system
            </p>
            <Link href="/dashboard/doctors">
              <Button>Go to Doctors</Button>
            </Link>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Manage Users</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage system users and assign roles
            </p>
            <Link href="/dashboard/users">
              <Button>Go to Users</Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          System Overview
        </h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="font-medium text-foreground">Doctors Module</p>
                <p className="text-xs text-muted-foreground">
                  Fully operational - 12 doctors registered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <User className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="font-medium text-foreground">Users Module</p>
                <p className="text-xs text-muted-foreground">
                  Fully operational - 45 users registered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="font-medium text-foreground">Time Slots Module</p>
                <p className="text-xs text-muted-foreground">
                  Fully operational - 156 slots available
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
