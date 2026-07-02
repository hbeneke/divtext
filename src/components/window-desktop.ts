import { clamp } from "@/clamp";
import { emit, on } from "@/events";
import type { TerminalWindow } from "@/components/terminal-window";

const WINDOW_WIDTH = 720;
const CASCADE = 28;

export class WindowDesktop extends HTMLElement {
  private idSeq = 0;
  private zSeq = 10;
  private spawnCount = 0;
  private cleanups: Array<() => void> = [];

  connectedCallback(): void {
    this.cleanups.push(
      on(this, "wm:focus", (e) => this.raise(e.target as TerminalWindow)),
      on(this, "wm:minimize", () => this.notifyChanged()),
      on(this, "wm:close", (e) => this.close(e.target as TerminalWindow)),
      on(document, "wm:spawn", () => this.spawn()),
      on(document, "wm:restore", (e) => this.restore(e.detail.id)),
    );
    this.spawn();
  }

  disconnectedCallback(): void {
    for (const off of this.cleanups) off();
    this.cleanups = [];
  }

  private spawn(): void {
    const win = document.createElement("terminal-window") as TerminalWindow;
    win.windowId = ++this.idSeq;

    const width = Math.min(WINDOW_WIDTH, this.clientWidth - 32);
    const baseLeft = Math.max(20, (this.clientWidth - width) / 2);
    const offset = (this.spawnCount % 8) * CASCADE;
    this.spawnCount++;

    this.appendChild(win);
    win.place(
      clamp(baseLeft + offset, 8, Math.max(8, this.clientWidth - width - 8)),
      clamp(56 + offset, 8, Math.max(8, this.clientHeight - 120)),
      width,
    );
    this.raise(win);
    win.focusPrompt();
  }

  private raise(win: TerminalWindow): void {
    win.raise(++this.zSeq);
  }

  private close(win: TerminalWindow): void {
    win.remove();
    this.notifyChanged();
  }

  private restore(id: number): void {
    const win = this.windows().find((w) => w.windowId === id);
    if (!win) return;
    win.show();
    this.raise(win);
    this.notifyChanged();
  }

  private windows(): TerminalWindow[] {
    return [...this.querySelectorAll<TerminalWindow>("terminal-window")];
  }

  private notifyChanged(): void {
    const minimized = this.windows()
      .filter((w) => w.isMinimized)
      .map((w) => ({ id: w.windowId, title: w.taskbarTitle }));
    emit(document, "wm:changed", minimized);
  }
}

if (!customElements.get("window-desktop")) {
  customElements.define("window-desktop", WindowDesktop);
}
