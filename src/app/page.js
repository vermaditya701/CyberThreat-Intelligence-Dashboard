"use client"

import { useEffect, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { toast } from "sonner"
import { parse } from 'date-fns'
import VirusScanner from '@/components/ui/VirusScanner';


const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a0e']

export default function Dashboard() {
  const canvasRef = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("threatFilters");
      return saved ? JSON.parse(saved) : { ip: '', port: '', attack: '', time: '', startTime: '', endTime: '' };
    }
    return { ip: '', port: '', attack: '', time: '', startTime: '', endTime: '' };
  });
  const [suggestions, setSuggestions] = useState({ ips: [], attacks: [] });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "false" ? false : true;
    }
    return true;
  });

  useEffect(() => {
    toast.success("✅ Dashboard Loaded Successfully!");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("threatFilters", JSON.stringify(filters));
    }
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/threat_logs.json');
        const json = await res.json();
        setChartData(json.logs);
        setLogs(json.logs.slice(-5).reverse());

        const ips = [...new Set(json.logs.map(log => log.ip))];
        const attacks = [...new Set(json.logs.map(log => log.attack))];
        setSuggestions({ ips, attacks });
      } catch (error) {
        toast.error("❌ Failed to load logs");
        console.error("Failed to fetch logs:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !darkMode) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "アァイィウヴエカガキギクグケゲコサザシジスズセタダチヂッヅテデトナニヌネノハバパヒビピフブプベペホボマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [darkMode]);

  const parseTime = (timeStr) => parse(timeStr, "HH:mm", new Date());

  const filteredLogs = logs.filter(log => {
    const matchIP = filters.ip === '' || log.ip === filters.ip;
    const matchPort = filters.port === '' || log.port.toString() === filters.port;
    const matchAttack = filters.attack === '' || log.attack === filters.attack;
    const matchTime = filters.time === '' || log.time.includes(filters.time);
    const matchStartTime = filters.startTime === '' || parseTime(log.time) >= parseTime(filters.startTime);
    const matchEndTime = filters.endTime === '' || parseTime(log.time) <= parseTime(filters.endTime);
    return matchIP && matchPort && matchAttack && matchTime && matchStartTime && matchEndTime;
  });

  const filteredChartData = chartData.filter(log => {
    const matchIP = filters.ip === '' || log.ip === filters.ip;
    const matchPort = filters.port === '' || log.port.toString() === filters.port;
    const matchAttack = filters.attack === '' || log.attack === filters.attack;
    const matchTime = filters.time === '' || log.time.includes(filters.time);
    const matchStartTime = filters.startTime === '' || parseTime(log.time) >= parseTime(filters.startTime);
    const matchEndTime = filters.endTime === '' || parseTime(log.time) <= parseTime(filters.endTime);
    return matchIP && matchPort && matchAttack && matchTime && matchStartTime && matchEndTime;
  });

  const attackDistribution = Object.entries(
    filteredChartData.reduce((acc, log) => {
      acc[log.attack] = (acc[log.attack] || 0) + 1;
      return acc;
    }, {})
  ).map(([attack, value]) => ({ name: attack, value }));

  const downloadCSV = () => {
    const headers = "Time,IP,Attack,Port,Status\n";
    const rows = filteredLogs.map(log => `${log.time},${log.ip},${log.attack},${log.port},${log.status}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'threat_logs.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("✅ CSV downloaded successfully");
  };

  const clearFilters = () => {
    const emptyFilters = { ip: '', port: '', attack: '', time: '', startTime: '', endTime: '' };
    setFilters(emptyFilters);
    localStorage.removeItem("threatFilters");
    toast.info("🔄 Filters cleared");
  };

  return (
    <main className={`relative min-h-screen p-6 transition-colors duration-300 ${darkMode ? 'bg-black text-green-400' : 'bg-white text-black'}`}>
      <canvas ref={canvasRef} className={`fixed top-0 left-0 w-full h-full z-0 pointer-events-none ${darkMode ? '' : 'hidden'}`} />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">🛡️ Cyber Threat Intelligence Dashboard</h1>
          <button
            onClick={() => setDarkMode(prev => !prev)}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Toggle {darkMode ? '☀️ Light' : '🌙 Dark'} Mode
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className={`rounded p-4 shadow ${darkMode ? 'bg-zinc-800 text-white' : 'bg-gray-200 text-black'}`}>
            <h3 className="text-lg font-semibold">Total Threats Detected</h3>
            <p className="text-3xl">{filteredChartData.length}</p>
          </div>

          <div className={`rounded p-4 shadow ${darkMode ? 'bg-zinc-800 text-white' : 'bg-gray-200 text-black'}`}>
            <h3 className="text-lg font-semibold">Active IPs</h3>
            <p className="text-3xl">{[...new Set(filteredChartData.map(log => log.ip))].length}</p>
          </div>

          <div className={`rounded p-4 shadow ${darkMode ? 'bg-zinc-800 text-white' : 'bg-gray-200 text-black'}`}>
            <h3 className="text-lg font-semibold">Blocked Ports</h3>
            <p className="text-3xl">
  {
    [...new Set(
      filteredChartData
        .filter(log => log.status?.toUpperCase() === "BLOCKED")
        .map(log => log.port)
    )].length
  }
</p>

          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Filter by IP"
            className="bg-zinc-800 p-2 rounded text-white placeholder-zinc-500"
            value={filters.ip}
            onChange={e => setFilters(prev => ({ ...prev, ip: e.target.value }))}
            list="ip-suggestions"
          />
          <datalist id="ip-suggestions">
            {suggestions.ips.map(ip => <option key={ip} value={ip} />)}
          </datalist>

          <input
            type="text"
            placeholder="Filter by Port"
            className="bg-zinc-800 p-2 rounded text-white placeholder-zinc-500"
            value={filters.port}
            onChange={e => setFilters(prev => ({ ...prev, port: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Filter by Attack Type"
            className="bg-zinc-800 p-2 rounded text-white placeholder-zinc-500"
            value={filters.attack}
            onChange={e => setFilters(prev => ({ ...prev, attack: e.target.value }))}
            list="attack-suggestions"
          />
          <datalist id="attack-suggestions">
            {suggestions.attacks.map(a => <option key={a} value={a} />)}
          </datalist>

          <input
            type="text"
            placeholder="Filter by Time (HH:mm)"
            className="bg-zinc-800 p-2 rounded text-white placeholder-zinc-500"
            value={filters.time}
            onChange={e => setFilters(prev => ({ ...prev, time: e.target.value }))}
          />

          <button
            onClick={downloadCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >⬇️ Download CSV</button>

          <button
            onClick={clearFilters}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >❌ Clear All Filters</button>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-xl font-semibold mb-2 text-white">📈 Threats Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredChartData}>
                <Line type="monotone" dataKey="count" stroke="#0f0" strokeWidth={2} />
                <XAxis dataKey="time" stroke="#0f0" />
                <YAxis stroke="#0f0" />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-xl font-semibold mb-2 text-white">📊 Attack Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={attackDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {attackDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Logs */}
       <div className={`rounded-lg p-4 shadow mt-6 ${darkMode ? 'bg-zinc-900 text-white' : 'bg-gray-100 text-black'}`}>
  <h2 className="text-xl font-semibold mb-3">📋 System Logs</h2>
  <ul className="space-y-2">
    {filteredLogs.map((log, index) => {
      const isBlocked = log.status?.toUpperCase() === 'BLOCKED';

      return (
        <li
          key={index}
          className={`rounded p-3 text-sm flex items-center justify-between
            ${isBlocked
              ? (darkMode ? 'bg-red-700 text-white' : 'bg-pink-200 text-black')
              : (darkMode ? 'bg-green-700 text-white' : 'bg-green-200 text-black')}
          `}
        >
          <span>
            [{log.time}] ⚠️ <strong>{log.attack}</strong> from{" "}
            <span
              className="underline cursor-pointer"
              onClick={() => navigator.clipboard.writeText(log.ip)}
            >
              {log.ip}:{log.port}
            </span>
          </span>
          <span
            className={`ml-2 px-2 py-1 text-xs rounded ${
              isBlocked ? 'bg-red-600' : 'bg-green-600'
            } text-white`}
          >
            {log.status}
          </span>
        </li>
      );
    })}
  </ul>
</div>


      </div>
    </main>
  );
}
