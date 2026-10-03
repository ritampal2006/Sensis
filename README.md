# CodeMix India 55k (V3)

A high-entropy,A high-diversity synthetic Hinglish dataset designed for benchmarking, sentiment analysis, robustness evaluation, and representation learning, designed for research in code-mixed NLP. 

This dataset contains 55,000 synthetic, highly diverse code-mixed sentences designed for robustness evaluation, sentiment analysis, and representation learning. It has been rigorously audited and optimized to meet the standards of top-tier NLP venues (ACL, EMNLP, NeurIPS).

## Features
- **Total Rows**: 55,000
- **Primary Languages**: Hindi-English (Code-Mixed)
- **Label Types**: Sentiment, Intent, Emotion, Domain
- **Diversity Metrics**: Shannon Entropy (5.48), Type-Token Ratio (0.0028)
- **Advanced Structures**: Includes multi-turn conversations, long-context narratives, and adversarial sarcasm.

## Documentation
Please refer to the detailed documentation for comprehensive information:
- [Dataset Card](DATASET_CARD.md): Complete Hugging Face style dataset overview.
- [Data Dictionary](DATA_DICTIONARY.md): Column definitions and feature engineering formulas.
- [Methodology](METHODOLOGY.md): Details on the Probabilistic Context-Free Grammar (PCFG) generative pipeline.
- [Validation](VALIDATION.md): Objective diversity metrics and leakage validation.
- [Changelog](CHANGELOG.md): Version history.

## Quickstart

```python
import pandas as pd

# Load the dataset
df = pd.read_csv("codemix_india_55k_cleaned_v3.csv")

# View class balance
print(df['sentiment_label'].value_counts())

# View Code-Mixing Realism
print(df[df['code_mixing_index'] > 0].shape[0] / len(df))
```

## Citation
Please see `CITATION.cff` for citation instructions.

## License
Licensed under CC BY 4.0. See `LICENSE` for details.
