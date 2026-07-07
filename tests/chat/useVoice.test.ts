import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useVoice } from "@modules/chat/hooks/useVoice";

// Mock SpeechRecognition
const mockStart = vi.fn();
const mockStop = vi.fn();

class MockSpeechRecognition {
  lang = "";
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
  onresult: ((e: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  start = mockStart;
  stop = mockStop;
}

Object.defineProperty(window, "SpeechRecognition", {
  value: MockSpeechRecognition,
  writable: true,
});

describe("useVoice", () => {
  beforeEach(() => {
    mockStart.mockReset();
    mockStop.mockReset();
  });

  it("should detect SpeechRecognition support", () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.isSupported).toBe(true);
  });

  it("should not be listening initially", () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.isListening).toBe(false);
  });

  it("should start listening on startListening", async () => {
    const { result } = renderHook(() => useVoice());

    await act(async () => {
      await result.current.startListening();
    });

    expect(mockStart).toHaveBeenCalled();
    expect(result.current.isListening).toBe(true);
  });

  it("should stop listening on stopListening", async () => {
    const { result } = renderHook(() => useVoice());

    await act(async () => {
      await result.current.startListening();
    });

    act(() => {
      result.current.stopListening();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);
  });

  it("should toggle TTS", () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.ttsEnabled).toBe(false);

    act(() => {
      result.current.toggleTts();
    });

    expect(result.current.ttsEnabled).toBe(true);
  });

  it("should have no error initially", () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.error).toBeNull();
  });
});
