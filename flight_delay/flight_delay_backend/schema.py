from pydantic import BaseModel, Field
from typing import Optional


class FlightRequest(BaseModel):
    origin: str
    dest: str
    carrier: str
    distance: float
    fl_date: str
    crs_dep_hour: int
    crs_arr_hour: int
    temp: Optional[float] = None
    rhum: Optional[float] = None
    prcp: Optional[float] = None
    wspd: Optional[float] = None
    pres: Optional[float] = None
    coco: Optional[int] = None
