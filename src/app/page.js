'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: '12:00', threats: 3 },
  { name: '12:05', threats: 6 },
  { name: '12:10', threats: 2 },
  { name: '12:15', threats: 8 },
  { name: '12:20', threats: 4 },
]

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🛡️ Cyber Threat Intelligence Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4">
            <h2 className="text-xl font-semibold">Total Threats Detected</h2>
            <p className="text-3xl mt-2 text-red-500 font-bold">42</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <h2 className="text-xl font-semibold">Active IPs</h2>
            <p className="text-3xl mt-2 text-yellow-400 font-bold">17</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <h2 className="text-xl font-semibold">Blocked Ports</h2>
            <p className="text-3xl mt-2 text-green-400 font-bold">11</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">📈 Threats Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <Line type="monotone" dataKey="threats" stroke="#f43f5e" strokeWidth={2} />
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <Card>
          <CardContent className="pt-4">
            <h2 className="text-xl font-semibold mb-2">📝 System Logs</h2>
            <ul className="text-sm space-y-1 text-zinc-300 font-mono">
              <li>[12:01] ⚠️ Suspicious connection from 192.168.1.10:443</li>
              <li>[12:04] 🚫 Malware blocked on port 8080</li>
              <li>[12:08] 👤 User login attempt from 172.16.0.2</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
