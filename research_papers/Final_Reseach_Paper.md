EEG-BASED ADHD DETECTION USING A MULTI-MODEL DEEP LEARNING FRAMEWORK

Abstract, Introduction, Objectives and References

Abstract
Attention-Deficit/Hyperactivity Disorder (ADHD) is a neurodevelopmental condition commonly associated with inattention, impulsivity and hyperactivity. It is usually identified through clinical history, behavioural observations, questionnaires and psychological assessment, although these assessments may vary with the setting and the observations made. Electroencephalography (EEG) provides a non-invasive way to record brain activity and has been studied as a complementary source for computational ADHD research. However, EEG signals are noisy, non-stationary and recorded across multiple channels, which makes reliable classification difficult. This study presents a multi-model framework for classifying ADHD and control participants using the IEEE and Mendeley EEG datasets. CNN, CNN-LSTM/BiLSTM and CNN-Transformer models are evaluated experimentally, while the overall framework also includes CNN + Transformer, EEGNet and PSD + XGBoost branches. The preprocessing pipeline consists of signal quality checking, 50 Hz notch filtering, 1–45 Hz band-pass filtering, common-average referencing, median/MAD-based artifact suppression, extreme-value screening, four-second windows with 50% overlap and training-only standardization. Participants are separated before window generation to reduce information leakage, and the final evaluation is carried out on previously unseen participants. On Mendeley, CNN and CNN-Transformer achieved 100% accuracy, while CNN-LSTM achieved 75.0% on 16 held-out participants. On IEEE, CNN achieved 72.0%, while CNN-Transformer and CNN-BiLSTM achieved 60.0% on 25 held-out participants. Accuracy, balanced accuracy, precision, sensitivity, specificity, F1-score, F2-score, ROC-AUC and confusion matrices are evaluated at the participant level. The framework is intended as a reproducible research and decision-support prototype and is not intended to replace clinical diagnosis.

Keywords— ADHD, EEG, CNN, Transformer, EEGNet, PSD, XGBoost, deep learning, ensemble learning, EEG classification

I. Introduction
Attention-deficit/hyperactivity disorder (ADHD) is a neurodevelopmental disorder commonly associated with inattention, impulsivity and hyperactivity. The symptoms can affect learning, social interaction and everyday activities, and their presentation can differ from one individual to another. ADHD assessment commonly relies on clinical history, behavioural observations, rating scales and psychological evaluation. These approaches are important in clinical practice, but they do not directly measure brain electrical activity. This has led researchers to investigate physiological signals such as EEG as an additional source of information. EEG records brain electrical activity with high temporal resolution, and previous studies have examined its spectral characteristics to distinguish ADHD and control groups. Traditional machine-learning methods often rely on manually extracted features such as spectral power and statistical measures. Power spectral density (PSD) provides a compact representation of frequency information in EEG, and Tenev et al. studied EEG power spectra for ADHD classification.³⁻⁵

Deep-learning methods can learn useful representations directly from EEG data instead of relying only on manually designed features. CNNs can learn local patterns, while recurrent and attention-based models can capture relationships over time. A hybrid CNN-LSTM study showed that combining spatial feature extraction with temporal modelling can be useful for ADHD EEG classification.² In this study, CNN, CNN-LSTM/BiLSTM and CNN-Transformer architectures are evaluated using the IEEE and Mendeley datasets. The CNN + Transformer branch combines convolutional feature extraction with self-attention to learn local patterns and relationships over longer sequences. EEGNet is included as a compact EEG-oriented model that uses temporal and spatial convolution. The PSD + XGBoost branch provides a frequency-domain approach based on spectral features and gradient-boosted classification. These branches provide different views of the EEG signal, and their predicted probabilities can be combined using an ensemble layer.

The proposed framework uses input validation, 19-channel standardization, resampling to 128 Hz, 1–45 Hz filtering and windowing, along with signal-quality and artifact-handling steps. Participants are divided into training, validation and test groups before EEG windows are generated to reduce information leakage and support subject-independent evaluation. The final output is an ADHD or Control prediction at the participant level, supported by several evaluation metrics. The main contributions are the development and comparison of several EEG deep-learning architectures, the integration of CNN + Transformer, EEGNet and PSD + XGBoost approaches, the use of subject-independent preprocessing and evaluation, and assessment using accuracy, balanced accuracy, precision, sensitivity, specificity, F1-score, F2-score, ROC-AUC and confusion matrices. The framework is intended for research and decision support rather than standalone clinical diagnosis.

Proposed Architecture and Mathematical Formulation

EEG recording (19 channels) → input validation/channel alignment → resampling to 128 Hz → band-pass filtering (1–45 Hz) → windowing → parallel model branches:

                              ┌─ CNN feature extractor → Transformer self-attention ─┐
EEG windows ───────────────────┼─ EEGNet temporal + spatial convolution ───────────────┼→ probability fusion → subject-level ADHD/Control
                              └─ PSD band-power features → XGBoost ────────────────────┘

Figure 1. Conceptual processing architecture of the proposed three-branch EEG classification framework.

CNN + Transformer

A 1-D convolution is used to extract local patterns from the multichannel sequence. A simplified form is:

y[t,k] = σ( Σᵢ Σⱼ w[j,i,k] x[t+j,i] + b[k] )

For self-attention, Q = XWQ, K = XWK, and V = XWV. The attention output is:

Attention(Q,K,V) = softmax(QKᵀ / √dₖ)V

Here, X is the learned sequence representation, WQ/WK/WV are trainable projections, and dₖ is the key dimension. The convolution layer learns local signal structure, while attention models relationships between sequence positions.

EEGNet

EEGNet uses temporal convolution, depthwise spatial filtering across EEG channels, followed by separable convolution. In compact form:

T = Conv_temporal(X);   S = DepthwiseSpatial(T);   Z = SeparableConv(S)

The resulting features are passed to a classification layer to estimate P(ADHD | X). The layer dimensions and kernel settings should match the implemented model configuration.

PSD + XGBoost

Welch’s method is used to estimate the power spectral density Pxx(f). The relative power for frequency band b is:

RP_b = [∫(f∈b) Pxx(f) df] / [∫(1 Hz to 45 Hz) Pxx(f) df]

The project’s five bands are delta (1–4 Hz), theta (4–8 Hz), alpha (8–13 Hz), beta (13–30 Hz), and gamma (30–45 Hz). The resulting band-power feature vector is then given to XGBoost.

Ensemble and Decision Rule

For N windows from one participant, the branch probability is averaged as p̄_m = (1/N) Σₙ p_m,n. The ensemble probability is:

P_ensemble = w₁p̄_CNN+Transformer + w₂p̄_EEGNet + w₃p̄_PSD+XGBoost,   Σᵢwᵢ = 1

The predicted class is ADHD when P_ensemble ≥ τ; otherwise, it is Control. The weights and threshold τ should be selected using validation participants only, while the test set is kept for final evaluation.

Evaluation Metric Definitions

Let TP, TN, FP and FN denote true positives, true negatives, false positives and false negatives. The principal measures are:

Accuracy = (TP + TN)/(TP + TN + FP + FN)     |     Balanced Accuracy = (Sensitivity + Specificity)/2

Precision = TP/(TP + FP)     |     Sensitivity = TP/(TP + FN)     |     Specificity = TN/(TN + FP)

F1 = 2 × Precision × Recall/(Precision + Recall)     |     F2 = 5 × Precision × Recall/(4 × Precision + Recall)

ROC-AUC is the area under the receiver operating characteristic curve. These measures are reported together because accuracy alone does not show the effect of false negatives and false positives.

II. Objectives

1. To implement an EEG preprocessing pipeline for input validation, 19-channel standardization, resampling, filtering and window generation.

2. To develop a CNN + Transformer model that learns local EEG patterns and longer-range temporal relationships for ADHD/Control classification.

3. To incorporate EEGNet as a compact architecture for learning temporal and spatial features from multichannel EEG.

4. To extract frequency-domain PSD features and use XGBoost to classify ADHD and Control EEG recordings.

5. To combine predictions from CNN + Transformer, EEGNet and PSD + XGBoost using an ensemble layer and generate participant-level predictions.

6. To evaluate the framework using accuracy, balanced accuracy, precision, sensitivity, specificity, F1-score, F2-score, ROC-AUC and confusion matrices, with subject-level separation of data.

References

[1] American Psychiatric Association, Diagnostic and Statistical Manual of Mental Disorders, 5th ed. Washington, DC: APA, 2013.

[2] N. Chugh, S. Aggarwal, and A. Balyan, “The Hybrid Deep Learning Model for Identification of Attention-Deficit/Hyperactivity Disorder Using EEG,” Clinical EEG and Neuroscience, vol. 55, no. 1, pp. 22–33, 2024. doi: 10.1177/15500594231193511.

[3] Z. He et al., “Classification of attention deficit/hyperactivity disorder based on EEG signals using a EEG-Transformer model,” Journal of Neural Engineering, 2023. doi: 10.1088/1741-2552/acf7f5.

[4] L. Dubreuil-Vall, G. Ruffini, and J. A. Camprodon, “Deep Learning Convolutional Neural Networks Discriminate Adult ADHD From Healthy Individuals on the Basis of Event-Related Spectral EEG,” Frontiers in Neuroscience, vol. 14, 251, 2020. doi: 10.3389/fnins.2020.00251.

[5] A. Tenev et al., “Machine learning approach for classification of ADHD adults,” International Journal of Psychophysiology, vol. 93, no. 1, pp. 162–166, 2014. doi: 10.1016/j.ijpsycho.2013.01.008.

[6] V. J. Lawhern et al., “EEGNet: A compact convolutional neural network for EEG-based brain-computer interfaces,” Journal of Neural Engineering, vol. 15, no. 5, 056013, 2018. doi: 10.1088/1741-2552/aace8c.

[7] M. Sarker et al., “A Hybrid Approach to Attention Deficit Hyperactivity Disorder Detection Leveraging Transformer and XGBoost Models Using XSparseFormerNet,” Scientific Reports, 2025. doi: 10.1038/s41598-025-24919-3.

