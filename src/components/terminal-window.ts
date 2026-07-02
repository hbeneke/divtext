import { clamp } from "@/clamp";
import { formatHtml, renderWord } from "@/letters";
import { emit } from "@/events";
import { ICON_COLLAPSE, ICON_EXPAND } from "@/icons";
import { terminalWindowTemplate } from "@/components/terminal-window.template";

type WindowState = "open" | "minimized" | "maximized";

interface Geometry {
  left: number;
  top: number;
  width: number;
}

export class TerminalWindow extends HTMLElement {
  windowId = 0;
  windowTitle = "user@divtext: ~";

  private state: WindowState = "open";
  private restore: Geometry | null = null;
  private input!: HTMLInputElement;
  private output!: HTMLElement;
  private tools!: HTMLElement;
  private code!: HTMLElement;
  private built = false;

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;

    this.className =
      "window absolute pointer-events-auto bg-term border border-white/[0.06] rounded-[10px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]";
    this.innerHTML = terminalWindowTemplate();

    const bar = this.querySelector('[data-role="bar"]') as HTMLElement;
    const title = this.querySelector('[data-role="title"]') as HTMLElement;
    this.input = this.querySelector('[data-role="input"]') as HTMLInputElement;
    this.output = this.querySelector('[data-role="output"]') as HTMLElement;
    this.tools = this.querySelector('[data-role="tools"]') as HTMLElement;
    this.code = this.querySelector('[data-role="code"]') as HTMLElement;

    title.textContent = this.windowTitle;

    this.addEventListener("pointerdown", () => emit(this, "wm:focus"), true);
    this.enableDrag(bar);

    this.onAction("close", () => emit(this, "wm:close"));
    this.onAction("minimize", () => {
      this.hide();
      emit(this, "wm:minimize");
    });
    this.onAction("maximize", () => this.toggleMaximize());

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

    this.onAction("view-html", () => this.toggleCode());
    this.onAction("copy-html", (el) => this.copyHtml(el));
  }

  private render(text: string): void {
    const word = renderWord(text);
    this.output.replaceChildren(word);
    this.code.textContent = formatHtml(word);
    this.code.classList.add("hidden");
    this.setViewLabel(false);
    this.tools.classList.remove("hidden");
  }

  private toggleCode(): void {
    const shown = this.code.classList.toggle("hidden");
    this.setViewLabel(!shown);
  }

  private setViewLabel(shown: boolean): void {
    const button = this.querySelector('[data-action="view-html"]');
    if (button) button.textContent = shown ? "Hide HTML" : "View HTML";
  }

  private async copyHtml(button: HTMLElement): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code.textContent ?? "");
      const original = button.textContent;
      button.textContent = "Copied!";
      setTimeout(() => (button.textContent = original), 1200);
    } catch {
      // Clipboard blocked (e.g. insecure context) — reveal the code to copy manually.
      this.code.classList.remove("hidden");
      this.setViewLabel(true);
    }
  }

  get isMinimized(): boolean {
    return this.state === "minimized";
  }

  place(left: number, top: number, width: number): void {
    this.style.left = `${left}px`;
    this.style.top = `${top}px`;
    this.style.width = `${width}px`;
  }

  raise(zIndex: number): void {
    this.style.zIndex = String(zIndex);
  }

  focusPrompt(): void {
    this.input.focus();
  }

  hide(): void {
    this.state = "minimized";
    this.classList.add("hidden");
  }

  show(): void {
    this.state = this.restore ? "maximized" : "open";
    if (this.state === "maximized") this.applyMaximized();
    this.classList.remove("hidden");
  }

  private get area(): HTMLElement {
    return this.closest("window-desktop") as HTMLElement;
  }

  private onAction(name: string, handler: (el: HTMLElement) => void): void {
    const el = this.querySelector(`[data-action="${name}"]`) as HTMLElement;
    el.addEventListener("click", () => handler(el));
  }

  private toggleMaximize(): void {
    if (this.state === "maximized") {
      const previous = this.restore;
      this.restore = null;
      this.state = "open";
      if (previous) {
        this.style.left = `${previous.left}px`;
        this.style.top = `${previous.top}px`;
        this.style.width = `${previous.width}px`;
      }
      this.style.height = "";
      this.setMaximizeGlyph();
    } else {
      this.restore = {
        left: this.offsetLeft,
        top: this.offsetTop,
        width: this.offsetWidth,
      };
      this.state = "maximized";
      this.applyMaximized();
    }
  }

  private applyMaximized(): void {
    const { clientWidth, clientHeight } = this.area;
    this.style.left = "8px";
    this.style.top = "8px";
    this.style.width = `${clientWidth - 16}px`;
    this.style.height = `${clientHeight - 16}px`;
    this.setMaximizeGlyph();
  }

  private setMaximizeGlyph(): void {
    const glyph = this.querySelector('[data-role="maximize-glyph"]');
    const button = this.querySelector('[data-action="maximize"]') as HTMLElement | null;
    const maximized = this.state === "maximized";
    if (glyph) glyph.innerHTML = maximized ? ICON_COLLAPSE : ICON_EXPAND;
    if (button) button.title = maximized ? "Restore" : "Maximize";
  }

  private enableDrag(bar: HTMLElement): void {
    bar.addEventListener("pointerdown", (e) => {
      if (this.state === "maximized") return;
      if ((e.target as HTMLElement).closest("[data-action]")) return;
      e.preventDefault();
      emit(this, "wm:focus");

      const startX = e.clientX;
      const startY = e.clientY;
      const originLeft = this.offsetLeft;
      const originTop = this.offsetTop;
      const maxLeft = this.area.clientWidth - this.offsetWidth;
      const maxTop = this.area.clientHeight - 40;

      const move = (ev: PointerEvent) => {
        this.style.left = `${clamp(originLeft + (ev.clientX - startX), 0, Math.max(0, maxLeft))}px`;
        this.style.top = `${clamp(originTop + (ev.clientY - startY), 0, Math.max(0, maxTop))}px`;
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }
}

if (!customElements.get("terminal-window")) {
  customElements.define("terminal-window", TerminalWindow);
}
