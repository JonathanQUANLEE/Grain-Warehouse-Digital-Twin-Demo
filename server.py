#!/usr/bin/env python3
import argparse
import io
import os
import posixpath
import shutil
import sys
import urllib.error
import urllib.parse
import urllib.request
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath


PROJECT_ROOT = Path(__file__).resolve().parent
SDK_DIR_NAME = "sdk"
SDK_ROOT = PROJECT_ROOT / SDK_DIR_NAME

PROXY_ROUTES = {
    "/bh-proxy/default.aspx": "https://demo.bjblackhole.com/default.aspx",
    "/bh-proxy/blackHole3D/": "https://engine3.bjblackhole.com/blackHole3D/",
    "/bh-proxy/engineweb/": "https://engine3.bjblackhole.com/engineweb/",
}

HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
}

REQUEST_HEADER_ALLOWLIST = {
    "accept",
    "accept-encoding",
    "accept-language",
    "authorization",
    "cache-control",
    "content-length",
    "content-type",
    "if-match",
    "if-modified-since",
    "if-none-match",
    "if-range",
    "if-unmodified-since",
    "range",
    "user-agent",
}

RESPONSE_HEADER_ALLOWLIST = {
    "accept-ranges",
    "cache-control",
    "content-disposition",
    "content-encoding",
    "content-language",
    "content-length",
    "content-range",
    "content-type",
    "etag",
    "expires",
    "last-modified",
    "pragma",
    "server",
    "vary",
}


class GrainDemoHandler(SimpleHTTPRequestHandler):
    server_version = "GrainDemoHTTP/1.0"

    def do_GET(self):
        if self._try_proxy():
            return
        super().do_GET()

    def do_HEAD(self):
        if self._try_proxy():
            return
        super().do_HEAD()

    def do_POST(self):
        if self._try_proxy():
            return
        self.send_error(HTTPStatus.METHOD_NOT_ALLOWED, "Only proxy endpoints accept POST")

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
        super().end_headers()

    def translate_path(self, path):
        parsed = urllib.parse.urlsplit(path)
        request_path = parsed.path
        if request_path == "/sdk":
            request_path = "/sdk/"
        if request_path.startswith("/sdk/"):
            relative = urllib.parse.unquote(request_path[len("/sdk/"):])
            safe_parts = [part for part in PurePosixPath(relative).parts if part not in {"", ".", ".."}]
            return str((SDK_ROOT.joinpath(*safe_parts)).resolve())
        return super().translate_path(path)

    def _try_proxy(self):
        target = self._resolve_proxy_target()
        if not target:
            return False
        self._forward_request(target)
        return True

    def _resolve_proxy_target(self):
        parsed = urllib.parse.urlsplit(self.path)
        path = parsed.path
        for prefix, upstream in PROXY_ROUTES.items():
            if prefix.endswith("/"):
                if not path.startswith(prefix):
                    continue
                tail = path[len(prefix):]
                base = upstream.rstrip("/") + "/"
                target = urllib.parse.urljoin(base, tail)
            else:
                if path != prefix:
                    continue
                target = upstream
            if parsed.query:
                target = f"{target}?{parsed.query}"
            return target
        return None

    def _forward_request(self, target):
        body = None
        if self.command in {"POST", "PUT", "PATCH"}:
            length = int(self.headers.get("Content-Length", "0") or "0")
            body = self.rfile.read(length) if length else None

        upstream_headers = {}
        for key, value in self.headers.items():
            lower = key.lower()
            if lower in HOP_BY_HOP_HEADERS or lower not in REQUEST_HEADER_ALLOWLIST:
                continue
            upstream_headers[key] = value

        request = urllib.request.Request(target, data=body, headers=upstream_headers, method=self.command)
        try:
            with urllib.request.urlopen(request, timeout=30) as upstream:
                self.send_response(upstream.status)
                for key, value in upstream.headers.items():
                    if key.lower() in RESPONSE_HEADER_ALLOWLIST:
                        self.send_header(key, value)
                self.end_headers()
                if self.command != "HEAD":
                    shutil.copyfileobj(upstream, self.wfile)
        except urllib.error.HTTPError as exc:
            self.send_response(exc.code)
            for key, value in exc.headers.items():
                if key.lower() in RESPONSE_HEADER_ALLOWLIST:
                    self.send_header(key, value)
            self.end_headers()
            if self.command != "HEAD":
                shutil.copyfileobj(exc, self.wfile)
        except Exception as exc:  # pragma: no cover - runtime safeguard
            message = f"Proxy request failed: {exc}\nTarget: {target}\n"
            payload = message.encode("utf-8", errors="replace")
            self.send_response(HTTPStatus.BAD_GATEWAY)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(payload)


def main():
    parser = argparse.ArgumentParser(description="Serve the demo on port 8080 with local SDK and proxy support.")
    parser.add_argument("--host", default="0.0.0.0", help="Bind host, default: 0.0.0.0")
    parser.add_argument("--port", type=int, default=8080, help="Bind port, default: 8080")
    args = parser.parse_args()

    handler = partial(GrainDemoHandler, directory=str(PROJECT_ROOT))
    server = ThreadingHTTPServer((args.host, args.port), handler)

    print(f"Serving project root: {PROJECT_ROOT}", flush=True)
    print(f"Local preview: http://127.0.0.1:{args.port}/demo/", flush=True)
    print(f"VS Code forwarded URL should point to port {args.port}", flush=True)
    print("Proxy routes:", flush=True)
    for route, upstream in PROXY_ROUTES.items():
        print(f"  {route} -> {upstream}", flush=True)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
