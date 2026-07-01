import { emit, on, type MinimizedWindow } from "@/events";

export class DesktopTaskbar extends HTMLElement {
  private tabs!: HTMLElement;
  private cleanups: Array<() => void> = [];

  connectedCallback(): void {
    this.innerHTML = `
      <div data-role="tabs" class="flex items-center gap-2"></div>
      <button data-role="new" type="button" title="New window" aria-label="New window"
        class="flex items-center justify-center w-8 h-8 rounded-md bg-bar text-muted text-lg leading-none border border-white/[0.06] transition-colors hover:bg-white/[0.06] hover:text-fg cursor-pointer">+</button>
    `;

    this.tabs = this.querySelector('[data-role="tabs"]') as HTMLElement;
    this.querySelector('[data-role="new"]')!.addEventListener("click", () =>
      emit(document, "wm:spawn"),
    );
    this.cleanups.push(on(document, "wm:changed", (e) => this.render(e.detail)));
  }

  disconnectedCallback(): void {
    for (const off of this.cleanups) off();
    this.cleanups = [];
  }

  private render(windows: MinimizedWindow[]): void {
    this.tabs.replaceChildren(...windows.map((win) => this.pill(win)));
  }

  private pill(win: MinimizedWindow): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.title = `Restore ${win.title}`;
    button.className =
      "flex items-center gap-2 max-w-[180px] px-3 h-8 rounded-md bg-bar text-muted text-xs border border-white/[0.06] transition-colors hover:bg-white/[0.06] hover:text-fg cursor-pointer";

    const dot = document.createElement("span");
    dot.className = "w-2 h-2 rounded-full bg-secondary shrink-0";

    const label = document.createElement("span");
    label.className = "truncate";
    label.textContent = win.title;

    button.append(dot, label);
    button.addEventListener("click", () => emit(document, "wm:restore", { id: win.id }));
    return button;
  }
}

if (!customElements.get("desktop-taskbar")) {
  customElements.define("desktop-taskbar", DesktopTaskbar);
}
