"""
Run this once to generate a bcrypt hash for your admin password, then paste
the result into your .env file as ADMIN_PASSWORD_HASH.

Usage:
    python set_admin_password.py "YourNewPassword123"
"""
import sys

from app.auth import hash_password

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python set_admin_password.py <password>")
        sys.exit(1)
    print(hash_password(sys.argv[1]))
