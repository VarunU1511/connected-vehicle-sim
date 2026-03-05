'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Battery, Car, Map, Zap, Database } from 'lucide-react';

interface VehicleState {
  vin: string;
  speed: number;
  battery: number;
  location: { lat: number; lon: number };
  timestamp: string;
}

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<VehicleState[]>([]);
  const [totalVehicles, setTotalVehicles] = useState(0);

  // Poll exactly every 1000ms from the Next.js DB-bridged Backend Route
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('/api/vehicles', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          // Sort by VIN to keep the grid stable
          const sorted = data.vehicles.sort((a: any, b: any) => a.vin.localeCompare(b.vin));
          setVehicles(sorted.map((v: any) => v.state));
          setTotalVehicles(data.count);
        }
      } catch (err) {
        console.error('Failed to fetch vehicles', err);
      }
    };

    fetchVehicles();
    const interval = setInterval(fetchVehicles, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute fleet averages
  const avgSpeed = vehicles.length
    ? Math.round(vehicles.reduce((acc, v) => acc + v.speed, 0) / vehicles.length)
    : 0;

  const avgBattery = vehicles.length
    ? Math.round(vehicles.reduce((acc, v) => acc + v.battery, 0) / vehicles.length)
    : 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30">

      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0,rgba(0,0,0,0)_50%)]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              Fleet Command
            </h1>
            <p className="text-neutral-400 mt-2 flex items-center gap-2 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Telemetry &bull; Connected to Kafka + LocalStack
            </p>
          </div>
        </header>

        {/* Top KPI Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl relative overflow-hidden group hover:border-white/[0.1] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Active Vehicles</p>
                <p className="text-4xl font-bold tracking-tight font-mono">{totalVehicles}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Car className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500" style={{ width: `${Math.min((totalVehicles / 100) * 100, 100)}%` }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl relative overflow-hidden group hover:border-white/[0.1] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Average Speed</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-bold tracking-tight font-mono">{avgSpeed}</p>
                  <span className="text-neutral-500 font-medium">km/h</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl relative overflow-hidden group hover:border-white/[0.1] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Fleet Battery</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-bold tracking-tight font-mono">{avgBattery}</p>
                  <span className="text-neutral-500 font-medium">%</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-amber-500/50 transition-all duration-500" style={{ width: `${avgBattery}%` }} />
          </motion.div>

        </div>

        {/* Main Fleet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {vehicles.map((vehicle) => {
              const isMovingFast = vehicle.speed > 80;
              const isLowBattery = vehicle.battery < 20;

              return (
                <motion.div
                  key={vehicle.vin}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-neutral-500" />
                      <span className="font-mono text-sm font-medium text-neutral-300">{vehicle.vin}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                        <Activity className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Speed</span>
                      </div>
                      <p className={`text-xl font-bold font-mono tracking-tight ${isMovingFast ? 'text-emerald-400' : 'text-neutral-100'}`}>
                        {vehicle.speed} <span className="text-xs font-medium text-neutral-500 font-sans">km/h</span>
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                        <Battery className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Battery</span>
                      </div>
                      <p className={`text-xl font-bold font-mono tracking-tight ${isLowBattery ? 'text-red-400 animate-pulse' : 'text-neutral-100'}`}>
                        {vehicle.battery} <span className="text-xs font-medium text-neutral-500 font-sans">%</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center gap-2 text-xs text-neutral-500 font-mono">
                    <Map className="h-3 w-3" />
                    <span>{vehicle.location.lat.toFixed(4)}, {vehicle.location.lon.toFixed(4)}</span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
