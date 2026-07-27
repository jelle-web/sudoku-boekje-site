"""Mock Apps Script endpoint. Run: python3 mock_server.py [--fail]"""
import json, sys
from http.server import BaseHTTPRequestHandler, HTTPServer

FAIL = "--fail" in sys.argv

class H(BaseHTTPRequestHandler):
    def do_POST(self):
        body = self.rfile.read(int(self.headers["Content-Length"]))
        print("received:", json.dumps(json.loads(body), indent=2))
        self.send_response(500 if FAIL else 200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"ok": false}' if FAIL else b'{"ok": true}')

HTTPServer(("127.0.0.1", 8765), H).serve_forever()
