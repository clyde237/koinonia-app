#!/usr/bin/env python3
"""Generate offline JSON Bible corpus files for Koinonia from fraLSG_vpl.txt."""

from pathlib import Path
import json

VPL_TO_ID = {
    'GEN': 'genese', 'EXO': 'exode', 'LEV': 'levitique', 'NUM': 'nombres', 'DEU': 'deuteronome',
    'JOS': 'josue', 'JDG': 'juges', 'RUT': 'ruth', '1SA': '1samuel', '2SA': '2samuel',
    '1KI': '1rois', '2KI': '2rois', '1CH': '1chroniques', '2CH': '2chroniques',
    'EZR': 'esdras', 'NEH': 'nehemie', 'EST': 'esther', 'JOB': 'job', 'PSA': 'psaumes',
    'PRO': 'proverbes', 'ECC': 'ecclesiaste', 'SOL': 'cantique', 'ISA': 'esaie', 'JER': 'jeremie',
    'LAM': 'lamentations', 'EZE': 'ezechiel', 'DAN': 'daniel', 'HOS': 'osee', 'JOE': 'joel',
    'AMO': 'amos', 'OBA': 'abdias', 'JON': 'jonas', 'MIC': 'michee', 'NAH': 'nahum',
    'HAB': 'habacuc', 'ZEP': 'sophonie', 'HAG': 'aggee', 'ZEC': 'zacharie', 'MAL': 'malachie',
    'MAT': 'matthieu', 'MAR': 'marc', 'LUK': 'luc', 'JOH': 'jean', 'ACT': 'actes',
    'ROM': 'romains', '1CO': '1corinthiens', '2CO': '2corinthiens', 'GAL': 'galates', 'EPH': 'ephesiens',
    'PHI': 'philippiens', 'COL': 'colossiens', '1TH': '1thessaloniciens', '2TH': '2thessaloniciens',
    '1TI': '1timothee', '2TI': '2timothee', 'TIT': 'tite', 'PHM': 'philemon', 'HEB': 'hebreux',
    'JAM': 'jacques', '1PE': '1pierre', '2PE': '2pierre', '1JO': '1jean', '2JO': '2jean',
    '3JO': '3jean', 'JUD': 'jude', 'REV': 'apocalypse'
}

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
ROOT_DIR = PROJECT_DIR.parent
SOURCE_TXT = ROOT_DIR / 'fraLSG_vpl/fraLSG_vpl.txt'
TARGET_DIR = PROJECT_DIR / 'data/bible-corpus'

def main():
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    books: dict[str, dict[str, list[dict]]] = {}
    
    with open(SOURCE_TXT, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(' ', 2)
            if len(parts) < 3:
                continue
            vpl_code, ref, text = parts[0], parts[1], parts[2]
            chap_str, verse_str = ref.split(':')
            book_id = VPL_TO_ID.get(vpl_code)
            if not book_id:
                raise ValueError(f"Unknown VPL code: {vpl_code}")
                
            if book_id not in books:
                books[book_id] = {}
                
            if chap_str not in books[book_id]:
                books[book_id][chap_str] = []
                
            books[book_id][chap_str].append({
                'number': int(verse_str),
                'text': text.strip()
            })
            
    print(f"Loaded {len(books)} books.")
    assert len(books) == 66
    
    total_written = 0
    total_verses = 0
    for book_id, chapters in books.items():
        out_file = TARGET_DIR / f"{book_id}.json"
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(chapters, f, ensure_ascii=False, separators=(',', ':'))
        total_written += 1
        for chap_verses in chapters.values():
            total_verses += len(chap_verses)
            
    print(f"Successfully generated {total_written} JSON files in {TARGET_DIR} ({total_verses} verses).")

if __name__ == '__main__':
    main()
