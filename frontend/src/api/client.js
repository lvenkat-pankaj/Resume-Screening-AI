// API Client for Resume Screening

import axios from "axios";

// Use relative URL to leverage Vite's dev server proxy
const client = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const screenResume = async (resume, jobDescription = "") => {
  try {
    const response = await client.post("/api/screen", {
      resume,
      jobDescription,
    });

    if (!response.data || !response.data.success) {
      return {
        success: false,
        error: "INVALID_RESPONSE",
        message: "Invalid response from server",
      };
    }

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: "REQUEST_TIMEOUT",
        message: "Request took too long. Please try again with a shorter resume.",
      };
    }

    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || "SERVER_ERROR",
        code: error.response.data?.code,
        message: error.response.data?.message || getErrorMessage(error.response.status),
        detectedPII: error.response.data?.detectedPII,
        instruction: error.response.data?.instruction,
      };
    }

    if (error.message === 'Network Error') {
      return {
        success: false,
        error: "NETWORK_ERROR",
        message: "Failed to connect to server. Please check your internet connection.",
      };
    }

    return {
      success: false,
      error: "UNKNOWN_ERROR",
      message: "An unexpected error occurred. Please try again.",
    };
  }
};

function getErrorMessage(status) {
  switch (status) {
    case 400:
      return "Invalid request. Please check your resume format.";
    case 408:
      return "Request timeout. Server took too long to respond.";
    case 500:
      return "Server error. Please try again later.";
    case 503:
      return "Service temporarily unavailable. Please try again in a moment.";
    default:
      return "An error occurred. Please try again.";
  }
}

export default client;
