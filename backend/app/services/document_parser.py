"""
Document parser extracting clean text and page segments from PDF, DOCX, and TXT files.
"""

import hashlib
import os
from typing import List, Dict, Any


def calculate_file_hash(file_bytes: bytes) -> str:
    """Compute SHA-256 hash of file content."""
    return hashlib.sha256(file_bytes).hexdigest()


def parse_pdf(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Extract page-by-page text from PDF bytes."""
    pages = []
    # Try pypdf
    try:
        import io
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        for page_num, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            if text.strip():
                pages.append({"page": page_num, "text": text.strip()})
        if pages:
            return pages
    except Exception:
        pass

    # Try pdfplumber
    try:
        import io
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text() or ""
                if text.strip():
                    pages.append({"page": page_num, "text": text.strip()})
        if pages:
            return pages
    except Exception:
        pass

    # Fallback to plain string extraction if bytes contain ASCII text
    try:
        decoded = file_bytes.decode("utf-8", errors="ignore")
        return [{"page": 1, "text": decoded}]
    except Exception:
        return [{"page": 1, "text": ""}]


def parse_docx(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Extract text from Word document."""
    try:
        import io
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs)
        return [{"page": 1, "text": full_text}]
    except Exception:
        decoded = file_bytes.decode("utf-8", errors="ignore")
        return [{"page": 1, "text": decoded}]


def parse_txt(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Extract plain text."""
    text = file_bytes.decode("utf-8", errors="replace")
    return [{"page": 1, "text": text}]


def parse_document(filename: str, file_bytes: bytes) -> List[Dict[str, Any]]:
    """Route document by extension and return list of {page, text}."""
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        return parse_pdf(file_bytes)
    elif ext in (".docx", ".doc"):
        return parse_docx(file_bytes)
    else:
        return parse_txt(file_bytes)
