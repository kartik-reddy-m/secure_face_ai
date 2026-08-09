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

Create and use the project virtual environment:

```powershell
python -m venv backend/.venv
.\backend\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
python -m uvicorn main:app --app-dir backend --reload
```

Then open `http://127.0.0.1:8000/docs` to view the interactive API docs, or
visit `http://127.0.0.1:8000/health` to confirm the service is running.

## User Management API

`GET /users` returns all registered user profiles with summary metadata (`id`, `name`, `created_at`).
`DELETE /users/{user_id}` deletes a registered user profile and its biometric descriptor from the database.

## Automated Testing

Run the backend Pytest suite to verify system endpoints, input validation, and liveness token security:

```powershell
.\backend\.venv\Scripts\Activate.ps1
pytest backend/tests
```

## Face detection API

`POST /detect-face` accepts one multipart form field named `image`. It returns
whether a face was detected, the number of faces, and a bounding box for each
detected face. Use the interactive docs at `http://127.0.0.1:8000/docs` to
upload a clear, front-facing photo and test the endpoint.

## Registration API

`POST /register` accepts `name`, `consent`, and `image` form fields. It accepts
only one detectable face, creates a 512-value face descriptor, and
stores it locally in SQLite. The current descriptor is a learning-prototype
baseline, not a production biometric model; replace it with a validated model
before any real-world security use. Register only people who have explicitly
consented to biometric processing.

## Verification API

`POST /verify` accepts one `image` field, requires exactly one detected face,
and compares its descriptor with locally registered users. The endpoint returns
a match only when its cosine-similarity score is at least `0.80`. This threshold
is a prototype setting and must be measured and tuned with appropriate data
before any real-world use.

## Liveness API

`POST /liveness/check` accepts three image fields: `open_eyes_before`,
`closed_eyes`, and `open_eyes_after`. A successful blink check returns a
single-use token valid for two minutes. Supply this token as `liveness_token`
when calling `POST /verify`; verification is otherwise rejected.

This blink challenge is a learning prototype, not robust anti-spoofing. It can
be bypassed by replayed video and must be replaced by a validated presentation-
attack-detection model before deployment.

