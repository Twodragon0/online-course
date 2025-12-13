#!/usr/bin/env python3
"""
Database Schema Diagram
Shows Prisma schema relationships
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.compute import Compute

with Diagram("Database Schema - Entity Relationships", filename="database_schema", show=False, direction="TB"):
    database = PostgreSQL("PostgreSQL Database")
    
    with Cluster("User Management"):
        user = Compute("User\n(id, email, name, password,\nsubscriptionStatus)")
        account = Compute("Account\n(OAuth Provider Info)")
        session = Compute("Session\n(Session Tokens)")
    
    with Cluster("Content Management"):
        course = Compute("Course\n(id, title, description, price)")
        video = Compute("Video\n(id, title, url, courseId, position)")
    
    with Cluster("User Interactions"):
        chat = Compute("Chat\n(id, message, response,\nuserId, videoId)")
        chat_log = Compute("ChatLog\n(id, sessionId, message,\nresponse, category)")
    
    with Cluster("Subscription"):
        subscription = Compute("Subscription\n(id, userId, stripeCustomerId,\nstripeSubscriptionId, status)")
    
    # Relationships
    user >> Edge(label="1:N") >> account
    user >> Edge(label="1:N") >> session
    user >> Edge(label="1:N") >> chat
    user >> Edge(label="1:1") >> subscription
    
    course >> Edge(label="1:N") >> video
    video >> Edge(label="1:N") >> chat
    
    database >> user
    database >> course
    database >> video
    database >> chat
    database >> chat_log
    database >> subscription

