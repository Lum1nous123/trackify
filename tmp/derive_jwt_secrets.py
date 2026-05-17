import hashlib
import base64

access = b"dev-access-secret-change-me-dev-access-secret-change-me"
refresh = b"dev-refresh-secret-change-me-dev-refresh-secret-change-me"

def b64url_no_padding(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

a = hashlib.sha256(access).digest()
r = hashlib.sha256(refresh).digest()

print("TRACKIFY_JWT_ACCESS_SECRET_DERIVED_B64URL=" + b64url_no_padding(a))
print("TRACKIFY_JWT_REFRESH_SECRET_DERIVED_B64URL=" + b64url_no_padding(r))
