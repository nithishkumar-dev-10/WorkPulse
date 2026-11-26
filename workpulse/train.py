"""Regenerate all model artifacts, thresholds and reports from the raw dataset.

Run from this directory with the project virtualenv:

    venv/bin/python train.py
"""

import logging

from src.train import run_training


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s - %(message)s",
    )
    run_training()
