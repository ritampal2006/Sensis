import http.server
import socketserver
import json
import os
import sys
from urllib.parse import parse_qs, urlparse

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

try:
    from sensis_engine import parse_ubuntu_dialogue, analyze_communication_gaps
except ImportError:
    parse_ubuntu_dialogue = None
    analyze_communication_gaps = None

class SensisHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        if self.path == '/api/analyze':
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(post_body)
                transcript = data.get('transcript', '')

                if parse_ubuntu_dialogue and analyze_communication_gaps:
                    turns = parse_ubuntu_dialogue(transcript)
                    processed_turns, gaps = analyze_communication_gaps(turns)
                    
                    response_payload = {
                        "status": "success",
                        "turns": processed_turns,
                        "gaps": gaps,
                        "metrics": {
                            "total_turns": len(processed_turns),
                            "questions_count": sum(1 for t in processed_turns if t['intent'] == 'Question'),
                            "total_gaps": len(gaps)
                        }
                    }
                else:
                    response_payload = {
                        "status": "error",
                        "message": "sensis_engine module not loaded."
                    }

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_payload).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server():
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    
    port = PORT
    for attempt in range(5):
        try:
            with socketserver.TCPServer(("", port), SensisHandler) as httpd:
                print(f"==================================================")
                print(f" Sensis Discourse Intelligence UI is live!")
                print(f" Local URL: http://localhost:{port}")
                print(f"==================================================")
                httpd.serve_forever()
                break
        except OSError:
            port += 1

if __name__ == "__main__":
    run_server()
