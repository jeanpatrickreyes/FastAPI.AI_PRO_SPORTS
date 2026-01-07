#!/usr/bin/env python3
"""
Script to create a new user in the database
Usage: python scripts/create_user.py <email> <password>
"""

import asyncio
import sys
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session
from app.core.security import SecurityManager
from app.models.models import UserRole


async def create_user(email: str, password: str):
    """Create a new user in the database"""
    security = SecurityManager()
    
    # Hash the password
    hashed_password = security.hash_password(password)
    
    # Check password strength
    is_strong, issues = security.check_password_strength(password)
    if not is_strong:
        print(f"Warning: Password strength issues: {', '.join(issues)}")
        print("User will still be created, but consider using a stronger password.")
    
    async with async_session() as session:
        try:
            # Check if user already exists
            check_result = await session.execute(
                text("SELECT id FROM users WHERE email = :email LIMIT 1"),
                {"email": email}
            )
            if check_result.first():
                print(f"Error: User with email {email} already exists!")
                return False
            
            # Create user
            user_id = uuid4()
            insert_sql = text("""
                INSERT INTO users (
                    id, email, hashed_password, role, is_active, is_verified,
                    two_factor_enabled, two_factor_secret, created_at, updated_at
                ) VALUES (
                    :id, :email, :hashed_password, :role, :is_active, :is_verified,
                    :two_factor_enabled, :two_factor_secret, NOW(), NOW()
                )
            """)
            
            params = {
                "id": user_id,
                "email": email,
                "hashed_password": hashed_password,
                "role": UserRole.USER.value,
                "is_active": True,
                "is_verified": True,  # Set to True for direct creation
                "two_factor_enabled": False,
                "two_factor_secret": None,
            }
            
            await session.execute(insert_sql, params)
            await session.commit()
            
            print(f"✓ User created successfully!")
            print(f"  Email: {email}")
            print(f"  User ID: {user_id}")
            print(f"  Role: {UserRole.USER.value}")
            print(f"  Status: Active and Verified")
            return True
            
        except Exception as e:
            await session.rollback()
            print(f"Error creating user: {e}")
            return False


async def main():
    if len(sys.argv) != 3:
        print("Usage: python scripts/create_user.py <email> <password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    
    success = await create_user(email, password)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())

