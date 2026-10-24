from pathlib import Path
import numpy as np
import pytest

from app.config import (
    MODEL_CHANNEL_NAMES,
    REQUIRED_CHANNELS,
    TARGET_FS,
    WINDOW_SAMPLES,
    WINDOW_SECONDS,
)
from app.model.inference import run_inference
from app.model.model_loader import ModelManager
from app.parsers import (
    extract_zip_archive_safely,
    parse_eeg_file,
    read_csv_file,
    read_edf_eeg_file,
    read_mat_file,
    read_numpy_eeg_file,
    read_tsv_file,
)
from app.preprocessing import (
    apply_bandpass_and_notch,
    clean_channel_name,
    create_eeg_windows,
    detect_and_orient_time_dimension,
    map_and_reorder_channels,
    normalize_eeg,
    process_eeg_recording,
    resample_eeg_signal,
)
from app.validation.compatibility import check_tensor_compatibility
from app.validation.validator import validate_eeg_file

FIXTURES_DIR = Path(__file__).parent / "fixtures"


# ============================================================
# 1. PARSER TESTS
# ============================================================

def test_mat_numeric():
    """Test parsing IEEE-style simple numeric MAT files (v1p.mat, v21p.mat)."""
    # v1p.mat: shape (1920, 19)
    rec1 = read_mat_file(FIXTURES_DIR / "v1p.mat")
    assert rec1.data.ndim == 2
    assert rec1.data.shape == (1920, 19)
    assert rec1.sampling_rate == 128.0

    # v21p.mat: stored as transposed (19, 1920) -> should be oriented to (1920, 19)
    rec2 = read_mat_file(FIXTURES_DIR / "v21p.mat")
    assert rec2.data.shape == (1920, 19)
    assert rec2.sampling_rate == 128.0


def test_mat_structured():
    """Test parsing Mendeley structured MATLAB objects (FC.mat, MC.mat, FADHD.mat, MADHD.mat)."""
    for mat_name in ["FC.mat", "MC.mat", "FADHD.mat", "MADHD.mat"]:
        path = FIXTURES_DIR / mat_name
        rec = read_mat_file(path)
        assert rec.data.ndim == 2
        assert rec.data.shape == (1920, 19)
        assert rec.sampling_rate in {128.0, 256.0}
        # Channel names are None if not present in the MAT file (no hardcoded filename assumptions)
        if rec.channel_names is not None:
            assert len(rec.channel_names) == 19


def test_mat_mcos_table(tmp_path):
    """Test parsing MATLAB MCOS table objects stored in serialized workspace."""
    import struct
    import scipy.io as sio

    n_samples = 1500
    # Time vector at 500 Hz (dt = 0.002s)
    time_arr = np.arange(n_samples, dtype=np.float64) * 0.002

    b_data = bytearray()
    # Time block
    b_data.extend(struct.pack("<II", 9, n_samples * 8))
    b_data.extend(time_arr.astype("<f8").tobytes())

    # 19 channel blocks
    for ch_idx in range(19):
        ch_sig = np.sin(2 * np.pi * 10 * time_arr + ch_idx).astype("<f8")
        b_data.extend(struct.pack("<II", 9, n_samples * 8))
        b_data.extend(ch_sig.tobytes())

    # Suffix metadata with EEG channel labels
    ch_names_raw = [
        "EEGFp1_AA", "EEGFp2_AA", "EEGF7_AA", "EEGF3_AA", "EEGFz_AA",
        "EEGF4_AA", "EEGF8_AA", "EEGT3_AA", "EEGC3_AA", "EEGCz_AA",
        "EEGC4_AA", "EEGT4_AA", "EEGT5_AA", "EEGP3_AA", "EEGPz_AA",
        "EEGP4_AA", "EEGT6_AA", "EEGO1_AA", "EEGO2_AA"
    ]
    for ch_n in ch_names_raw:
        b_data.extend(ch_n.encode("ascii") + b"\x00")

    ws_arr = np.frombuffer(bytes(b_data), dtype=np.uint8)
    mat_file = tmp_path / "test_mcos.mat"
    sio.savemat(str(mat_file), {"workspace": ws_arr})

    rec = read_mat_file(mat_file)
    assert rec.data.shape == (n_samples, 19)
    assert rec.channel_names == MODEL_CHANNEL_NAMES
    assert rec.sampling_rate == 500.0



def test_csv():
    """Test parsing CSV files (v1p.csv)."""
    rec = read_csv_file(FIXTURES_DIR / "v1p.csv")
    assert rec.data.shape == (1920, 19)
    assert rec.channel_names == MODEL_CHANNEL_NAMES
    assert rec.sampling_rate == 128.0


def test_tsv():
    """Test parsing TSV files with time column."""
    rec = read_tsv_file(FIXTURES_DIR / "recording.tsv")
    assert rec.data.shape == (1920, 19)
    # Sampling rate should be calculated from time column
    assert abs(rec.sampling_rate - 128.0) < 1.0


def test_npy():
    """Test parsing .npy NumPy files."""
    rec = read_numpy_eeg_file(FIXTURES_DIR / "recording.npy")
    assert rec.data.shape == (1920, 19)


def test_npz():
    """Test parsing .npz NumPy archives with metadata."""
    rec = read_numpy_eeg_file(FIXTURES_DIR / "recording.npz")
    assert rec.data.shape == (1920, 19)
    assert rec.sampling_rate == 128.0
    assert len(rec.channel_names) == 19


def test_edf():
    """Test parsing EDF files using MNE."""
    rec = read_edf_eeg_file(FIXTURES_DIR / "recording.edf")
    assert rec.data.shape == (1920, 19)
    assert rec.sampling_rate == 128.0
    assert len(rec.channel_names) == 19


def test_zip():
    """Test safe extraction and recursive file search in ZIP archive."""
    import tempfile
    temp_dir = Path(tempfile.mkdtemp())
    try:
        eeg_files, ignored = extract_zip_archive_safely(FIXTURES_DIR / "dataset.zip", temp_dir)
        # Should find v1p.mat, FC.mat, v1p.csv
        assert len(eeg_files) >= 3
        # Should ignore notes.txt and metadata.pdf
        assert len(ignored) >= 2
    finally:
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)


# ============================================================
# 2. PREPROCESSING & SIGNAL TRANSFORMATION TESTS
# ============================================================

def test_channel_name_cleaning():
    """Test cleaning and standardizing EEG channel names."""
    assert clean_channel_name("EEG Fp1-REF") == "FP1"
    assert clean_channel_name("fp1") == "FP1"
    assert clean_channel_name("T7-REF") == "T7"
    assert clean_channel_name("EEG CZ") == "CZ"
    assert clean_channel_name("Pz-LE") == "PZ"


def test_channel_mapping_and_order():
    """Test mapping and reordering channels to the exact model order."""
    # Create scrambled order
    scrambled_names = list(reversed(MODEL_CHANNEL_NAMES))
    data = np.arange(100 * 19).reshape(100, 19).astype(np.float64)

    reordered, final_names, _ = map_and_reorder_channels(data, scrambled_names)
    assert final_names == MODEL_CHANNEL_NAMES
    # Verify values were correctly moved to corresponding columns
    src_fp1_idx = scrambled_names.index("Fp1")
    assert np.allclose(reordered[:, 0], data[:, src_fp1_idx])


def test_resampling():
    """Test polyphase resampling from 256 Hz to 128 Hz."""
    orig_fs = 256.0
    t = np.linspace(0, 10, int(10 * orig_fs), endpoint=False)
    data = np.sin(2 * np.pi * 5 * t)[:, None]  # 5 Hz sine wave

    resampled, new_fs, changed = resample_eeg_signal(data, orig_fs, TARGET_FS)
    assert changed is True
    assert new_fs == TARGET_FS
    assert len(resampled) == int(10 * TARGET_FS)


def test_filtering():
    """Test bandpass (1-45 Hz) and 50 Hz notch filtering."""
    data = np.random.normal(0, 1, (1280, 19))
    filtered = apply_bandpass_and_notch(data, TARGET_FS)
    assert filtered.shape == (1280, 19)
    assert np.all(np.isfinite(filtered))


def test_normalization():
    """Test per-channel zero-mean unit-variance z-score normalization."""
    data = np.random.normal(50, 15, (1280, 19))
    normed = normalize_eeg(data)
    assert normed.shape == (1280, 19)
    assert np.allclose(np.mean(normed, axis=0), 0.0, atol=1e-5)
    assert np.allclose(np.std(normed, axis=0), 1.0, atol=1e-5)


def test_windowing():
    """Test 10-second windowing with 50% overlap."""
    # 15 seconds at 128 Hz = 1920 samples
    data = np.zeros((1920, 19), dtype=np.float64)
    windows = create_eeg_windows(data, fs=128.0)
    # (1920 - 1280) // 640 + 1 = 640 // 640 + 1 = 2 windows
    assert windows.shape == (2, 1280, 19)
    assert windows.dtype == np.float32


# ============================================================
# 3. END-TO-END PIPELINE & REAL INFERENCE TESTS
# ============================================================

def test_full_pipeline_v1p_csv():
    """Test complete pipeline from raw v1p.csv to real model inference."""
    rec = parse_eeg_file(FIXTURES_DIR / "v1p.csv")
    X, continuous, fs, channels, warnings = process_eeg_recording(rec)

    assert X.shape[1:] == (1280, 19)
    assert fs == 128.0
    assert channels == MODEL_CHANNEL_NAMES

    check_tensor_compatibility(X)

    mean_prob, pred_class, window_probs, window_records, agg = run_inference(X)
    assert 0.0 <= mean_prob <= 1.0
    assert pred_class in {"ADHD", "Control"}
    assert len(window_probs) == len(X)
    assert len(window_records) == len(X)
    assert "mean_adhd_probability" in agg


def test_full_pipeline_v1p_mat():
    """Test complete pipeline from raw IEEE v1p.mat to real model inference."""
    rec = parse_eeg_file(FIXTURES_DIR / "v1p.mat")
    X, _, _, _, _ = process_eeg_recording(rec)
    mean_prob, pred_class, _, _, _ = run_inference(X)
    assert 0.0 <= mean_prob <= 1.0
    assert pred_class in {"ADHD", "Control"}


def test_full_pipeline_fc_mat_mendeley():
    """Test complete pipeline from raw Mendeley FC.mat to real model inference."""
    rec = parse_eeg_file(FIXTURES_DIR / "FC.mat")
    X, _, _, _, _ = process_eeg_recording(rec)
    mean_prob, pred_class, _, _, _ = run_inference(X)
    assert 0.0 <= mean_prob <= 1.0
    assert pred_class in {"ADHD", "Control"}


# ============================================================
# 4. NEGATIVE AND VALIDATION TESTS
# ============================================================

def test_short_recording_padded():
    """Test that recordings shorter than 10 seconds are adaptively padded and generate valid windows."""
    rec = parse_eeg_file(FIXTURES_DIR / "short_recording.csv")
    X, continuous, fs, ch_names, warnings = process_eeg_recording(rec)
    assert X.shape == (1, WINDOW_SAMPLES, REQUIRED_CHANNELS)
    assert any("short" in w.lower() or "extended" in w.lower() for w in warnings)


def test_empty_recording_rejected():
    """Test that recordings with fewer than 2 samples are cleanly rejected."""
    from app.parsers.base import EEGRecording
    empty_rec = EEGRecording(
        data=np.zeros((1, 19)),
        sampling_rate=128.0,
        channel_names=MODEL_CHANNEL_NAMES,
        source_format="TEST",
        file_name="empty.csv",
        original_shape=(1, 19)
    )
    with pytest.raises(ValueError, match="fewer than 2"):
        process_eeg_recording(empty_rec)


def test_missing_channels_padded():
    """Test that recordings with fewer channels are zero-padded to 19 channels (matching Colab pad_channels)."""
    rec = parse_eeg_file(FIXTURES_DIR / "missing_channels.csv")
    X, continuous, fs, ch_names, warnings = process_eeg_recording(rec)
    assert X.shape[2] == 19
    assert any("zero-padded" in w.lower() for w in warnings)


def test_validation_report_on_valid_and_invalid():
    """Test validation report generation without running inference."""
    # Valid file
    rep_valid = validate_eeg_file(FIXTURES_DIR / "v1p.csv")
    assert rep_valid.valid is True
    assert rep_valid.model_compatible is True
    assert rep_valid.required_channels_available is True
    assert len(rep_valid.issues) == 0

    # Short file
    rep_short = validate_eeg_file(FIXTURES_DIR / "short_recording.csv")
    assert rep_short.valid is False
    assert any("shorter than the required" in issue for issue in rep_short.issues)

    # Missing channels file
    rep_missing = validate_eeg_file(FIXTURES_DIR / "missing_channels.csv")
    assert rep_missing.valid is False
    assert rep_missing.required_channels_available is False
