import React, { useEffect, useState } from 'react';

const ThreatLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/threat_logs.json');
        const text = await res.text();
        const lines = text.trim().split('\n');
        const parsedLogs = lines.map(line => JSON.parse(line));
        setLogs(parsedLogs.slice(-10)); // latest 10 logs
      } catch (error) {
        console.error("Error loading threat logs:", error);
      }
    };

    fetchLogs(); // initial load
    const interval = setInterval(fetchLogs, 3000); // refresh every 3s
    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div className="bg-black text-green-400 p-4 border border-green-700 rounded-lg h-[300px] overflow-y-auto">
      <h2 className="text-lg font-bold mb-2 text-white">🛡️ Real-Time Threat Logs</h2>
      {logs.map((log, idx) => {
        const isBlocked = log.status?.toUpperCase() === 'BLOCKED';
        return (
          <div
            key={idx}
            className={`text-sm mb-1 px-2 py-1 rounded ${
              isBlocked ? 'bg-red-700 text-white' : 'bg-green-700 text-white'
            }`}
          >
            [{log.timestamp}] {log.attack_type} from {log.ip} on port {log.port} —{' '}
            <span className="font-bold">{log.status?.toUpperCase()}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ThreatLogs;
