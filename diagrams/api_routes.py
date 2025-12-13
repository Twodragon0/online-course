#!/usr/bin/env python3
"""
API Routes Structure Diagram
Shows all API endpoints and their security features
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.generic.compute import Compute
from diagrams.onprem.security import Vault
from diagrams.generic.network import Firewall

with Diagram("API Routes Structure", filename="api_routes", show=False, direction="TB"):
    with Cluster("Public APIs"):
        videos = Compute("GET /api/videos\nRate Limit: 30/min\nNo Auth Required")
        register = Compute("POST /api/register\nRate Limit: 5/min\nInput Validation\nPassword Strength")
    
    with Cluster("Authenticated APIs"):
        subscription_get = Compute("GET /api/subscription\nRate Limit: 20/min\nAuth Required")
        subscription_post = Compute("POST /api/subscription\nRate Limit: 5/min\nAuth Required")
        payment = Compute("POST /api/create-payment-session\nRate Limit: 5/min\nAuth Required\nStripe Validation")
        stripe_get = Compute("GET /api/stripe\nRate Limit: 20/min\nAuth Required")
    
    with Cluster("AI & Content APIs"):
        chat = Compute("POST /api/chat\nRate Limit: 20/min\nMessage Validation\nXSS Sanitization\nDeepSeek API")
        video_summary = Compute("POST /api/video-summary\nRate Limit: 10/min\nFile ID Validation")
        related_questions = Compute("POST /api/related-questions\nRate Limit: 20/min")
    
    with Cluster("Auth APIs"):
        nextauth = Compute("GET/POST /api/auth/[...nextauth]\nGoogle OAuth\nSession Management")
    
    with Cluster("Webhooks"):
        stripe_webhook = Compute("POST /api/webhooks/stripe\nStripe Signature Verification")
        paypal_webhook = Compute("POST /api/webhooks/paypal\nPayPal Verification")
    
    # Security features
    with Cluster("Security Features"):
        rate_limiting = Vault("Rate Limiting\n(IP-based, Memory Store)")
        validation = Vault("Input Validation\n(Email, Password, File ID)")
        sanitization = Vault("XSS Sanitization\n(HTML Escaping)")
        auth = Firewall("Authentication\n(NextAuth Session)")

