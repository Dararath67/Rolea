import os
import sys

# Add working directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from backend.app.main import app as application
