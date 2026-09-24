import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import React from "react";
import InterviewPage from "@/pages/interview/InterviewPage";
import { sessionsApi } from "@/services/sessions";

// Mock hardware check and audio hooks to avoid real media/web audio calls in JSDOM
vi.mock("@/components/HardwareCheck", () => ({
    default: () => (
        <div data-testid="hardware-check">
            <span>Hardware Check Ready</span>
        </div>
    ),
}));

vi.mock("@/hooks/useAudioCapture", () => ({
    useAudioCapture: () => ({
        isCapturing: false,
        startCapture: vi.fn(),
        stopCapture: vi.fn(),
        volume: 0,
    }),
}));

vi.mock("@/hooks/useAudioPlayback", () => ({
    useAudioPlayback: () => ({
        playChunk: vi.fn(),
        stopPlayback: vi.fn(),
        scheduleAfterPlayback: vi.fn((cb) => cb()),
        waitForDrain: vi.fn((cb) => cb()),
        cancelDrain: vi.fn(),
        isPlaying: false,
    }),
}));

vi.mock("@/hooks/useAudioWebSocket", () => ({
    useAudioWebSocket: () => ({
        connect: vi.fn(),
        send: vi.fn(),
        sendJson: vi.fn(),
        disconnect: vi.fn(),
        connectionState: "disconnected",
    }),
}));

describe("InterviewPage Characterization", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("characterizes GAP P3-5: invalid invite token displays Interview Complete screen instead of error", async () => {
        // When token is invalid, getCandidateInfo rejects with 404
        vi.spyOn(sessionsApi, "getCandidateInfo").mockRejectedValue(new Error("Invalid token"));

        render(
            <MemoryRouter initialEntries={["/interview/invalid-token-123"]}>
                <Routes>
                    <Route path="/interview/:token" element={<InterviewPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Catch block sets interviewState to 'complete'
        await waitFor(() => {
            expect(screen.getByText(/Interview Complete/i)).toBeInTheDocument();
        });
    });

    it("displays hardware check when token is valid and session is pending", async () => {
        vi.spyOn(sessionsApi, "getCandidateInfo").mockResolvedValue({
            data: {
                session_id: 101,
                session_status: "pending",
                role_title: "Senior Fullstack Engineer",
                time_limit_min: 45,
            },
        } as any);

        render(
            <MemoryRouter initialEntries={["/interview/valid-token-101"]}>
                <Routes>
                    <Route path="/interview/:token" element={<InterviewPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Senior Fullstack Engineer")).toBeInTheDocument();
            expect(screen.getByTestId("hardware-check")).toBeInTheDocument();
        });
    });

    it("displays Interview Complete directly when session status is already ended", async () => {
        vi.spyOn(sessionsApi, "getCandidateInfo").mockResolvedValue({
            data: {
                session_id: 102,
                session_status: "ended",
                role_title: "Senior Fullstack Engineer",
                time_limit_min: 45,
            },
        } as any);

        render(
            <MemoryRouter initialEntries={["/interview/already-ended-token"]}>
                <Routes>
                    <Route path="/interview/:token" element={<InterviewPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Interview Complete/i)).toBeInTheDocument();
        });
    });
});
