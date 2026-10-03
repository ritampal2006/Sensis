# Sensis — Conversation Gap & Friction Analyzer

Sensis is a conversation analysis tool that looks at multi-turn dialogues and finds places where the conversation starts to break down.

It focuses on three things:

- Unanswered questions
- Repeated clarification loops
- Changes in tone or frustration

The idea is simple: instead of only looking at individual messages, Sensis looks at how messages connect with each other across a conversation.

## Live Demo

**Try Sensis:**  
https://sensis-weld.vercel.app/

---

## What Sensis Does

Sensis takes a conversation transcript and analyzes it turn by turn.

For each message, it tries to identify:

- **Dialogue intent** — Question, Statement, Answer, Clarification Request, Acknowledgment
- **Conversation state** — whether a question was actually addressed
- **Tone** — positive, neutral, or negative shifts
- **Friction points** — places where the conversation becomes unclear or repetitive

The final result is shown as a conversation trace so that a user can see exactly where a problem was detected.

---

## System Architecture

```text
                 ┌─────────────────────────┐
                 │      User / Analyst     │
                 │                         │
                 │  Paste Conversation     │
                 │  Select Preset / Logs   │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │     Transcript Parser   │
                 │                         │
                 │ Speaker: Message        │
                 │ Turn Separation         │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │     Intent Tagger       │
                 │                         │
                 │ Question                │
                 │ Statement               │
                 │ Answer                  │
                 │ Clarification Request   │
                 │ Acknowledgment          │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │   Conversation State    │
                 │        Machine          │
                 │                         │
                 │ Track pending questions │
                 │ Match answers to context│
                 │ Detect repeated loops   │
                 └────────────┬────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          ┌─────────────────┐    ┌─────────────────┐
          │ Tone / Sentiment │   │ Friction Rules  │
          │     Analysis     │   │                 │
          │                  │   │ Unanswered Q    │
          │ VADER / Affective│   │ Confusion Loop  │
          │ Model            │   │ Context Break   │
          └────────┬────────┘    └────────┬────────┘
                   │                      │
                   └──────────┬────────── ┘
                              ▼
                 ┌─────────────────────────┐
                 │    Diagnostic Engine    │
                 │                         │
                 │ Combine intent, state,  │
                 │ tone and rule signals   │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │       Sensis UI         │
                 │                         │
                 │ • Diagnostic Summary    │
                 │ • Friction Markers      │
                 │ • Conversation Flow     │
                 │ • Turn-by-Turn Trace    │
                 │ • Audit Logs            │
                 └─────────────────────────┘

└── README.md
