#!/usr/bin/env python3
"""
Security Flow Diagram
Shows the security layers and flow for API requests
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Users
from diagrams.onprem.network import Internet
from diagrams.onprem.security import Vault, VaultSecret
from diagrams.generic.network import Firewall
from diagrams.generic.compute import Compute
from diagrams.onprem.database import PostgreSQL

with Diagram("Security Flow - API Request Processing", filename="security_flow", show=False, direction="LR"):
    client = Users("Client Request")
    
    with Cluster("Security Layers"):
        middleware = Firewall("Middleware\n(CSP, CORS Headers)")
        rate_limit = Vault("Rate Limiting\n(IP-based)")
        auth_check = VaultSecret("Authentication\n(NextAuth)")
        input_validation = Vault("Input Validation\n(Email, Password, etc.)")
        sanitization = Vault("XSS Sanitization\n(HTML Escaping)")
    
    with Cluster("API Route"):
        api_handler = Compute("API Handler\n(Business Logic)")
    
    with Cluster("Data Layer"):
        prisma = Compute("Prisma ORM\n(Parameterized Queries)")
        database = PostgreSQL("PostgreSQL")
    
    # Security flow
    client >> Edge(label="1. Request") >> middleware
    middleware >> Edge(label="2. Rate Limit Check") >> rate_limit
    rate_limit >> Edge(label="3. Auth Check") >> auth_check
    auth_check >> Edge(label="4. Input Validation") >> input_validation
    input_validation >> Edge(label="5. Sanitization") >> sanitization
    sanitization >> Edge(label="6. Process") >> api_handler
    api_handler >> Edge(label="7. Safe Query") >> prisma
    prisma >> Edge(label="8. SQL") >> database

