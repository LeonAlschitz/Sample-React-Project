#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.join(os.path.dirname(__file__), 'dist'), **kwargs)

if __name__ == "__main__":
    if not os.path.exists('dist'):
        print("Error: 'dist' directory not found. Please run 'npm run build' first.")
        sys.exit(1)
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

