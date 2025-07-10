from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Replace with your VirusTotal API Key
VIRUSTOTAL_API_KEY = '318b45586c71db0e02ae678c763e4f6f225cec0d7377fee985e52ffd1e5c9b04'

@app.route("/")
def home():
    return "🛡️ Cyber Threat Dashboard API"

# ---------- 🔍 VirusTotal URL Scanner ----------
@app.route("/scan", methods=["POST"])
def scan_url():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "Missing URL"}), 400

    headers = {
        "x-apikey": VIRUSTOTAL_API_KEY
    }

    # Step 1: Submit URL for scanning
    vt_response = requests.post(
        "https://www.virustotal.com/api/v3/urls",
        headers=headers,
        data={"url": url}
    )

    if vt_response.status_code == 200:
        scan_id = vt_response.json()['data']['id']

        # Step 2: Get scan analysis report using scan ID
        report_response = requests.get(
            f"https://www.virustotal.com/api/v3/analyses/{scan_id}",
            headers=headers
        )

        return jsonify(report_response.json())
    else:
        return jsonify({
            "error": "VirusTotal scan failed",
            "details": vt_response.text
        }), vt_response.status_code

# 🟢 ADD THIS TO RUN THE SERVER
if __name__ == "__main__":
    app.run(debug=True)
