#!/usr/bin/env python3
"""
Generate all architecture diagrams
Run this script to generate all diagrams at once
"""

import subprocess
import sys
import os

def generate_diagram(script_name):
    """Generate a single diagram"""
    print(f"Generating {script_name}...")
    try:
        result = subprocess.run(
            [sys.executable, script_name],
            cwd=os.path.dirname(os.path.abspath(__file__)),
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print(f"✓ {script_name} generated successfully")
        else:
            print(f"✗ Error generating {script_name}:")
            print(result.stderr)
    except Exception as e:
        print(f"✗ Exception generating {script_name}: {e}")

if __name__ == "__main__":
    scripts = [
        "architecture.py",
        "security_flow.py",
        "api_routes.py",
        "database_schema.py"
    ]
    
    print("=" * 50)
    print("Generating Architecture Diagrams")
    print("=" * 50)
    
    for script in scripts:
        generate_diagram(script)
    
    print("\n" + "=" * 50)
    print("All diagrams generated!")
    print("=" * 50)
    print("\nGenerated files:")
    print("  - architecture.png")
    print("  - security_flow.png")
    print("  - api_routes.png")
    print("  - database_schema.png")

