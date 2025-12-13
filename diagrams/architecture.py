#!/usr/bin/env python3
"""
Online Course Platform - System Architecture Diagram
Generates architecture diagrams using the diagrams library
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Users, Browser
from diagrams.onprem.network import Internet
from diagrams.programming.framework import Nextjs
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.inmemory import Redis
from diagrams.saas.chat import Slack
from diagrams.generic.payment import Payment
from diagrams.generic.compute import Compute
from diagrams.onprem.security import Vault
from diagrams.generic.storage import Storage
from diagrams.generic.network import Firewall

# System Architecture Diagram
with Diagram("Online Course Platform Architecture", filename="architecture", show=False, direction="TB"):
    users = Users("Users")
    browser = Browser("Browser")
    internet = Internet("Internet")
    
    with Cluster("Vercel Edge Network"):
        with Cluster("Next.js Application"):
            middleware = Firewall("Security Middleware\n(CSP, CORS, Rate Limit)")
            nextjs = Nextjs("Next.js 14\n(React Server Components)")
            
            with Cluster("API Routes"):
                auth_api = Compute("Auth API\n(/api/auth)")
                register_api = Compute("Register API\n(/api/register)")
                chat_api = Compute("Chat API\n(/api/chat)")
                videos_api = Compute("Videos API\n(/api/videos)")
                payment_api = Compute("Payment API\n(/api/stripe)")
                subscription_api = Compute("Subscription API\n(/api/subscription)")
            
            with Cluster("Security Layer"):
                rate_limit = Vault("Rate Limiting")
                validation = Vault("Input Validation")
                sanitization = Vault("XSS Protection")
    
    with Cluster("Database Layer"):
        prisma = Compute("Prisma ORM")
        postgres = PostgreSQL("PostgreSQL\n(Vercel Postgres)")
    
    with Cluster("External Services"):
        stripe = Payment("Stripe\n(Payment Processing)")
        deepseek = Slack("DeepSeek API\n(AI Chat)")
        google = Compute("Google OAuth\n(Authentication)")
    
    # Flow connections
    users >> browser >> internet >> middleware
    middleware >> nextjs
    nextjs >> rate_limit >> validation >> sanitization
    
    nextjs >> auth_api
    nextjs >> register_api
    nextjs >> chat_api
    nextjs >> videos_api
    nextjs >> payment_api
    nextjs >> subscription_api
    
    auth_api >> google
    register_api >> prisma
    chat_api >> deepseek
    chat_api >> prisma
    videos_api >> prisma
    payment_api >> stripe
    subscription_api >> prisma
    
    prisma >> postgres

