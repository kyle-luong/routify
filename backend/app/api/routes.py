from fastapi import APIRouter

router = APIRouter()

@router.post("/upload")
def upload_ics:
    # TODO

@router.get("/view/{short_id}")
def get_events:
    # TODO