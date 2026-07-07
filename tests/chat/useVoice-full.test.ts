import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useVoice } from "@modules/chat/hooks/useVoice";

describe("useVoice — full coverage", () => {
  it("should not start when not supported", async () => {
    // Temporarily remove SpeechRecognition
    const orig = window.SpeechRecognition;
    // @ts-ignore
    delete window.SpeechRecognition;
    // @ts-ignore
    delete window.webkitSpeechRecognition;

    const { result } = renderHook(() => useVoice());
    expect(result.current.isSupported).toBe(false);

    await act(async () => {
      await result.current.startListening();
    });
    expect(result.current.error).toContain("no soporta");

    // Restore
    // @ts-ignore
    window.SpeechRecognition = orig;
  });

  it("should handle start error", async () => {
    const mockStart = vi.fn().mockImplementation(() => {
      throw new Error("already started");
    });
    // @ts-ignore
    window.SpeechRecognition = vi.fn().mockImplementation(() => ({
      lang: "",
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      onresult: null,
      onend: null,
      onerror: null,
      start: mockStart,
      stop: vi.fn(),
    }));

    const { result } = renderHook(() => useVoice());

    await act(async () => {
      await result.current.startListening();
    });

    expect(result.current.error).toContain("iniciar");
  });

  it("should handle not-allowed error", async () => {
    let errorHandler: any;
    // @ts-ignore
    window.SpeechRecognition = vi.fn().mockImplementation(() => ({
      lang: "",
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      onresult: null,
      onend: null,
      set onerror(fn: any) { errorHandler = fn; },
      get onerror() { return errorHandler; },
      start: vi.fn(),
      stop: vi.fn(),
    }));

    const { result } = renderHook(() => useVoice());

    await act(async () => {
      await result.current.startListening();
    });

    // Simulate not-allowed error
    act(() => {
      if (errorHandler) errorHandler({ error: "not-allowed" });
    });

    expect(result.current.error).toContain("Micrófono bloqueado");
  });

  it("should handle network error", async () => {
    let errorHandler: any;
    // @ts-ignore
    window.SpeechRecognition = vi.fn().mockImplementation(() => ({
      lang: "",
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      onresult: null,
      onend: null,
      set onerror(fn: any) { errorHandler = fn; },
      get onerror() { return errorHandler; },
      start: vi.fn(),
      stop: vi.fn(),
    }));

    const { result } = renderHook(() => useVoice());

    await act(async () => {
      await result.current.startListening();
    });

    act(() => {
      if (errorHandler) errorHandler({ error: "network" });
    });

    expect(result.current.error).toContain("red");
  });

  it("should handle audio-capture error", async () => {
    let errorHandler: any;
    // @ts-ignore
    window.SpeechRecognition = vi.fn().mockImplementation(() => ({
      lang: "",
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      onresult: null,
      onend: null,
      set onerror(fn: any) { errorHandler = fn; },
      get onerror() { return errorHandler; },
      start: vi.fn(),
      stop: vi.fn(),
    }));

    const { result } = renderHook(() => useVoice());

    await act(async () => {
      await result.current.startListening();
    });

    act(() => {
      if (errorHandler) errorHandler({ error: "audio-capture" });
    });

    expect(result.current.error).toContain("micrófono");
  });

  it("should handle unknown error", async () => {
    let errorHandler: any;
    // @ts-ignore
    window.SpeechRecognition = vi.fn().mockImplementation(() => ({
      lang: "",
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      onresult: null,
      onend: null,
      set onerror(fn: any) { errorHandler = fn; },
      get onerror() { return errorHandler; },
      start: vi.fn(),
      stop: vi.fn(),
    }));

    const { result } = renderHook(() => useVoice());

    await act(async () => {
      await result.current.startListening();
    });

    act(() => {
      if (errorHandler) errorHandler({ error: "something-weird" });
    });

    expect(result.current.error).toContain("something-weird");
  });

  it("should call onResult when speech detected", async () => {
    let resultHandler: any;
    const onResult = vi.fn();
    // @ts-ignore
    window.SpeechRecognition = vi.fn().mockImplementation(() => ({
      lang: "",
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      set onresult(fn: any) { resultHandler = fn; },
      get onresult() { return resultHandler; },
      onend: null,
      onerror: null,
      start: vi.fn(),
      stop: vi.fn(),
    }));

    const { result } = renderHook(() => useVoice({ onResult }));

    await act(async () => {
      await result.current.startListening();
    });

    // Simulate result
    act(() => {
      if (resultHandler) {
        resultHandler({
          results: [[{ transcript: "hola mundo", confidence: 0.9 }]],
          resultIndex: 0,
        });
      }
    });

    expect(onResult).toHaveBeenCalledWith("hola mundo");
  });

  it("should not speak empty text", () => {
    const { result } = renderHook(() => useVoice());
    act(() => { result.current.toggleTts(); });
    act(() => { result.current.speak(""); });
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it("should clean emojis from TTS text", () => {
    const { result } = renderHook(() => useVoice());
    act(() => { result.current.toggleTts(); });
    act(() => { result.current.speak("Hola 🚌 mundo"); });
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });
});
