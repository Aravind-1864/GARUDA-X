import os
import sys

# Add current directory to path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pattern_detector import calculate_combined_risk

# This module provides a pass-through to the combined risk calculator in pattern_detector.py
