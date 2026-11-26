"""Redact address literals before website diagnostics are formatted or written.

This protects logs, not the IP routing information needed to serve a request.
"""
import ipaddress
import logging
import re

V4 = re.compile(r'(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.])')
V6 = re.compile(r'(?<![\w])(?:[0-9a-fA-F]{0,4}:){2,}[0-9a-fA-F:.]*(?:%[\w.-]+)?')

def redact_ip(text):
    def replace(match):
        candidate = match.group(0)
        try:
            ipaddress.ip_address(candidate.split('%', 1)[0])
            return '[IP REDACTED]'
        except ValueError:
            return candidate
    return V4.sub(replace, V6.sub(replace, str(text)))

class RedactingFormatter(logging.Formatter):
    def __init__(self, original):
        super().__init__()
        self.original = original or logging.Formatter()
    def format(self, record):
        return redact_ip(self.original.format(record))

def install():
    """Wrap current root and named-logger output, including exception text."""
    loggers = [logging.getLogger()]
    loggers += [logger for logger in logging.Logger.manager.loggerDict.values() if isinstance(logger, logging.Logger)]
    seen = set()
    for logger in loggers:
        for handler in logger.handlers:
            if id(handler) in seen:
                continue
            seen.add(id(handler))
            if not isinstance(handler.formatter, RedactingFormatter):
                handler.setFormatter(RedactingFormatter(handler.formatter))
