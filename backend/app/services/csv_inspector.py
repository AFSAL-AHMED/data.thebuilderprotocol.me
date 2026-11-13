import io
import uuid
from typing import Optional
import aiohttp
import pandas as pd
from app.config import settings


async def inspect_csv_from_url(url: str) -> Optional[dict]:
    """
    Fetch a CSV from a URL (up to MAX_CSV_INSPECT_SIZE_MB MB) and analyse it.
    Returns a quality report dict or None on failure.
    """
    max_bytes = settings.MAX_CSV_INSPECT_SIZE_MB * 1024 * 1024
    try:
        timeout = aiohttp.ClientTimeout(total=60)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(url) as response:
                if response.status != 200:
                    return None
                content_length = response.headers.get("Content-Length")
                if content_length and int(content_length) > max_bytes:
                    return None
                data = await response.read()
                if len(data) > max_bytes:
                    return None

        df = pd.read_csv(io.BytesIO(data))
        file_size_bytes = len(data)
        row_count = len(df)
        column_count = len(df.columns)
        duplicate_rows = int(df.duplicated().sum())

        columns = []
        stats = {}
        for col in df.columns:
            series = df[col]
            missing = int(series.isna().sum())
            unique = int(series.nunique())
            dtype_name = str(series.dtype)

            if "int" in dtype_name or "float" in dtype_name:
                dtype_label = "numeric"
                col_stats = {
                    "min": float(series.min()) if not series.isna().all() else None,
                    "max": float(series.max()) if not series.isna().all() else None,
                    "mean": float(series.mean()) if not series.isna().all() else None,
                }
            else:
                dtype_label = "string"
                col_stats = {"min": None, "max": None, "mean": None}

            columns.append({"name": col, "dtype": dtype_label, "missing": missing, "unique": unique})
            stats[col] = col_stats

        return {
            "row_count": row_count,
            "column_count": column_count,
            "columns": columns,
            "duplicate_rows": duplicate_rows,
            "file_size_bytes": file_size_bytes,
            "stats": stats,
            "source": "auto_calculated",
        }
    except Exception:
        return None
