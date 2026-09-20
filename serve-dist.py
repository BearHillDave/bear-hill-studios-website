#!/usr/bin/env python3
"""Static server for spot-checking the minified dist/ build.

Reads the port from the PORT env var (falling back to 8082 for manual
runs) instead of a hardcoded CLI arg, so the launch config can use
autoPort and avoid colliding with another session's server on a fixed
port.
"""
import http.server
import os

port = int(os.environ.get('PORT', 8082))
http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, port=port)
