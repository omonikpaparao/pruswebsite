"""
Setup script to download required NLTK data for PRUS recommendation system
"""
import nltk

print("Downloading NLTK data...")

# Download required NLTK packages
packages = [
    'punkt',
    'averaged_perceptron_tagger',
    'brown',
    'punkt_tab',
    'wordnet',
    'averaged_perceptron_tagger_eng',
    'conll2000',
    'movie_reviews'
]

for package in packages:
    try:
        nltk.download(package, quiet=True)
        print(f"✓ Downloaded {package}")
    except Exception as e:
        print(f"✗ Failed to download {package}: {e}")

print("\nNLTK setup complete!")
