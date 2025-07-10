import random
import time
import json
import os

attacks = ['Malware', 'Phishing', 'DDoS', 'Brute Force', 'Port Scan']
ports = [22, 80, 443, 3389, 8080]

LOG_FILE = os.path.join(os.path.dirname(__file__), '../public/threat_logs.json')

logs = []

def generate_log():
    return {
        "time": time.strftime("%H:%M"),
        "ip": f"192.168.1.{random.randint(2, 254)}",
        "attack": random.choice(attacks),
        "port": random.choice(ports),
        "status": random.choice(["blocked", "allowed"]),
        "count": random.randint(1, 5)
    }

while True:
    log = generate_log()
    logs.append(log)

    # Keep only latest 50 logs to avoid overload
    if len(logs) > 50:
        logs = logs[-50:]

    with open(LOG_FILE, 'w') as f:
        json.dump({"logs": logs}, f, indent=2)

    print(f"Log written: {log}")
    time.sleep(2)
