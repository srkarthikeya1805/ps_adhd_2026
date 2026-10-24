import io
import zipfile
from pathlib import Path
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.subagents.bio_authenticator import BioSignalAuthenticatorSubagent
from app.subagents.dispatcher import DispatcherSubagent
from app.subagents.format_inspector import FormatInspectorSubagent

client = TestClient(app)
FIXTURES_DIR = Path(__file__).parent / "fixtures"


# ==============================================================================
# 1. UNIT TESTS: BioSignalAuthenticatorSubagent
# ==============================================================================

def test_bio_authenticator_valid_eeg():
    """Verify that genuine EEG signals pass bio-signal authentication."""
    # Synthetic 10s EEG signal at 128 Hz (1280 samples, 19 channels) with 1/f spectral roll-off
    np.random.seed(42)
    t = np.linspace(0, 10, 1280)
    # Dominant low-frequency rhythms (Alpha 10 Hz + Theta 6 Hz)
    sig = np.zeros((1280, 19))
    for ch in range(19):
        sig[:, ch] = (
            np.sin(2 * np.pi * 10 * t + ch) * 25.0 +
            np.sin(2 * np.pi * 6 * t + ch * 0.5) * 15.0 +
            np.random.normal(0, 3.0, 1280)
        )

    res = BioSignalAuthenticatorSubagent.evaluate(
        data=sig,
        sampling_rate=128.0,
        channel_names=["Fp1", "Fp2", "F3", "F4", "C3", "C4", "P3", "P4", "O1", "O2",
                       "F7", "F8", "T3", "T4", "T5", "T6", "Fz", "Cz", "Pz"],
        filename="patient_alpha_eeg.mat"
    )
    assert res.is_valid_eeg is True
    assert res.signal_type == "EEG Brainwave"
    assert res.rejection_reason is None


def test_bio_authenticator_trial_sequence_metadata():
    """Verify that experimental task metadata (stimulus logs / trial sequences) are rejected."""
    # 52 trials of stimulus presentation log: trial_id, stimulus_id, reaction_time, keypress
    np.random.seed(42)
    n_trials = 52
    trial_data = np.column_stack([
        np.arange(1, n_trials + 1),                      # Trial numbers: 1..52
        np.random.choice([101, 102, 103], size=n_trials), # Stimulus codes
        np.random.normal(450, 50, size=n_trials),         # Reaction time (ms)
        np.random.choice([0, 1], size=n_trials)           # Keypress accuracy
    ])

    res = BioSignalAuthenticatorSubagent.evaluate(
        data=trial_data,
        sampling_rate=128.0,
        channel_names=["trial_number", "stimulus_id", "reaction_time", "accuracy"],
        filename="trial_sequence_01.csv"
    )
    assert res.is_valid_eeg is False
    assert "Task Metadata" in res.signal_type or "Short Trial" in res.signal_type
    assert "experimental task" in res.rejection_reason.lower() or "headers" in res.rejection_reason.lower() or "trial" in res.rejection_reason.lower()


def test_bio_authenticator_discrete_integer_codes():
    """Verify that discrete categorical integer sequences (e.g. trigger logs) are rejected."""
    # 500 samples of discrete integer triggers (0, 1, 2)
    np.random.seed(42)
    discrete_data = np.random.choice([0, 1, 2], size=(500, 4)).astype(np.float64)

    res = BioSignalAuthenticatorSubagent.evaluate(
        data=discrete_data,
        sampling_rate=128.0,
        filename="triggers_sequence.csv"
    )
    assert res.is_valid_eeg is False
    assert "Discrete" in res.signal_type or "Categorical" in res.signal_type
    assert "discrete" in res.rejection_reason.lower()


def test_bio_authenticator_monotonic_ramp():
    """Verify that monotonic counter ramps (e.g. timestamps or index channels) are rejected."""
    # Monotonic ramp: 1, 2, 3... 1000
    ramp = np.arange(1000)[:, None]
    res = BioSignalAuthenticatorSubagent.evaluate(
        data=ramp,
        sampling_rate=128.0,
        filename="sample_index.csv"
    )
    assert res.is_valid_eeg is False
    assert "Monotonic" in res.signal_type
    assert "monotonic" in res.rejection_reason.lower()


def test_bio_authenticator_flatline():
    """Verify that flatline signals (zero variance) are rejected."""
    flat = np.zeros((1280, 19))
    res = BioSignalAuthenticatorSubagent.evaluate(
        data=flat,
        sampling_rate=128.0,
        filename="flatline.mat"
    )
    assert res.is_valid_eeg is False
    assert "Flatline" in res.signal_type
    assert "flatline" in res.rejection_reason.lower()


# ==============================================================================
# 2. INTEGRATION TESTS: TRIAL SEQUENCE ZIP ARCHIVE (USER'S EXACT SCENARIO)
# ==============================================================================

def test_trial_sequence_zip_rejection():
    """
    Test user's exact reported problem:
    When trial_sequence.zip (containing 52 experimental task presentation files) is uploaded:
    - Backend MUST NOT start predicting or predict all 52 files as ADHD.
    - Backend MUST return status='invalid_input', is_valid_eeg=False, adhd_predictions=0, control_predictions=0.
    """
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # Create 52 trial presentation CSV files
        for i in range(1, 53):
            content = "trial_id,stimulus_type,reaction_time_ms,accuracy\n"
            for t in range(1, 25):
                content += f"{t},{100 + (t % 3)},{400 + (t * 5)},{1 if t % 4 != 0 else 0}\n"
            zf.writestr(f"trial_sequence_{i:02d}.csv", content)

    zip_buffer.seek(0)

    response = client.post(
        "/api/predict",
        files=[("files", ("trial_sequence.zip", zip_buffer.getvalue(), "application/zip"))]
    )
    assert response.status_code == 200
    data = response.json()

    # The batch MUST be marked as invalid_input, NOT success with false ADHD diagnoses!
    assert data["status"] == "invalid_input"
    assert data["is_valid_eeg"] is False
    assert data["summary"]["total_files"] == 52
    assert data["summary"]["successful_files"] == 0
    assert data["summary"]["adhd_predictions"] == 0
    assert data["summary"]["control_predictions"] == 0
    assert data["summary"]["invalid_signal_files"] == 52
    assert "does not contain" in data["message"].lower() or "metadata" in data["message"].lower()

    # Verify that all 52 files were cleanly halted without predictions
    for file_res in data["results"]:
        assert file_res["status"] == "invalid_input"
        assert file_res["is_valid_eeg"] is False
        assert file_res["prediction"] is None
        assert file_res["adhd_probability"] is None
        assert file_res["rejection_reason"] is not None


def test_single_trial_sequence_csv_rejection():
    """Verify that uploading a single trial_sequence.csv halts prediction with invalid_input."""
    csv_content = "trial,stimulus,reaction_time,response\n"
    for i in range(1, 30):
        csv_content += f"{i},A,{350 + i * 2},1\n"

    response = client.post(
        "/api/predict",
        files=[("files", ("trial_sequence.csv", csv_content.encode("utf-8"), "text/csv"))]
    )
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "invalid_input"
    assert data["is_valid_eeg"] is False
    assert data["summary"]["adhd_predictions"] == 0
    assert data["summary"]["control_predictions"] == 0
    assert data["summary"]["invalid_signal_files"] == 1

    res0 = data["results"][0]
    assert res0["status"] == "invalid_input"
    assert res0["prediction"] is None
    assert res0["is_valid_eeg"] is False
    assert "metadata" in res0["rejection_reason"].lower() or "task" in res0["rejection_reason"].lower()


def test_mixed_archive_eeg_and_task_metadata():
    """
    Verify that an archive containing both real EEG and task metadata:
    - Real EEG file is successfully predicted (ADHD or Control).
    - Task metadata file is halted as invalid_input.
    """
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1. Real EEG recording (from fixtures v1p.csv)
        with open(FIXTURES_DIR / "v1p.csv", "r") as f:
            zf.writestr("eeg_recording.csv", f.read())

        # 2. Task metadata trial log
        task_csv = "trial,stimulus_id,rt,accuracy\n"
        for i in range(1, 40):
            task_csv += f"{i},201,{420 + i},1\n"
        zf.writestr("task_trial_sequence.csv", task_csv)

    zip_buffer.seek(0)
    response = client.post(
        "/api/predict",
        files=[("files", ("mixed_study.zip", zip_buffer.getvalue(), "application/zip"))]
    )
    assert response.status_code == 200
    data = response.json()

    assert data["summary"]["total_files"] == 2
    assert data["summary"]["successful_files"] == 1
    assert data["summary"]["invalid_signal_files"] == 1
    assert (data["summary"]["adhd_predictions"] + data["summary"]["control_predictions"]) == 1

    # Verify individual results
    res_eeg = next(r for r in data["results"] if "eeg_recording" in r["filename"])
    assert res_eeg["status"] == "success"
    assert res_eeg["prediction"] in {"ADHD", "Control"}
    assert res_eeg["is_valid_eeg"] is True

    res_task = next(r for r in data["results"] if "task_trial_sequence" in r["filename"])
    assert res_task["status"] == "invalid_input"
    assert res_task["prediction"] is None
    assert res_task["is_valid_eeg"] is False


def test_validation_endpoint_with_task_metadata():
    """Verify that POST /api/validate correctly flags trial sequences as invalid without crashing."""
    csv_content = "trial,stimulus,reaction_time\n1,101,450\n2,102,380\n3,101,520\n"
    response = client.post(
        "/api/validate",
        files=[("files", ("trial_sequence.csv", csv_content.encode("utf-8"), "text/csv"))]
    )
    assert response.status_code == 200
    reports = response.json()
    assert len(reports) == 1
    rep = reports[0]
    assert rep["valid"] is False
    assert rep["model_compatible"] is False
    assert rep["is_valid_eeg"] is False
    assert any("task" in issue.lower() or "bio-signal" in issue.lower() for issue in rep["issues"])
