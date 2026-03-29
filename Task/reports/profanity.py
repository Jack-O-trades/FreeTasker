"""
Profanity detection utility for FreeTasker.
Scans text for swear/profanity words and returns findings.
"""

import re

# Curated English profanity list (extend as needed)
_PROFANITY_WORDS = {
    "fuck", "fucked", "fucking", "fucker", "fucks", "f*ck", "f**k",
    "shit", "shits", "shitting", "shitty", "sh1t", "s***",
    "ass", "asses", "asshole", "assholes", "a**hole",
    "bitch", "bitches", "bitching", "b1tch", "b****",
    "bastard", "bastards",
    "damn", "damned",
    "crap", "crappy",
    "dick", "dicks", "d1ck",
    "cock", "cocks",
    "pussy", "pussies",
    "cunt", "cunts", "c**t",
    "piss", "pissed",
    "whore", "whores",
    "slut", "sluts",
    "moron", "idiot", "stupid",
    "hell",
    "retard", "retarded",
    "wanker", "wankers",
    "bollocks",
    "twat", "twats",
    "arse",
    "nigger", "nigga",
    "faggot", "fag",
}


def scan_for_profanity(text: str) -> tuple[bool, list[str]]:
    """
    Scan text for profanity words.

    Args:
        text: The input string to scan.

    Returns:
        Tuple of (contains_profanity: bool, found_words: list[str])
    """
    if not text:
        return False, []

    text_lower = text.lower()
    found = []

    for word in _PROFANITY_WORDS:
        # Match whole word (with leet-speak awareness)
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text_lower):
            found.append(word)

    return bool(found), found


def censor_text(text: str, replacement: str = '***') -> str:
    """
    Replace profanity words in text with replacement string.
    Useful for display purposes.
    """
    if not text:
        return text

    result = text
    for word in _PROFANITY_WORDS:
        pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
        result = pattern.sub(replacement, result)

    return result
