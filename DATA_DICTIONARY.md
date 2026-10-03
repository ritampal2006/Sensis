# Data Dictionary

This document defines the schema and engineering logic for all 20 columns in the `codemix_india_55k_cleaned_v3.csv` dataset.

| Column Name | Data Type | Description | Valid Values |
|-------------|-----------|-------------|--------------|
| `id` | Integer | Unique identifier for the row. | `1` to `55000` |
| `text` | String | The generated code-mixed text string. | Any string. |
| `source_platform` | String | Simulated origin platform for context. | `Twitter`, `Facebook`, `Reddit`, `YouTube_Comments`, `Product_Review_Site`, `Instagram` |
| `domain` | String | The thematic subject of the text. | `product_review`, `daily_life`, `entertainment`, `festival`, `work`, `relationships`, `education`, `food`, `politics`, `sports` |
| `script_type` | String | Alphabet used. | `Roman-transliterated` |
| `primary_language` | String | Derived from word ratios. | `Hindi-dominant` (>60% Hindi), `English-dominant` (>60% English), `Balanced` |
| `code_mixing_index` | Float | Measurement of intra-sentential mixing. | `0.0` to `50.0` |
| `hindi_word_ratio` | Float | Ratio of Hindi words to total classifiable words. | `0.0` to `1.0` |
| `english_word_ratio` | Float | Ratio of English words to total classifiable words. | `0.0` to `1.0` |
| `word_count` | Integer | Mathematical count of tokens split by space. | `4` to `40` |
| `char_count` | Integer | Mathematical count of total characters. | `10` to `300` |
| `sentiment_label` | String | Overall emotional polarity. | `Positive`, `Negative`, `Neutral` |
| `sentiment_confidence` | Float | Simulated confidence score (legacy from V1). | `0.0` to `1.0` |
| `emotion_label` | String | Specific emotion conveyed. | `joy`, `anger`, `sadness`, `fear`, `surprise`, `neutral` |
| `intent_label` | String | Purpose of the text. | `opinion`, `informative`, `complaint`, `question` |
| `sarcasm_flag` | String | Indicates if adversarial phrasing is present. | `yes`, `no` |
| `offensive_flag` | String | Indicates toxicity level (kept minimal). | `none`, `mild` |
| `annotator_agreement` | Float | Simulated inter-rater reliability. | `0.0` to `1.0` |
| `region_context` | String | Demographic target for loanwords/slang. | `North India`, `South India`, `East India`, `West India`, `Pan-India / Unspecified` |
| `split` | String | Recommended data partition. | `train`, `val`, `test` |

## Engineered Feature Formulas
- **`word_count`**: `len(text.split())`
- **`char_count`**: `len(text)`
- **`hindi_word_ratio`**: $H / (H + E)$
- **`english_word_ratio`**: $E / (H + E)$
- **`code_mixing_index (CMI)`**: $(\min(H, E) / (H + E)) \times 100$

*(Where H = count of Hindi tokens, E = count of English tokens, injected deterministically by the PCFG engine).*
