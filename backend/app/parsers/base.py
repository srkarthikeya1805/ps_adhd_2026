from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np


@dataclass
class EEGRecording:
    """Standard internal representation for any parsed EEG file."""
    data: np.ndarray  # Shape: (samples, channels) as float64
    sampling_rate: Optional[float] = None
    channel_names: Optional[List[str]] = None
    source_format: str = ""
    file_name: str = ""
    original_shape: Tuple[int, ...] = field(default_factory=tuple)
    warnings: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if not self.original_shape and isinstance(self.data, np.ndarray):
            self.original_shape = tuple(self.data.shape)
        if self.warnings is None:
            self.warnings = []
        if self.metadata is None:
            self.metadata = {}
