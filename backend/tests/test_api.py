from pathlib import Path
from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)
FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "model" in data
    assert data["model"]["channels_required"] == 19
    assert data["model"]["sampling_rate_hz"] == 128
    assert ".gdf" in data["supported_formats"]
    assert ".bdf" in data["supported_formats"]



def test_health_endpoints():
    for url in ["/health", "/api/health"]:
        response = client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["model_loaded"] is True
        assert data["device"] in {"CPU", "GPU"}


def test_model_info_endpoint():
    response = client.get("/api/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_loaded"] is True
    assert data["input_shape"] == [None, 1280, 19]
    assert data["output_shape"] == [None, 1]
    assert "CNN + Transformer" in data["architecture"]
    assert len(data["channel_names"]) == 19


def test_validate_endpoint():
    with open(FIXTURES_DIR / "v1p.csv", "rb") as f:
        response = client.post(
            "/api/validate",
            files=[("files", ("v1p.csv", f, "text/csv"))]
        )
    assert response.status_code == 200
    reports = response.json()
    assert len(reports) == 1
    assert reports[0]["valid"] is True
    assert reports[0]["model_compatible"] is True


def test_predict_single_file_endpoint():
    with open(FIXTURES_DIR / "v1p.csv", "rb") as f:
        response = client.post(
            "/api/predict",
            files=[("files", ("v1p.csv", f, "text/csv"))]
        )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["summary"]["total_files"] == 1
    assert data["summary"]["successful_files"] == 1
    result = data["results"][0]
    assert result["filename"] == "v1p.csv"
    assert result["prediction"] in {"ADHD", "Control"}
    assert 0.0 <= result["adhd_probability"] <= 1.0
    assert result["total_windows"] > 0
    assert result["details"]["sampling_rate_used"] == 128.0
    assert result["details"]["channels_used"] == 19


def test_predict_multiple_files_endpoint():
    with open(FIXTURES_DIR / "v1p.mat", "rb") as f1, open(FIXTURES_DIR / "FC.mat", "rb") as f2:
        response = client.post(
            "/api/predict",
            files=[
                ("files", ("v1p.mat", f1, "application/octet-stream")),
                ("files", ("FC.mat", f2, "application/octet-stream")),
            ]
        )
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["total_files"] == 2
    assert data["summary"]["successful_files"] == 2
    assert len(data["results"]) == 2


def test_predict_zip_archive_endpoint():
    with open(FIXTURES_DIR / "dataset.zip", "rb") as f:
        response = client.post(
            "/api/predict",
            files=[("files", ("dataset.zip", f, "application/zip"))]
        )
    assert response.status_code == 200
    data = response.json()
    assert data["batch_type"] == "zip_archive"
    assert data["summary"]["total_files"] >= 3
    assert data["summary"]["successful_files"] >= 3


def test_predict_short_recording_endpoint():
    """Verify that recordings shorter than 10 seconds are adaptively padded and succeed with predictions."""
    with open(FIXTURES_DIR / "short_recording.csv", "rb") as f:
        response = client.post(
            "/api/predict",
            files=[("files", ("short_recording.csv", f, "text/csv"))]
        )
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["successful_files"] == 1
    assert data["summary"]["failed_files"] == 0
    res = data["results"][0]
    assert res["status"] == "success"
    assert res["prediction"] in {"ADHD", "Control"}
    assert res["total_windows"] == 1


def test_legacy_predict_adhd_endpoint():
    """Verify that existing POST /predict-adhd endpoint remains completely operational."""
    with open(FIXTURES_DIR / "v1p.csv", "rb") as f:
        response = client.post(
            "/predict-adhd",
            files=[("files", ("v1p.csv", f, "text/csv"))]
        )
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["successful_files"] == 1
    assert data["results"][0]["status"] == "success"


def test_predict_zip_with_companion_chan_mat():
    """Verify that a companion chan.mat file inside a ZIP is treated as metadata, not a failed EEG file."""
    import io
    import zipfile
    import scipy.io as sio
    import numpy as np

    # Build an in-memory zip containing d1.mat (signal) and chan.mat (channel labels)
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1. chan.mat with 19 channel names
        chan_buffer = io.BytesIO()
        channel_names = np.array(["Fp1", "Fp2", "F7", "F3", "Fz", "F4", "F8",
                                  "T3", "C3", "Cz", "C4", "T4", "T5", "P3",
                                  "Pz", "P4", "T6", "O1", "O2"], dtype=object)
        sio.savemat(chan_buffer, {"chan": channel_names})
        zf.writestr("data/chan.mat", chan_buffer.getvalue())

        # 2. d1.mat with 1280 samples and 19 channels
        d1_buffer = io.BytesIO()
        eeg_signal = np.random.randn(1280, 19).astype(np.float64)
        sio.savemat(d1_buffer, {"data": eeg_signal})
        zf.writestr("data/d1.mat", d1_buffer.getvalue())

    zip_buffer.seek(0)
    response = client.post(
        "/api/predict",
        files=[("files", ("figshare_sample.zip", zip_buffer.getvalue(), "application/zip"))]
    )
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["total_files"] == 1
    assert data["summary"]["successful_files"] == 1
    assert data["summary"]["failed_files"] == 0
    assert data["results"][0]["filename"] == "data\\d1.mat" or data["results"][0]["filename"] == "data/d1.mat"
    assert data["results"][0]["status"] == "success"

