from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

os.chdir(Path(__file__).parent / 'dist')

class PreviewHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0].rstrip('/') in ('/setting', '/about'):
            self.path = '/index.html'
        super().do_GET()

print('Local: http://localhost:4317', flush=True)
ThreadingHTTPServer(('127.0.0.1', 4317), PreviewHandler).serve_forever()
