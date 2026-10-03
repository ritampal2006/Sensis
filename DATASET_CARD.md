# Dataset Card for CodeMix India 55k

## Dataset Description

- **Homepage:** N/A
- **Repository:** N/A
- **Paper:** N/A
- **Leaderboard:** N/A
- **Point of Contact:** CodeMix India Research Team

### Dataset Summary

CodeMix India 55k (V3) is a synthetically generated, high-entropy dataset of 55,000 code-mixed (Hinglish) sentences. It was engineered using a Probabilistic Context-Free Grammar (PCFG) to simulate natural social media discourse. The dataset exhibits extreme lexical diversity, adversarial sarcasm, morphological code-mixing, and realistic spelling variations. It is designed for evaluating models on sentiment analysis, intent classification, and code-mixed representation learning.

### Supported Tasks and Leaderboards

- `text-classification`: The dataset can be used to train and evaluate models for sentiment analysis (Positive, Negative, Neutral) and intent classification in highly informal code-mixed contexts.
- `robustness-evaluation`: Models can be tested against the adversarial/sarcastic subset to determine if they rely on simple lexical cues (e.g., "amazing") rather than true contextual intent.

### Languages

The primary language is Hinglish (Hindi and English code-mixed). Regional loanwords from South, East, and West India are also stochastically injected.

## Dataset Structure

### Data Instances

A typical instance consists of a text string and associated metadata:
```json
{
  "text": "wah kia badhiya phone h, pura system crash ho gaya. Genius log.",
  "domain": "product_review",
  "sentiment_label": "Negative",
  "code_mixing_index": 28.5
}
```

### Data Fields

Please refer to `DATA_DICTIONARY.md` for a comprehensive breakdown of all 20 data fields.

## Dataset Creation

### Curation Rationale

The dataset was constructed to address the scarcity of high-quality, diverse code-mixed datasets for ML benchmarking. Natural datasets often suffer from severe class imbalance and privacy concerns. This dataset utilizes rigorous synthesis to ensure perfect label alignment while mathematically maintaining high entropy.

### Source Data

**Synthetic Generation:** The text was generated entirely via a deterministic Python PCFG engine. 
**Initial State (V1):** Linear templating (discarded due to n-gram leakage).
**Final State (V3):** Syntactic shattering with 1,000+ combinatorial paths and morphological blending.

### Annotations

Annotations are intrinsically tied to the generation process (perfect ground truth). 

## Considerations for Using the Data

### Social Impact of Dataset

This dataset helps improve the performance of NLP models for the next billion users in India, who communicate primarily in code-mixed vernaculars rather than pure English or Hindi.

### Limitations (Transparency)

- **Synthetic Nature**: Despite achieving a Shannon Entropy of 5.48, the dataset is constrained by its foundational PCFG vocabulary. It lacks long-tail semantic relationships found in organic web scrapes.
- **Conversational Depth**: Dialogues are single-turn (A -> B) and do not support deep Dialog State Tracking (DST).

## Additional Information

### Licensing Information

Creative Commons Attribution 4.0 International (CC BY 4.0)

### Citation Information

Please see `CITATION.cff`
