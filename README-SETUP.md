# Learn ML

---

## ⚙️ Setup Instructions

This project uses **Poetry** for dependency management and currently requires **Python 3.11 to 3.14**
(`>=3.11,<=3.14`). Use Python 3.11 unless you intentionally target another supported version.

### 1. Install Python

#### Mac OS

Install Python 3.11 using Homebrew:

```bash
brew install python@3.11
```

List installed Python versions on Mac OS when using Homebrew:

```bash
brew list | grep python
```

#### Windows

Close IDEs and terminals that may already be using Python, such as PyCharm or VS Code.

Install the official [Python install manager for Windows](https://www.python.org/downloads/latest/pymanager/).

After installation, open a new PowerShell window and verify the Python launcher:

```powershell
py --version
py list --online
```

Install Python 3.11:

```powershell
py install 3.11
```

Verify that Python 3.11 is installed:

```powershell
py -3.11 --version
py list
```

Example output:

```text
Python 3.10.11

Tag           Name            Managed By  Version  Alias
3.14[-64]  *  Python 3.14.4   PythonCore  3.14.4   python3[-64].exe, python3.14[-64].exe
3.10[-64]     Python 3.10.11  PythonCore  3.10.11  python3.10.exe
```

### 2. Install Poetry

#### Mac OS

```bash
python3.11 -m pip install --upgrade pip
python3.11 -m pip install poetry
poetry --version
```

or simply (for all python versions)

```bash
pip install poetry
```

#### Windows

Install Poetry using Python 3.11:

```powershell
py -3.11 -m pip install --upgrade pip
py -3.11 -m pip install poetry
py -3.11 -m poetry --version
```

If Poetry is also available on PATH, this should work too:

```powershell
poetry --version
```

### 3. Configure Poetry Python Version

Run this from the project root.

#### Mac OS

```bash
poetry env use python3.11
poetry run python --version
```

#### Windows

Because `py` may default to a newer Python version, explicitly run Poetry through Python 3.11:

```powershell
py -3.11 -m poetry env use 3.11
py -3.11 -m poetry run python --version
```

### 4. Verify Environment

Check that the correct Python version is being used:

#### Mac OS

```bash
poetry env info
```

#### Windows

```powershell
py -3.11 -m poetry env info
```

### 5. Install Dependencies

Install all project dependencies defined in `pyproject.toml`:

#### Mac OS

```bash
poetry install
```

#### Windows

```powershell
py -3.11 -m poetry install
```

### 6. Windows NVIDIA / CUDA PyTorch Setup

For Windows machines with an NVIDIA GPU, first verify that the NVIDIA driver is available:

```powershell
nvidia-smi
```

For RTX machines, force-install the CUDA 12.8 PyTorch wheels inside Poetry's environment using the repo's current Torch
family:

```powershell
py -3.11 -m poetry run python -m pip install --upgrade --force-reinstall torch==2.10.0 torchvision==0.25.0 torchaudio==2.10.0 --index-url https://download.pytorch.org/whl/cu128
```

Use `cu128` first. PyTorch may list newer CUDA wheels, but do not switch beyond the repo's current pins unless CUDA 12.8
fails.

Verify GPU access:

```powershell
py -3.11 -m poetry run python -c "import torch; print(torch.__version__); print(torch.version.cuda); print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0))"
```

Expected output should show a CUDA-enabled Torch build, CUDA availability as `True`, and your NVIDIA GPU name.

Expected output on an RTX 5090 machine:

```text
2.9.1+cu128
12.8
True
NVIDIA GeForce RTX 5090
```

After the Poetry environment is configured, regular Poetry commands can usually be run as `poetry ...` if Poetry is on
PATH.
If Windows uses the wrong Python version, keep using `py -3.11 -m poetry ...`.

### 7. Adding Dependencies

To add new packages to your project:

```bash
poetry add <package-name>
```

For development dependencies:

```bash
poetry add --group dev <package-name>
```

### 8. Exporting Dependencies

To export your dependencies to `requirements.txt` (if needed for compatibility):

```bash
poetry export -f requirements.txt --output requirements.txt --without-hashes
```

### 9. Run Python File (Example)

```bash
poetry run python scripts/resize_image.py
```

On Windows, if needed:

```powershell
py -3.11 -m poetry run python scripts/resize_image.py
```

### 10. Initialize Poetry Project

Only use this when starting a new project from scratch. This project already has `pyproject.toml`.

```bash
poetry init
```

Follow the interactive prompts to set up your `pyproject.toml` file.

### 11. Notes

> See also: [Poetry vs PyCharm Virtual Environment Handling](#poetry-vs-pycharm-virtual-environment-handling)
> and [Refresh Environment](#refresh-environment)

---

## 🗂️ Project Structure

### ⚠️ Note About .DS_Store on macOS

macOS creates hidden .DS_Store files when you open folders in Finder. These files are not
images or labels, and if they
appear inside images/ or labels/, they can:

* Trigger “invalid extension” errors
* Break folder scans or file counting
* Cause image–label mismatches in custom scripts

Some tools ignore them, but it is safest to remove them.

**🔍 Dataset Sanity Check**

List each subdirectory and the number of files it contains (non-recursive per directory):

```
find . -type d -print0 | xargs -0 -I {} sh -c 'count=$(find "{}" -maxdepth 1 -type f | wc -l); echo "$count  {}"'
```

List All Unique File Extensions (recursive):

```
find . -type f -name "*.*" | sed 's/.*\.//' | sort -u
```

**🧹 Remove Them (Recommended)**

Delete everywhere inside the dataset:

```
find . -name ".DS_Store" -type f -delete
```

---

<!-- NOTE: Below line is linked by internal anchors. -->

## ⚙️ Poetry vs PyCharm Virtual Environment Handling

Poetry normally creates virtual environments in a central internal location, not inside your project folder.
PyCharm, however, expects a project-local .venv interpreter unless you manually point it to Poetry’s environment.

If you create an environment through PyCharm and another through Poetry, they will be two different environments,
leading to mismatched packages and scripts failing to run.

To avoid this, keep PyCharm and Poetry using the same .venv by enabling Poetry’s in-project virtualenvs or by manually
configuring PyCharm to use Poetry’s environment.

To keep both tools in sync, configure Poetry to always create the environment inside the project:

```
poetry config virtualenvs.in-project true
```

This ensures Poetry creates .venv in your project root, allowing PyCharm to automatically detect and use the same
interpreter.

To verify if Poetry creates the virtual environment inside your project, run:

```
poetry config virtualenvs.in-project
```

* If it returns true, your project is already using .venv correctly.

* If it returns false or nothing, enable in-project environments

You can also confirm by checking the active environment path:

```
poetry env info --path
```

If the path includes your project folder’s .venv, everything is correctly configured.

> Refer to the [Hard refresh](#2-hard-refresh) for steps that may resolve issues between Poetry and PyCharm
> environments


---

<!-- NOTE: Below line is linked by internal anchors. -->

## 🔄 Refresh Environment

### 1. Light refresh

When you change pyproject.toml, Poetry does NOT automatically reinstall anything. To refresh the environment cleanly,
you have to reset depending on how deep you want the cleanup to be.

**Run:**

```
poetry lock
poetry install
```

**This will:**

* Recalculate versions
* Update poetry.lock
* Install/uninstall changed dependencies

This is enough if your environment isn’t corrupted.

<!-- NOTE: Below line is linked by internal anchors. -->

### 2. Hard refresh

Use this when your Poetry environment becomes corrupted, PyCharm is using the wrong interpreter, or dependencies are not
resolving correctly.

This process completely resets the virtual environment and installs everything from scratch.

#### Step 1 — Deactivate any active venv

If you see an active environment name in your terminal, deactivate it:

```
deactivate
```

#### Step 2 — Remove the existing virtual environment

Poetry may not always remove environments by Python version name, so the safest option is to delete the .venv folder
manually:

```
rm -rf .venv
```

#### Step 3 — Use a Python environment

```
poetry env use python3.11
```

#### Step 4 — Reinstall dependencies from scratch

Poetry will automatically recreate the virtual environment using the correct Python version (based on your
pyproject.toml constraints):

```
poetry install
```

#### Step 5 — Activate the new Poetry environment

Poetry 2.0 removed the poetry shell command unless you install a plugin.
Use the recommended new command:

```
poetry env activate
```

This prints a command like:

```
source /path/to/project/.venv/bin/activate
```

Copy and run that command:

```
source /path/to/project/.venv/bin/activate
```

#### Step 6 — Verify environment & packages

Test that Python and all required libs are correctly installed:

```
python -c "import torch, numpy, pandas; print(torch.__version__, numpy.__version__, pandas.__version__)"
```

Expected output should match the versions Poetry installed, e.g.:

```
2.10.0 1.26.4 2.3.3
```

You can also test a single package:

```
python -c "import numpy as np; print(np.__version__)"
```

**You now have:**

* A clean .venv
* Correct Python version
* Packages installed correctly
* Poetry + PyCharm back in sync

---

## ⚙️ IDE Configurations

### 1. PyCharm

**Disable AI Inline Auto-Completion:**

---

## 🧰 Helpful Tools

### 1. Image Color Picker

[Image Color Picker](https://imagecolorpicker.com/) is used for segmentation mask labeling to extract exact HEX, RGB,
and HSV color values for different classes and objects.

---

## 🛠️ Issues Fixed

This section lists previous incorrect assumptions and how they were corrected.

### 1. Jupyter Images Look Wrong in Dark Mode (PyCharm)

When using Jupyter Notebook inside PyCharm with a dark theme, images displayed using matplotlib may appear blended,
muted, or strangely tinted.
This can look like colors are changing or mixing with the dark background.

**Fix:**

`PyCharm > Preferences > Languages & Frameworks > Jupyter > (untick) Invert image outputs for dark themes`

### 2. Scrolling Lag in Jupyter Notebooks

The **Sticky Lines** feature pins the headers of code blocks (like class, def, or if statements) to the top of the
editor as you scroll. This provides constant context by showing you exactly which function or scope you are currently
working in, even in very long files.

If you experience lagging or rendering issues while scrolling over long cells, disabling this feature for notebooks
typically resolves the conflict.

**Fix:**

`File > Settings > Editor > General > Sticky Lines > Uncheck the box for Jupyter`

---
