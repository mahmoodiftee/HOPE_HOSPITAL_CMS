"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Clock, User, ArrowRight } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">HOPE HOSPITAL CMS</h1>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Link href="/dashboard">
              <Button className="cursor-pointer">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-5xl font-bold text-foreground text-balance">
            Manage Your Healthcare System Efficiently
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete CMS solution for managing doctors, users, and appointment
            time slots
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: "Doctors Management",
              description:
                "Add, edit, and manage doctors with specialties and hourly rates",
              color: "bg-blue-50 text-blue-700",
            },
            {
              icon: Clock,
              title: "Time Slots Management",
              description:
                "Create and manage availability slots for each doctor",
              color: "bg-purple-50 text-purple-700",
            },
            {
              icon: User,
              title: "Users Management",
              description:
                "Manage system users and assign roles for access control",
              color: "bg-green-50 text-green-700",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <Card className="p-12 bg-primary text-primary-foreground">
          <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-sm opacity-90 mb-6">
            Access your healthcare management dashboard now
          </p>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              Enter Dashboard
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Healthcare CMS. Built with Next.js and Appwrite.</p>
        </div>
      </footer>
    </div>
  );
}
