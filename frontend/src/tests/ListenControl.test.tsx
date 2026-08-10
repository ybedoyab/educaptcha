import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../i18n/I18nContext";
import { ListenControl } from "../components/minigames/ListenControl";

describe("ListenControl", () => {
  const speak = vi.fn();
  const cancel = vi.fn();
  let lastUtterance: { text: string; lang: string } | null = null;

  beforeEach(() => {
    localStorage.removeItem("educaptcha-language");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    speak.mockClear();
    cancel.mockClear();
    lastUtterance = null;
    localStorage.removeItem("educaptcha-language");
  });

  function stubSpeech() {
    class FakeUtterance {
      text: string;
      lang = "";
      rate = 1;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
        lastUtterance = this;
      }
    }
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    vi.stubGlobal("speechSynthesis", { speak, cancel });
  }

  it("does not autoplay on mount", () => {
    stubSpeech();
    render(
      <I18nProvider>
        <ListenControl text="Hello verification" />
      </I18nProvider>,
    );
    expect(speak).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /listen|escuchar/i }),
    ).toBeInTheDocument();
  });

  it("click Listen calls speak() with en-US", async () => {
    stubSpeech();
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <ListenControl text="Check this photo" />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: /listen/i }));
    expect(speak).toHaveBeenCalledTimes(1);
    expect(lastUtterance?.lang).toBe("en-US");
    expect(lastUtterance?.text).toBe("Check this photo");
  });

  it("uses es-ES when language is Spanish", async () => {
    stubSpeech();
    localStorage.setItem("educaptcha-language", JSON.stringify("es"));
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <ListenControl text="Revisa esta foto" />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: /escuchar/i }));
    expect(lastUtterance?.lang).toBe("es-ES");
  });

  it("Stop calls cancel()", async () => {
    stubSpeech();
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <ListenControl text="Hello" />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: /listen/i }));
    await user.click(screen.getByRole("button", { name: /stop|detener/i }));
    expect(cancel).toHaveBeenCalled();
  });

  it("unmount calls cancel()", async () => {
    stubSpeech();
    const user = userEvent.setup();
    const { unmount } = render(
      <I18nProvider>
        <ListenControl text="Hello" />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: /listen/i }));
    cancel.mockClear();
    unmount();
    expect(cancel).toHaveBeenCalled();
  });

  it("text change cancels playback", async () => {
    stubSpeech();
    const user = userEvent.setup();
    const { rerender } = render(
      <I18nProvider>
        <ListenControl text="First" />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: /listen/i }));
    cancel.mockClear();
    rerender(
      <I18nProvider>
        <ListenControl text="Second" />
      </I18nProvider>,
    );
    expect(cancel).toHaveBeenCalled();
  });
});
