import { renderWord } from "@/letters";
import { emit } from "@/events";
import { BaseWindow } from "@/components/base-window";
import { terminalBodyTemplate } from "@/components/terminal-window.template";

export class TerminalWindow extends BaseWindow {
  windowTitle = "user@divtext: ~";

  private input!: HTMLInputElement;
  private output!: HTMLElement;
  private tools!: HTMLElement;
  private currentWord = "";

  protected renderBody(host: HTMLElement): void {
    host.innerHTML = terminalBodyTemplate();

    this.input = host.querySelector('[data-role="input"]') as HTMLInputElement;
    this.output = host.querySelector('[data-role="output"]') as HTMLElement;
    this.tools = host.querySelector('[data-role="tools"]') as HTMLElement;

    this.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a")) return;
      if (window.getSelection()?.toString()) return;
      this.input.focus();
    });

    this.input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      const text = this.input.value.trim();
      if (!text) return;
      this.render(text);
      this.input.value = "";
    });

    this.onAction("view-code", () => {
      if (this.currentWord) emit(document, "wm:code", { word: this.currentWord });
    });
  }

  override focusPrompt(): void {
    this.input.focus();
  }

  // Short label for the taskbar — the typed word, without the shell prefix.
  override get taskbarTitle(): string {
    return this.currentWord || "~";
  }

  private render(text: string): void {
    this.currentWord = text;
    this.setTitle(`user@divtext: ~/${text}`);
    this.collapseIntro();
    this.output.replaceChildren(renderWord(text));
    this.animateCells();
    this.tools.classList.remove("hidden");
  }

  // Stagger a "draw" animation across every cell so the word builds up.
  private animateCells(): void {
    let i = 0;
    for (const cell of this.output.querySelectorAll<HTMLElement>("div div")) {
      if (cell.childElementCount > 0) continue; // only leaf cells
      cell.style.animationDelay = `${i++ * 6}ms`;
      cell.classList.add("divtext-draw");
    }
  }

  // Smoothly collapse the intro block the first time a word is rendered.
  private collapseIntro(): void {
    const intro = this.querySelector<HTMLElement>('[data-role="intro"]');
    if (!intro || intro.classList.contains("hidden")) return;
    intro.style.overflow = "hidden";
    intro.style.maxHeight = `${intro.scrollHeight}px`;
    requestAnimationFrame(() => {
      intro.style.transition = "max-height 300ms ease, opacity 300ms ease, margin 300ms ease";
      intro.style.maxHeight = "0";
      intro.style.opacity = "0";
      intro.style.marginBottom = "0";
    });
    intro.addEventListener("transitionend", () => intro.classList.add("hidden"), {
      once: true,
    });
  }
}

if (!customElements.get("terminal-window")) {
  customElements.define("terminal-window", TerminalWindow);
}
