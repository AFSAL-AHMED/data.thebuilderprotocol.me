import os
from typing import Optional

ALLOWED_FILE_FORMATS = {
    "CSV", "JSON", "GEOJSON", "TXT", "XML", "PARQUET", "XLSX", "TSV", "ZIP", "HDF5"
}

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 * 1024  # 5 GB


def validate_file_formats(formats: list) -> list:
    """Normalize and validate file format strings."""
    validated = []
    for fmt in formats:
        normalized = fmt.strip().upper()
        if normalized in ALLOWED_FILE_FORMATS:
            validated.append(normalized)
        else:
            validated.append(fmt.strip())
    return validated


def validate_url(url: str) -> bool:
    """Basic URL validation."""
    if not url:
        return False
    return url.startswith("http://") or url.startswith("https://")


def get_file_size_label(size_bytes: Optional[int]) -> str:
    """Return human-readable file size."""
    if size_bytes is None:
        return "Unknown"
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 ** 2:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 ** 3:
        return f"{size_bytes / (1024 ** 2):.1f} MB"
    else:
        return f"{size_bytes / (1024 ** 3):.1f} GB"
