"""Sensis engine: finds communication gaps in multi-party chat transcripts.

Every turn gets a dialogue-act label (question, answer, ...) and a sentiment
score. A small state machine then walks the labelled turns looking for
friction: confusion loops, ignored questions and sour tone.

Started life as a Colab notebook.
"""

import re
from functools import lru_cache

try:
    import pandas as pd
except ImportError:
    pd = None

INTENT_TO_CATEGORY = {
    "question asking for information or help": "Question",
    "direct answer or explanation": "Answer",
    "request for clarification or repetition": "Clarification Request",
    "brief acknowledgment or agreement": "Acknowledgment",
    "informative statement or comment": "Statement",
}
TARGET_INTENTS = list(INTENT_TO_CATEGORY)

# Older names, still used elsewhere in the project.
CATEGORY_MAPPING = INTENT_TO_CATEGORY
INTENT_LABELS = TARGET_INTENTS
LABEL_MAP = CATEGORY_MAPPING

LOOP_THRESHOLD = 2         # clarification requests in a row before we call it a loop
IGNORED_AFTER = 3          # turns a question can sit unanswered
FRUSTRATION_CUTOFF = -0.40

# Keyword rules used when the BART model isn't installed.
CLARIFY_RE = re.compile(r"\b(what do you mean|could you repeat|repeat that|clarify|what is|what package)")
QUESTION_START_RE = re.compile(r"^(can|is|how|what|could|why|help me)\b")
ACK_RE = re.compile(r"\b(thanks|ok|okay|got it|understood|noted|same here)\b")
ANSWER_RE = re.compile(r"\b(check|run|here is|configured|resolved|set to)\b")
NEGATIVE_RE = re.compile(r"\b(frustrat\w*|spamming|blocked|error|fail\w*|broken)\b")
POSITIVE_RE = re.compile(r"\b(thanks|resolved|great|perfect|good)\b")


def _default_speaker(index):
    return "User_A" if index % 2 == 0 else "User_B"


def split_dialogue_turns(raw_text):
    """Turn a raw transcript into a list of {turn_id, speaker, text} dicts.

    Two formats are understood: Ubuntu-corpus text with __eot__ between turns,
    and plain lines, optionally written as "Speaker: message".
    """
    utterances = []  # (speaker or None, text)

    if "__eot__" in raw_text:
        for chunk in raw_text.split("__eot__"):
            text = chunk.replace("__eou__", "").strip()
            if text:
                utterances.append((None, text))
    else:
        for line in raw_text.strip().splitlines():
            line = line.strip()
            if not line:
                continue
            speaker, colon, rest = line.partition(":")
            if colon:
                utterances.append((speaker.strip(), rest.strip()))
            else:
                utterances.append((None, line))

    return [
        {
            "turn_id": number,
            "speaker": speaker or _default_speaker(number - 1),
            "text": text,
        }
        for number, (speaker, text) in enumerate(utterances, start=1)
    ]


parse_ubuntu_dialogue = split_dialogue_turns


@lru_cache(maxsize=1)
def get_analyzers():
    """Load the zero-shot intent model and VADER, returning None for any that fail.

    Cached because loading BART takes a while and this gets called per request.
    """
    try:
        import torch
        from transformers import pipeline

        intent_tagger = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli",
            device=0 if torch.cuda.is_available() else -1,
        )
    except Exception:
        intent_tagger = None

    try:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
        vader = SentimentIntensityAnalyzer()
    except Exception:
        vader = None

    return intent_tagger, vader


def _guess_intent(text):
    lower = text.lower()
    if CLARIFY_RE.search(lower):
        return "Clarification Request"
    if "?" in text or QUESTION_START_RE.match(lower):
        return "Question"
    if ACK_RE.search(lower):
        return "Acknowledgment"
    if ANSWER_RE.search(lower):
        return "Answer"
    return "Statement"


def _guess_sentiment(text):
    lower = text.lower()
    if NEGATIVE_RE.search(lower):
        return -0.65
    if POSITIVE_RE.search(lower):
        return 0.65
    return 0.0


def _label_turn(text, intent_tagger, vader):
    if intent_tagger:
        result = intent_tagger(
            text,
            candidate_labels=TARGET_INTENTS,
            hypothesis_template="This utterance functions as a {}.",
        )
        intent = INTENT_TO_CATEGORY.get(result["labels"][0], "Statement")
    else:
        intent = _guess_intent(text)

    if vader:
        tone = vader.polarity_scores(text)["compound"]
    else:
        tone = _guess_sentiment(text)

    return intent, tone


def _scan_for_gaps(turns):
    gaps = []
    open_questions = []
    clarify_streak = []

    for turn in turns:
        turn_id = turn["turn_id"]
        speaker = turn["speaker"]
        text = turn["text"]
        intent = turn["intent"]
        tone = turn["compound_sentiment"]

        # Back-to-back requests for clarification
        if intent == "Clarification Request":
            clarify_streak.append(turn)
            if len(clarify_streak) >= LOOP_THRESHOLD:
                ids = [t["turn_id"] for t in clarify_streak]
                gaps.append({
                    "gap_type": "Confusion Loop (Repeated Clarification)",
                    "at_turn": turn_id,
                    "trigger_speaker": speaker,
                    "evidence_text": text,
                    "tone_score": tone,
                    "details": f"Consecutive clarification requests without resolution across turns {ids}",
                })
        else:
            clarify_streak.clear()

        # Questions that nobody picks up
        if intent == "Question":
            open_questions.append(turn)
        elif intent == "Answer" and open_questions:
            open_questions.pop(0)

        still_waiting = []
        for question in open_questions:
            lag = turn_id - question["turn_id"]
            if lag >= IGNORED_AFTER:
                gaps.append({
                    "gap_type": "Unanswered Question / Ignored Response",
                    "at_turn": question["turn_id"],
                    "trigger_speaker": question["speaker"],
                    "evidence_text": question["text"],
                    "following_turn_text": f"Ignored for {lag} turns. Dialogue continued without answer: '{text}'",
                })
            else:
                still_waiting.append(question)
        open_questions = still_waiting

        # Tone
        if tone <= FRUSTRATION_CUTOFF:
            gaps.append({
                "gap_type": "Frustration / Negative Tone Shift",
                "at_turn": turn_id,
                "trigger_speaker": speaker,
                "evidence_text": text,
                "tone_score": tone,
            })

    for question in open_questions:
        gaps.append({
            "gap_type": "Unresolved Question at Close",
            "at_turn": question["turn_id"],
            "trigger_speaker": question["speaker"],
            "evidence_text": question["text"],
            "following_turn_text": "Conversation terminated without an answer.",
        })

    return gaps


def find_communication_gaps(chat_turns, intent_tagger=None, vader_analyzer=None):
    """Label each turn, then look for friction. Returns (labelled_turns, gaps)."""
    if intent_tagger is None or vader_analyzer is None:
        default_tagger, default_vader = get_analyzers()
        intent_tagger = intent_tagger or default_tagger
        vader_analyzer = vader_analyzer or default_vader

    labelled = []
    for msg in chat_turns:
        intent, tone = _label_turn(msg["text"], intent_tagger, vader_analyzer)
        labelled.append({
            "turn_id": msg["turn_id"],
            "speaker": msg["speaker"],
            "text": msg["text"],
            "intent": intent,
            "compound_sentiment": tone,
        })

    return labelled, _scan_for_gaps(labelled)


analyze_communication_gaps = find_communication_gaps


if __name__ == "__main__":
    sample = """User_A: Hi, is anyone here familiar with the Ubuntu 22.04 LTS package repository issues?
User_B: Yes, what seems to be the exact problem?
User_A: What repository are you using again?
User_B: Could you repeat that? I asked what problem you are facing.
User_A: What package were we discussing?
User_B: This is getting frustrating, please describe your issue clearly so I can help!
User_A: Okay, apt-get update is throwing 404 on security repositories.
User_B: Check your /etc/apt/sources.list file and verify the distribution codename."""

    turns, gaps = find_communication_gaps(split_dialogue_turns(sample))

    print("\n--- Transcript ---")
    if pd:
        columns = ["turn_id", "speaker", "intent", "compound_sentiment", "text"]
        print(pd.DataFrame(turns)[columns])
    else:
        for t in turns:
            print(f"Turn {t['turn_id']} [{t['speaker']}] ({t['intent']}, "
                  f"sentiment {t['compound_sentiment']}): {t['text']}")

    print("\n--- Gaps ---")
    if not gaps:
        print("No notable gaps found.\n")
    for gap in gaps:
        print(f"* {gap['gap_type']}")
        print(f"  Turn {gap['at_turn']} ({gap['trigger_speaker']}): \"{gap['evidence_text']}\"")
        if "following_turn_text" in gap:
            print(f"  Context: {gap['following_turn_text']}")
        if "tone_score" in gap:
            print(f"  Tone score: {gap['tone_score']}")
        print()