# Dataset Generation Methodology

This document details the iterative refinement process of the CodeMix India dataset, tracking its evolution from a static, template-bound (V1) baseline to a dynamic, high-entropy (V3) Probabilistic Context-Free Grammar (PCFG) model.

## V1: The Static Baseline (Deprecated)
The initial dataset consisted of 55,000 rows generated via 10 rigid templates.
- **Flaw**: Over 90% of the dataset relied on the format `[Subject] [Adjective] tha, na zyada accha na bura. (random number)`. 
- **Consequence**: This created massive data leakage. Machine learning models would overfit to structural tokens rather than learning genuine semantic embeddings.

## V2: Stochastic Replacement & Domain Injector
To break the rigid templates, we introduced a stochastic Python pipeline.
- **Process**: Texts were stripped of artificial markers `(random number)` and regenerated using varied prefix/suffix logic based on the text's `domain` and `sentiment`.
- **Imperfections Added**: We introduced realistic phonetic spelling variants (`acha`/`accha`) and randomized typos (`local` $\rightarrow$ `loacl`).
- **Feature Math**: Engineered features (`word_count`, `code_mixing_index`) were dynamically recalculated based on the generated token tags.
- **Flaw Discovered**: While unigram diversity increased, a post-V2 audit revealed that 20% of the dataset (the "long-context" subset) relied on a single English syntactic bridge (*"I was really looking forward to... Lekin when I actually experienced it..."*). This caused trigram repetition rates to spike to 1.54%.

## V3: PCFG Syntactic Shattering (Final)
To meet NeurIPS/ACL publication standards, the V2 script was modified into a full Probabilistic Context-Free Grammar (PCFG) engine.
- **The Fix**: The static English bridge was shattered into a combinatorial matrix of 10 `Setups` $\times$ 10 `Turns` $\times$ 10 `Conclusions`, resulting in 1,000+ unique grammatical paths for long-context samples alone.
- **Results**: Trigram leakage was completely eliminated (maximum frequency dropped to 0.72% for the natural idiom *"maza aa gaya"*). Total Shannon Entropy rose to a highly naturalistic `5.4885`.
