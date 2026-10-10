from typing import Any, Dict, List, Tuple
import numpy as np
from scipy import signal
from app.config import OVERLAP, REQUIRED_CHANNELS, WINDOW_SAMPLES, WINDOW_SECONDS, TARGET_FS
from app.model.model_loader import ModelManager
from app.utils.logging import log_pipeline_step

BANDS = [(1,4),(4,8),(8,13),(13,30),(30,45)]
def validate_inference_input(X):
    if not isinstance(X,np.ndarray) or X.ndim != 3: raise ValueError(f"Input must be (windows,time,channels); got {getattr(X,'shape',None)}")
    if X.shape[1:] != (WINDOW_SAMPLES, REQUIRED_CHANNELS): raise ValueError(f"Expected (windows,{WINDOW_SAMPLES},{REQUIRED_CHANNELS}), got {X.shape}")

def psd_features(window, fs=TARGET_FS):
    freqs, psd=signal.welch(window,fs=fs,nperseg=min(256,len(window)),axis=0)
    psd=psd.T+1e-12
    mask=(freqs>=1)&(freqs<min(45,fs/2)); total=np.trapezoid(psd[:,mask],freqs[mask],axis=1)+1e-12
    feats=[]
    for lo,hi in BANDS:
        m=(freqs>=lo)&(freqs<min(hi,fs/2*.95))
        rel=np.zeros(psd.shape[0]) if m.sum()<2 else np.trapezoid(psd[:,m],freqs[m],axis=1)/total
        feats.extend([rel.mean(),rel.std(),np.median(rel)])
    for a in [np.sqrt(np.mean(window**2,axis=0)),np.std(window,axis=0),np.mean(np.abs(window),axis=0)]: feats.extend([a.mean(),a.std(),np.median(a)])
    return np.asarray(feats,dtype=np.float32)

def run_inference(X):
    validate_inference_input(X); models=ModelManager.get_models(); cfg=ModelManager.get_config()
    probs={"cnn_transformer":np.asarray(models["cnn_transformer"].predict(X,verbose=0)).reshape(-1),
           "eegnet":np.asarray(models["eegnet"].predict(X,verbose=0)).reshape(-1)}
    F=np.stack([psd_features(w,TARGET_FS) for w in X]); F=ModelManager.get_scaler().transform(F)
    probs["xgboost"]=models["xgboost"].predict_proba(F)[:,1]
    weights=cfg["weights"]; threshold=float(cfg.get("threshold",.5))
    ensemble=sum(float(weights.get(k,0))*probs[k] for k in probs)
    # If weights are absent/invalid, use an equal-probability average.
    if sum(float(weights.get(k,0)) for k in probs)<=0: ensemble=np.mean(np.stack(list(probs.values())),axis=0)
    ensemble=np.clip(ensemble,0,1)
    records=[]; step=WINDOW_SECONDS*(1-OVERLAP)
    for i,p in enumerate(ensemble):
        records.append({"window":i+1,"start_seconds":round(i*step,2),"end_seconds":round(i*step+WINDOW_SECONDS,2),"adhd_probability":round(float(p),6),"prediction":"ADHD" if p>=threshold else "Control"})
    mean=float(np.mean(ensemble)); pred="ADHD" if mean>=threshold else "Control"
    metrics={"mean_adhd_probability":round(mean,6),"median_adhd_probability":round(float(np.median(ensemble)),6),"adhd_window_percentage":round(float(np.mean(ensemble>=threshold)*100),2),"confidence":round(max(mean,1-mean),6),"total_windows":len(ensemble),"predicted_class":pred,"label":"ADHD Detected" if pred=="ADHD" else "Control / Normal","model_probabilities":{k:round(float(np.mean(v)),6) for k,v in probs.items()},"ensemble_weights":weights,"threshold":threshold}
    return mean,pred,[round(float(p),6) for p in ensemble],records,metrics
