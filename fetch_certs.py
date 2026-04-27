#!/usr/bin/env python3
"""
Credly'den sertifikaları çekip assets/data/certs.json dosyasına yazar.
Kullanım: python fetch_certs.py
"""

import json
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("requests kütüphanesi gerekli: pip install requests")

CREDLY_URL  = "https://www.credly.com/users/ceyda-duzgec.02/badges.json"
OUTPUT_PATH = Path(__file__).parent / "assets" / "data" / "certs.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "application/json",
}


def fetch_certs() -> list[dict]:
    resp = requests.get(CREDLY_URL, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    badges = [
        b for b in (data.get("data") or [])
        if b.get("public") and b.get("state") == "accepted"
    ]

    certs = []
    for b in badges:
        template        = b.get("badge_template") or {}
        issuer_entities = ((b.get("issuer") or {}).get("entities") or [])
        issuer          = issuer_entities[0]["entity"]["name"] if issuer_entities else ""

        certs.append({
            "name":      template.get("name", ""),
            "issuer":    issuer,
            "image_url": b.get("image_url") or template.get("image_url", ""),
            "badge_url": template.get("url") or "https://www.credly.com/users/ceyda-duzgec.02/badges",
            "issued_at": b.get("issued_at_date", ""),
        })

    return certs


def main():
    print("Credly'den sertifikalar çekiliyor…")
    try:
        certs = fetch_certs()
    except requests.RequestException as e:
        sys.exit(f"Hata: {e}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(certs, indent=2, ensure_ascii=False))
    print(f"✓ {len(certs)} sertifika kaydedildi → {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
