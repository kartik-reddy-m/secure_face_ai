# 🔐 Face Verification with Anti-Spoof Detection

A real-time computer vision system that combines **face verification** with **anti-spoofing (liveness detection)** to determine whether a person is a genuine registered user or a presentation attack such as a photograph, video, or screen replay.

---

## 📌 Overview

Traditional face recognition systems can verify whether a face matches a registered identity, but they may be vulnerable to spoofing attacks.

For example, an attacker could present:

- 📷 A printed photograph
- 📱 A photograph displayed on a mobile phone
- 💻 A face displayed on a laptop/monitor
- 🎥 A replayed video

This project addresses this problem by combining:

**Face Detection + Face Verification + Anti-Spoof Detection**

The system first detects a face, checks whether it is a real face, and then verifies the identity of the person.

---

## 🎯 Objectives

The main objectives of this project are:

- Detect faces in real time.
- Extract facial features from detected faces.
- Generate face embeddings.
- Verify a person's identity against registered users.
- Detect presentation attacks and spoofing attempts.
- Prevent verification when a spoof is detected.
- Provide a real-time verification result.
- Store registered user information securely.
- Build a scalable backend and frontend architecture.

---

## 🧠 System Workflow

```text
                    ┌──────────────┐
                    │    Camera    │
                    └──────┬───────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Face Detection  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Face Alignment  │
                  └────────┬────────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
        ┌─────────────────┐  ┌─────────────────┐
        │ Anti-Spoofing   │  │ Face Embedding  │
        │    Detection    │  │   Generation    │
        └────────┬────────┘  └────────┬────────┘
                 │                    │
                 ▼                    ▼
          Real / Spoof          Face Embedding
                                      │
                                      ▼
                              ┌─────────────────┐
                              │ Similarity Check│
                              └────────┬────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │                           │
                         ▼                           ▼
                  ┌─────────────┐             ┌─────────────┐
                  │   Verified  │             │ Not Verified│
                  └─────────────┘             └─────────────┘

          If spoof detected:
                    ↓
             ❌ SPOOF DETECTED

---

## Development setup

The backend scaffold is ready. From the project root, create and activate a
virtual environment, install dependencies, and start the API:

```powershell
py -m venv backend/.venv
backend/.venv/Scripts/Activate.ps1
py -m pip install -r backend/requirements.txt
py -m uvicorn main:app --app-dir backend --reload
```

Then open `http://127.0.0.1:8000/docs` to view the interactive API docs, or
visit `http://127.0.0.1:8000/health` to confirm the service is running.

## Face detection API

`POST /detect-face` accepts one multipart form field named `image`. It returns
whether a face was detected, the number of faces, and a bounding box for each
detected face. Use the interactive docs at `http://127.0.0.1:8000/docs` to
upload a clear, front-facing photo and test the endpoint.
