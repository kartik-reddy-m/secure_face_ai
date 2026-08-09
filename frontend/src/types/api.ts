export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HealthResponse {
  status: string;
}

export interface DetectFaceResponse {
  face_detected: boolean;
  face_count: number;
  faces: FaceBox[];
}

export interface RegisterResponse {
  id: number;
  name: string;
  registered: boolean;
}

export interface LivenessResponse {
  live: boolean;
  challenge: string;
  eye_states: boolean[];
  liveness_token: string | null;
  expires_in_seconds?: number;
}

export interface VerifyMatch {
  id: number;
  name: string;
}

export interface VerifyResponse {
  verified: boolean;
  match: VerifyMatch | null;
  similarity: number;
  threshold: number;
}

export interface ApiError {
  detail: string;
}

export interface RegisteredUser {
  id: number;
  name: string;
  created_at: string;
}

export interface UserListResponse {
  count: number;
  users: RegisteredUser[];
}

export interface DeleteUserResponse {
  id: number;
  deleted: boolean;
}

