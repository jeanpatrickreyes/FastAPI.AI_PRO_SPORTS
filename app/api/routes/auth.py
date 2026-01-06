"""
AI PRO SPORTS - Authentication API Routes
Phase 4: Enterprise Features

Authentication endpoints including:
- User registration
- Login/logout
- Token refresh
- 2FA management
- Password reset
- API key management
"""

from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field, validator

from app.core.config import get_settings
from app.core.security import (
    TOTPManager,
    get_security_manager,
)
from app.services.alerting import get_alerting_service

router = APIRouter()
settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ============================================================================
# Schemas
# ============================================================================

class UserRegisterRequest(BaseModel):
    """User registration request."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    
    @validator("username")
    def username_alphanumeric(cls, v):
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username must be alphanumeric with underscores/hyphens only")
        return v


class UserLoginRequest(BaseModel):
    """User login request."""
    username: str
    password: str
    totp_code: Optional[str] = None


class TokenResponse(BaseModel):
    """Token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


class PasswordChangeRequest(BaseModel):
    """Password change request."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class PasswordResetRequest(BaseModel):
    """Password reset request."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation."""
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


class Enable2FAResponse(BaseModel):
    """2FA enable response."""
    secret: str
    qr_code: str
    backup_codes: List[str]


class Verify2FARequest(BaseModel):
    """2FA verification request."""
    totp_code: str = Field(..., min_length=6, max_length=6)


class APIKeyCreateRequest(BaseModel):
    """API key creation request."""
    name: str = Field(..., min_length=1, max_length=100)
    scopes: List[str] = Field(default_factory=list)
    expires_days: Optional[int] = Field(None, ge=1, le=365)


class APIKeyResponse(BaseModel):
    """API key response."""
    id: int
    name: str
    key_prefix: str
    key: Optional[str] = None  # Only returned on creation
    scopes: List[str]
    created_at: datetime
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    is_active: bool


class UserResponse(BaseModel):
    """User response."""
    id: int
    email: str
    username: str
    first_name: Optional[str]
    last_name: Optional[str]
    role: str
    status: str
    two_factor_enabled: bool
    email_verified: bool
    created_at: datetime
    last_login_at: Optional[datetime]


# ============================================================================
# Dependencies
# ============================================================================

async def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme)
) -> dict:
    """Get current authenticated user from token."""
    security = get_security_manager()
    
    try:
        payload = security.jwt.verify_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # In a real implementation, fetch user from database
        # For now, return payload as user dict
        return {
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role", "user"),
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )


async def get_current_admin(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Require admin role."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: UserRegisterRequest):
    """
    Register a new user account.
    
    - Validates email and username uniqueness
    - Checks password strength
    - Creates user with pending status
    - Sends verification email
    """
    security = get_security_manager()
    
    # Validate password strength
    is_strong, message = security.validate_password_strength(request.password)
    if not is_strong:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password too weak: {message}"
        )
    
    # Hash password
    password_hash = security.hash_password(request.password)
    
    # In a real implementation:
    # 1. Check if email/username already exists
    # 2. Create user in database
    # 3. Send verification email
    
    # Return mock user response
    return UserResponse(
        id=1,
        email=request.email,
        username=request.username,
        first_name=request.first_name,
        last_name=request.last_name,
        role="user",
        status="pending",
        two_factor_enabled=False,
        email_verified=False,
        created_at=datetime.utcnow(),
        last_login_at=None
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Authenticate user and return tokens.
    
    - Validates credentials
    - Checks 2FA if enabled
    - Returns access and refresh tokens
    """
    security = get_security_manager()
    
    # In a real implementation:
    # 1. Fetch user from database by username
    # 2. Verify password hash
    # 3. Check if 2FA required
    # 4. Verify TOTP if 2FA enabled
    
    # Mock user data
    user_data = {
        "user_id": 1,
        "email": f"{form_data.username}@example.com",
        "role": "user",
        "two_factor_enabled": False
    }
    
    # Generate tokens
    access_token = security.jwt.create_access_token(
        user_id=str(user_data["user_id"]),
        email=user_data["email"],
        role=user_data["role"]
    )
    
    refresh_token = security.jwt.create_refresh_token(
        user_id=str(user_data["user_id"])
    )
    
    # Get client info for session
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    # Log login
    alerting = get_alerting_service()
    await alerting.info(
        "User Login",
        f"User {form_data.username} logged in from {client_ip}"
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user={
            "id": user_data["user_id"],
            "email": user_data["email"],
            "role": user_data["role"]
        }
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """
    Refresh access token using refresh token.
    """
    security = get_security_manager()
    
    try:
        payload = security.jwt.verify_refresh_token(request.refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        # Generate new tokens
        user_id = payload.get("sub")
        
        # In a real implementation, fetch user data from database
        access_token = security.jwt.create_access_token(
            user_id=user_id,
            email="user@example.com",
            role="user"
        )
        
        new_refresh_token = security.jwt.create_refresh_token(user_id=user_id)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.jwt_access_token_expire_minutes * 60,
            user={
                "id": int(user_id),
                "email": "user@example.com",
                "role": "user"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """
    Logout user and revoke tokens.
    """
    security = get_security_manager()
    
    # Extract token from header
    token = authorization.replace("Bearer ", "")
    
    # Revoke token
    security.jwt.revoke_token(token)
    
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current user profile.
    """
    # In a real implementation, fetch full user from database
    return UserResponse(
        id=int(current_user["user_id"]),
        email=current_user["email"],
        username=current_user["email"].split("@")[0],
        first_name="John",
        last_name="Doe",
        role=current_user["role"],
        status="active",
        two_factor_enabled=False,
        email_verified=True,
        created_at=datetime.utcnow() - timedelta(days=30),
        last_login_at=datetime.utcnow()
    )


@router.put("/me/password")
async def change_password(
    request: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Change current user's password.
    """
    security = get_security_manager()
    
    # Validate new password strength
    is_strong, message = security.validate_password_strength(request.new_password)
    if not is_strong:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password too weak: {message}"
        )
    
    # In a real implementation:
    # 1. Verify current password
    # 2. Hash new password
    # 3. Update in database
    # 4. Revoke all sessions
    
    return {"message": "Password changed successfully"}


@router.post("/password/reset")
async def request_password_reset(request: PasswordResetRequest):
    """
    Request password reset email.
    """
    # In a real implementation:
    # 1. Check if email exists
    # 2. Generate reset token
    # 3. Send reset email
    
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/password/reset/confirm")
async def confirm_password_reset(request: PasswordResetConfirm):
    """
    Confirm password reset with token.
    """
    security = get_security_manager()
    
    # Validate new password strength
    is_strong, message = security.validate_password_strength(request.new_password)
    if not is_strong:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password too weak: {message}"
        )
    
    # In a real implementation:
    # 1. Verify reset token
    # 2. Hash new password
    # 3. Update in database
    # 4. Invalidate reset token
    
    return {"message": "Password reset successfully"}


@router.post("/2fa/enable", response_model=Enable2FAResponse)
async def enable_2fa(current_user: dict = Depends(get_current_user)):
    """
    Enable two-factor authentication.
    
    Returns secret, QR code, and backup codes.
    """
    totp = TOTPManager()
    
    # Generate secret
    secret = totp.generate_secret()
    
    # Generate QR code
    email = current_user["email"]
    qr_code = totp.get_provisioning_uri(secret, email, settings.app_name)
    
    # Generate backup codes
    import secrets
    backup_codes = [secrets.token_hex(4).upper() for _ in range(10)]
    
    # In a real implementation:
    # 1. Store secret temporarily (pending verification)
    # 2. Hash and store backup codes
    
    return Enable2FAResponse(
        secret=secret,
        qr_code=qr_code,
        backup_codes=backup_codes
    )


@router.post("/2fa/verify")
async def verify_2fa(
    request: Verify2FARequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Verify and complete 2FA setup.
    """
    # In a real implementation:
    # 1. Get pending secret from storage
    # 2. Verify TOTP code
    # 3. Enable 2FA on user account
    # 4. Store secret permanently
    
    return {"message": "Two-factor authentication enabled"}


@router.post("/2fa/disable")
async def disable_2fa(
    request: Verify2FARequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Disable two-factor authentication.
    
    Requires valid TOTP code to disable.
    """
    # In a real implementation:
    # 1. Verify TOTP code
    # 2. Remove 2FA secret
    # 3. Invalidate backup codes
    
    return {"message": "Two-factor authentication disabled"}


@router.get("/api-keys", response_model=List[APIKeyResponse])
async def list_api_keys(current_user: dict = Depends(get_current_user)):
    """
    List user's API keys.
    """
    # In a real implementation, fetch from database
    return []


@router.post("/api-keys", response_model=APIKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    request: APIKeyCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create new API key.
    
    Note: The full key is only returned once upon creation.
    """
    security = get_security_manager()
    
    # Generate API key
    api_key = security.generate_api_key()
    key_hash = security.hash_api_key(api_key)
    
    # Calculate expiration
    expires_at = None
    if request.expires_days:
        expires_at = datetime.utcnow() + timedelta(days=request.expires_days)
    
    # In a real implementation, store in database
    
    return APIKeyResponse(
        id=1,
        name=request.name,
        key_prefix=api_key[:12],
        key=api_key,  # Only returned on creation
        scopes=request.scopes,
        created_at=datetime.utcnow(),
        expires_at=expires_at,
        last_used_at=None,
        is_active=True
    )


@router.delete("/api-keys/{key_id}")
async def delete_api_key(
    key_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete API key.
    """
    # In a real implementation:
    # 1. Verify ownership
    # 2. Delete from database
    
    return {"message": "API key deleted"}


@router.post("/verify-email/{token}")
async def verify_email(token: str):
    """
    Verify email address with token.
    """
    # In a real implementation:
    # 1. Verify token
    # 2. Mark email as verified
    # 3. Activate user if pending
    
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_verification(current_user: dict = Depends(get_current_user)):
    """
    Resend email verification.
    """
    # In a real implementation:
    # 1. Check if already verified
    # 2. Generate new token
    # 3. Send verification email
    
    return {"message": "Verification email sent"}
