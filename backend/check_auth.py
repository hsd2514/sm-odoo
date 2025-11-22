from sqlmodel import Session, select
from app.core.database import engine
from app.models.user import User
from app.core.security import get_password_hash, verify_password

def check_auth():
    print("Checking Auth Logic...")
    pwd = "password123"
    hashed = get_password_hash(pwd)
    print(f"Password: {pwd}")
    print(f"Hashed: {hashed}")
    is_valid = verify_password(pwd, hashed)
    print(f"Verification: {is_valid}")
    
    if not is_valid:
        print("CRITICAL: Password verification failed locally!")
        return

    print("\nChecking Database Users...")
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        for u in users:
            print(f"User: {u.email}, Role: {u.role}, Hash: {u.password_hash[:10]}...")
            if u.email.startswith("demo"):
                print(f"  Verifying 'password123' for {u.email}...")
                if verify_password("password123", u.password_hash):
                    print("  -> MATCH!")
                else:
                    print("  -> FAIL!")

if __name__ == "__main__":
    check_auth()
