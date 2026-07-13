# Project Setup Guide

## Prerequisites

- Windows PowerShell (Administrator access)
- Python installed on your system

## Installation Steps

### 1. Clone the Repository

Clone the repository using the GitHub link.

### 2. Install Poetry

Open Windows PowerShell **as Administrator** and run the following command:

```powershell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -
```

### 3. Configure Environment Variables

After a successful installation, a path will be displayed, similar to:

```
C:\Users\<YourUsername>\AppData\Roaming\Python\Scripts
```

Add this path to your system's **Environment Variables**.

### 4. Restart PowerShell and IDE

Close PowerShell and restart your IDE for the changes to take effect.

### 5. Verify Poetry Installation

Open your IDE and confirm the installation by checking the Poetry version:

```powershell
poetry --version
```

### 6. Install Dependencies

Run the following command to install all required packages and libraries for the project:

```powershell
poetry install
```

### 7. Select the Interpreter

Run any `.py` or `.ipynb` file in the project. You will be prompted to select an interpreter. Choose **Local Interpreter
** which is the Poetry environment. It should be pre-loaded and available as an option.

### 8. Wait for Interpreter Setup

Allow time for the Python interpreter to finish updating.

### 9. Restart and Run

Restart your IDE and run the project.
