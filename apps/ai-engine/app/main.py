from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.neo4j_client import close_driver, get_driver, verify_connectivity
from app.recommend import recommend_for_user
from app.schemas import HealthResponse, RecommendationResponse
from app.seed import seed as seed_graph


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_driver()


app = FastAPI(title="RoomMate AI Recommendation Engine", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    connected = await verify_connectivity()
    return HealthResponse(status="ok" if connected else "degraded", neo4j_connected=connected)


@app.post("/internal/seed")
async def trigger_seed() -> dict:
    await seed_graph()
    return {"status": "seeded"}


@app.get("/recommendations/{user_id}", response_model=RecommendationResponse)
async def get_recommendations(user_id: str) -> RecommendationResponse:
    driver = await get_driver()
    async with driver.session() as session:
        peer_count_record = await (
            await session.run(
                "MATCH (u:User)-[:CLEARED]->(:Theme) RETURN count(DISTINCT u) AS n"
            )
        ).single()
        peer_sample_size = peer_count_record["n"] if peer_count_record else 0

    items = await recommend_for_user(driver, user_id)
    if not items:
        raise HTTPException(status_code=404, detail=f"No graph data for user_id={user_id}")

    return RecommendationResponse(
        user_id=user_id, peer_sample_size=peer_sample_size, items=items
    )
