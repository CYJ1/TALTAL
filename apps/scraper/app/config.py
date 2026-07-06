import os

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://roommate:roommate@localhost:5432/roommate"
)

SCRAPE_QUEUE = "scrape.requested"
CACHE_TTL_SECONDS = 300  # Redis Cache Layer 명세: TTL 5분 바이패스
BACKGROUND_REFRESH_INTERVAL_SECONDS = int(os.getenv("SCRAPE_INTERVAL_SECONDS", "60"))
