from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "StockMaster"
    DATABASE_URL: str = "postgresql://postgres:password@localhost/stockmaster" # Update with your credentials
    SECRET_KEY: str = "CHANGE_THIS_IN_PROD_SECRET_KEY_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
