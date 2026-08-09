import type {
  DeleteUserResponse,
  DetectFaceResponse,
  HealthResponse,
  LivenessResponse,
  RegisterResponse,
  UserListResponse,
  VerifyResponse,
} from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string };
    if (typeof body.detail === "string") {
      return body.detail;
    }
  } catch {
    // Fall through to generic message.
  }
  return `Request failed with status ${response.status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new ApiClientError(await parseError(response), response.status);
  }
  return (await response.json()) as T;
}

export async function healthCheck(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

export async function detectFace(image: Blob): Promise<DetectFaceResponse> {
  const formData = new FormData();
  formData.append("image", image, "frame.jpg");
  return request<DetectFaceResponse>("/detect-face", {
    method: "POST",
    body: formData,
  });
}

export async function registerUser(
  name: string,
  consent: boolean,
  image: Blob,
): Promise<RegisterResponse> {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("consent", String(consent));
  formData.append("image", image, "photo.jpg");
  return request<RegisterResponse>("/register", {
    method: "POST",
    body: formData,
  });
}

export interface LivenessFrames {
  openEyesBefore: Blob;
  closedEyes: Blob;
  openEyesAfter: Blob;
}

export async function checkLiveness(
  frames: LivenessFrames,
): Promise<LivenessResponse> {
  const formData = new FormData();
  formData.append("open_eyes_before", frames.openEyesBefore, "before.jpg");
  formData.append("closed_eyes", frames.closedEyes, "closed.jpg");
  formData.append("open_eyes_after", frames.openEyesAfter, "after.jpg");
  return request<LivenessResponse>("/liveness/check", {
    method: "POST",
    body: formData,
  });
}

export async function verifyUser(
  livenessToken: string,
  image: Blob,
): Promise<VerifyResponse> {
  const formData = new FormData();
  formData.append("liveness_token", livenessToken);
  formData.append("image", image, "verify.jpg");
  return request<VerifyResponse>("/verify", {
    method: "POST",
    body: formData,
  });
}

export async function getUsers(): Promise<UserListResponse> {
  return request<UserListResponse>("/users");
}

export async function deleteUser(userId: number): Promise<DeleteUserResponse> {
  return request<DeleteUserResponse>(`/users/${userId}`, {
    method: "DELETE",
  });
}

export { ApiClientError };

