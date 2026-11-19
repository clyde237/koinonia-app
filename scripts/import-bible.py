"""Build the packaged SQLite Bible from the eBible.org VPL SQL export."""

import argparse
from collections import defaultdict
from pathlib import Path
import re
import sqlite3
from tempfile import TemporaryDirectory


PREFIX = "INSERT INTO fraLSG_vpl VALUES "
ROW = re.compile(
    r'\("(?P<id>[^"]+)","[\d_]+","(?P<book>[A-Z0-9]{3})",'
    r'"(?P<chapter>\d+)","(?P<start>\d+)","(?P<end>\d+)","(?P<text>[^"\\]*)"\);'
)
EXPECTED_TOTALS = (66, 1189, 31170)
APP = Path(__file__).resolve().parents[1]
OUTPUT = APP / "assets/bible/fraLSG.db"


def read_verses(source):
    verses = []
    seen_ids = set()
    chapters = defaultdict(dict)
    with source.open(encoding="utf-8-sig") as sql:
        for line_number, line in enumerate(sql, 1):
            if not line.startswith(PREFIX):
                continue
            row = ROW.fullmatch(line.removeprefix(PREFIX).rstrip("\n"))
            if row is None:
                raise ValueError(f"Ligne {line_number}: verset SQL illisible")

            verse_id, book, chapter, start, end, text = row.groups()
            chapter, number = int(chapter), int(start)
            text = text.strip()
            if verse_id in seen_ids or not text or start != end or chapter < 1 or number < 1:
                raise ValueError(f"Ligne {line_number}: verset invalide ({verse_id})")

            last_number = chapters[book].get(chapter, 0)
            if number != last_number + 1:
                raise ValueError(f"Ligne {line_number}: verset manquant ou mal ordonné ({verse_id})")
            chapters[book][chapter] = number
            seen_ids.add(verse_id)
            verses.append((book, chapter, number, text))

    for book, book_chapters in chapters.items():
        if list(book_chapters) != list(range(1, len(book_chapters) + 1)):
            raise ValueError(f"Chapitres incomplets ou mal ordonnés pour {book}")

    totals = len(chapters), sum(map(len, chapters.values())), len(verses)
    if totals != EXPECTED_TOTALS:
        raise ValueError(f"Corpus incomplet: attendu {EXPECTED_TOTALS}, reçu {totals}")
    return verses


def build_database(source, output):
    verses = read_verses(source)
    output.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(dir=output.parent) as temp:
        database = Path(temp) / output.name
        with sqlite3.connect(database) as db:
            db.executescript("""
                PRAGMA user_version = 1;
                CREATE TABLE verses (
                    id INTEGER PRIMARY KEY,
                    book TEXT NOT NULL,
                    chapter INTEGER NOT NULL,
                    number INTEGER NOT NULL,
                    text TEXT NOT NULL,
                    UNIQUE (book, chapter, number)
                );
                CREATE VIRTUAL TABLE verse_search USING fts5(
                    text, content='', detail=none, columnsize=0,
                    tokenize='unicode61 remove_diacritics 2'
                );
            """)
            db.executemany("INSERT INTO verses (book, chapter, number, text) VALUES (?, ?, ?, ?)", verses)
            db.execute("""
                INSERT INTO verse_search (rowid, text)
                SELECT id, replace(replace(text, 'œ', 'oe'), 'Œ', 'OE') FROM verses
            """)
            db.execute("INSERT INTO verse_search(verse_search) VALUES ('optimize')")
            if db.execute("PRAGMA integrity_check").fetchone() != ("ok",):
                raise ValueError("La base SQLite générée est invalide")
        db.close()
        database.replace(output)
    print(f"{output} · {len(verses)} versets Louis Segond 1910")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Chemin du fichier fraLSG_vpl.sql")
    args = parser.parse_args()
    build_database(args.source, OUTPUT)
