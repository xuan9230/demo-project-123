#!/usr/bin/env python3
"""Validate conventional commit headers for this monorepo."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from typing import List, Tuple

ALLOWED_TYPES = {
    "feat",
    "fix",
    "docs",
    "refactor",
    "test",
    "chore",
    "perf",
    "ci",
    "build",
    "revert",
}

ALLOWED_SCOPES = {
    "backend",
    "frontend",
    "landing",
    "docs",
    "monorepo",
    "infra",
}

HEADER_RE = re.compile(
    r"^(?P<type>[a-z]+)(?:\((?P<scope>[a-z0-9-]+)\))?: (?P<subject>.+)$"
)


def get_head_subject() -> str:
    result = subprocess.run(
        ["git", "log", "-1", "--pretty=%s"],
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout.strip()


def validate_header(header: str) -> Tuple[bool, List[str]]:
    errors: List[str] = []

    if not header:
        return False, ["Header is empty."]

    if len(header) > 72:
        errors.append(f"Header is too long ({len(header)} > 72 characters).")

    match = HEADER_RE.match(header)
    if not match:
        errors.append("Header must match '<type>(<scope>)?: <subject>'.")
        return False, errors

    commit_type = match.group("type")
    scope = match.group("scope")
    subject = match.group("subject")

    if commit_type not in ALLOWED_TYPES:
        errors.append(
            "Type is not allowed. Use one of: " + ", ".join(sorted(ALLOWED_TYPES)) + "."
        )

    if scope and scope not in ALLOWED_SCOPES:
        errors.append(
            "Scope is not allowed. Use one of: " + ", ".join(sorted(ALLOWED_SCOPES)) + "."
        )

    if not subject:
        errors.append("Subject must not be empty.")
    else:
        if subject[0].isalpha() and subject[0].isupper():
            errors.append("Subject should start with lowercase.")
        if subject.endswith("."):
            errors.append("Subject should not end with a period.")

    return len(errors) == 0, errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate commit name/header")
    parser.add_argument(
        "message",
        nargs="?",
        help="Commit header to validate. If omitted, validates latest commit subject.",
    )
    args = parser.parse_args()

    try:
        header = args.message or get_head_subject()
    except subprocess.CalledProcessError as exc:
        print("Failed to read latest commit message from git.", file=sys.stderr)
        if exc.stderr:
            print(exc.stderr.strip(), file=sys.stderr)
        return 2

    valid, errors = validate_header(header)

    print(f"Commit header: {header}")
    if valid:
        print("PASS: Commit header is valid.")
        return 0

    print("FAIL: Commit header is invalid.")
    for idx, err in enumerate(errors, start=1):
        print(f"{idx}. {err}")

    print("Example valid headers:")
    print("- feat(frontend): add auth guard for listing page")
    print("- fix: handle missing env var in startup")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
