type WindowState = "open" | "minimized" | "maximized";

interface Geometry {
    left: number;
    top: number;
    width: number;
}

interface TerminalWindow {
    id: number;
    el: HTMLElement;
    title: string;
    state: WindowState;
    /** Geometry saved before maximizing, restored on un-maximize. */
    restore: Geometry | null;
}

const desktop = document.getElementById("desktop") as HTMLDivElement;
const tabs = document.getElementById("tabs") as HTMLDivElement;
const newWindowBtn = document.getElementById("newWindow") as HTMLButtonElement;

const WINDOW_WIDTH = 720;
const CASCADE = 28;

// macOS-style diagonal arrows: outward = maximize, inward = restore
const ICON_EXPAND =
    '<svg viewBox="0 0 12 12" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5 L2 2"/><path d="M2 4.5 L2 2 L4.5 2"/><path d="M7 7 L10 10"/><path d="M10 7.5 L10 10 L7.5 10"/></svg>';
const ICON_COLLAPSE =
    '<svg viewBox="0 0 12 12" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2 L5 5"/><path d="M5 2.5 L5 5 L2.5 5"/><path d="M10 10 L7 7"/><path d="M7 9.5 L7 7 L9.5 7"/></svg>';

const windows: TerminalWindow[] = [];
let idSeq = 0;
let zSeq = 10;
let spawnCount = 0;

/** Builds the inner markup of a terminal window. */
function windowTemplate(title: string): string {
    return `
        <div data-role="bar" class="group/bar flex items-center gap-2 px-[14px] py-[11px] bg-bar border-b border-black/30 cursor-grab active:cursor-grabbing select-none">
            <button data-action="close" type="button" title="Close" aria-label="Close"
                class="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#ff5f56] text-[11px] font-bold leading-none text-black/70 cursor-pointer">
                <span class="opacity-0 group-hover/bar:opacity-100 transition-opacity">×</span>
            </button>
            <button data-action="minimize" type="button" title="Minimize" aria-label="Minimize"
                class="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#ffbd2e] text-[11px] font-bold leading-none text-black/70 cursor-pointer">
                <span class="opacity-0 group-hover/bar:opacity-100 transition-opacity">−</span>
            </button>
            <button data-action="maximize" type="button" title="Maximize" aria-label="Maximize"
                class="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#27c93f] text-[11px] font-bold leading-none text-black/70 cursor-pointer">
                <span data-role="maximize-glyph" class="flex opacity-0 group-hover/bar:opacity-100 transition-opacity">${ICON_EXPAND}</span>
            </button>
            <svg class="ml-2 block text-muted shrink-0" width="20" height="20" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <rect x="10" y="14" width="44" height="36" rx="4" stroke="currentColor" stroke-width="3" fill="none"/>
                <line x1="10" y1="24" x2="54" y2="24" stroke="currentColor" stroke-width="3"/>
                <path d="M17 32 L22 36 L17 40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <line x1="26" y1="40" x2="36" y2="40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <span data-role="title" class="text-[13px] text-muted truncate">${title}</span>
        </div>

        <div class="px-6 pt-[26px] pb-[30px] text-[15px] leading-[1.7]">
            <p class="whitespace-pre-wrap break-words"><span class="text-secondary select-none">$</span> divtext --help</p>
            <p class="whitespace-pre-wrap break-words"><span class="text-primary font-bold">DivText</span> <span class="text-muted">v1.0.1</span></p>
            <p class="whitespace-pre-wrap break-words">Turn your text into a logo built from <span class="text-primary">&lt;div&gt;</span> elements.</p>
            <p class="whitespace-pre-wrap break-words text-muted">Type a word and watch it draw itself, cell by cell.</p>
            <p class="whitespace-pre-wrap break-words">&nbsp;</p>
            <p class="whitespace-pre-wrap break-words"><span class="text-secondary select-none">$</span> divtext --run</p>

            <label class="flex items-center gap-2 mt-2 cursor-text whitespace-pre-wrap break-words">
                <span class="text-secondary select-none">&gt;</span>
                <input type="text" data-role="input"
                    class="flex-1 bg-transparent border-none outline-none text-fg font-[inherit] text-[inherit] caret-primary placeholder:text-muted"
                    placeholder="type here_" autocomplete="off" spellcheck="false">
            </label>

            <div data-role="output" class="mt-[18px] min-h-[80px]"></div>
        </div>
    `;
}

function bringToFront(win: TerminalWindow): void {
    win.el.style.zIndex = String(++zSeq);
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function currentWidth(): number {
    return Math.min(WINDOW_WIDTH, desktop.clientWidth - 32);
}

function renderTabs(): void {
    tabs.replaceChildren();
    for (const win of windows) {
        if (win.state !== "minimized") continue;
        const pill = document.createElement("button");
        pill.type = "button";
        pill.title = `Restore ${win.title}`;
        pill.className =
            "flex items-center gap-2 max-w-[180px] px-3 h-8 rounded-md bg-bar text-muted text-xs border border-white/[0.06] transition-colors hover:bg-white/[0.06] hover:text-fg cursor-pointer";
        pill.innerHTML = `<span class="w-2 h-2 rounded-full bg-secondary shrink-0"></span><span class="truncate">${win.title}</span>`;
        pill.addEventListener("click", () => restoreWindow(win));
        tabs.appendChild(pill);
    }
}

function closeWindow(win: TerminalWindow): void {
    win.el.remove();
    const i = windows.indexOf(win);
    if (i >= 0) windows.splice(i, 1);
    renderTabs();
}

function minimizeWindow(win: TerminalWindow): void {
    win.state = "minimized";
    win.el.classList.add("hidden");
    renderTabs();
}

function restoreWindow(win: TerminalWindow): void {
    win.state = win.restore ? "maximized" : "open";
    if (win.state === "maximized") applyMaximized(win);
    win.el.classList.remove("hidden");
    bringToFront(win);
    renderTabs();
}

function setMaximizeGlyph(win: TerminalWindow): void {
    const glyph = win.el.querySelector('[data-role="maximize-glyph"]') as HTMLElement | null;
    const btn = win.el.querySelector('[data-action="maximize"]') as HTMLElement | null;
    const maximized = win.state === "maximized";
    if (glyph) glyph.innerHTML = maximized ? ICON_COLLAPSE : ICON_EXPAND;
    if (btn) btn.title = maximized ? "Restore" : "Maximize";
}

function applyMaximized(win: TerminalWindow): void {
    const s = win.el.style;
    s.left = "8px";
    s.top = "8px";
    s.width = `${desktop.clientWidth - 16}px`;
    s.height = `${desktop.clientHeight - 16}px`;
    setMaximizeGlyph(win);
}

function toggleMaximize(win: TerminalWindow): void {
    if (win.state === "maximized") {
        // restore previous geometry
        const g = win.restore;
        win.restore = null;
        win.state = "open";
        if (g) {
            win.el.style.left = `${g.left}px`;
            win.el.style.top = `${g.top}px`;
            win.el.style.width = `${g.width}px`;
        }
        win.el.style.height = "";
        setMaximizeGlyph(win);
    } else {
        win.restore = {
            left: win.el.offsetLeft,
            top: win.el.offsetTop,
            width: win.el.offsetWidth,
        };
        win.state = "maximized";
        applyMaximized(win);
    }
}

function startDrag(win: TerminalWindow, bar: HTMLElement): void {
    bar.addEventListener("pointerdown", (e) => {
        if (win.state === "maximized") return;
        // ignore drags that start on the traffic-light buttons
        if ((e.target as HTMLElement).closest("[data-action]")) return;
        e.preventDefault();
        bringToFront(win);

        const startX = e.clientX;
        const startY = e.clientY;
        const originLeft = win.el.offsetLeft;
        const originTop = win.el.offsetTop;
        const maxLeft = desktop.clientWidth - win.el.offsetWidth;
        const maxTop = desktop.clientHeight - 40;

        const move = (ev: PointerEvent) => {
            const left = clamp(originLeft + (ev.clientX - startX), 0, Math.max(0, maxLeft));
            const top = clamp(originTop + (ev.clientY - startY), 0, Math.max(0, maxTop));
            win.el.style.left = `${left}px`;
            win.el.style.top = `${top}px`;
        };
        const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
    });
}

function createWindow(): TerminalWindow {
    const id = ++idSeq;
    const title = "user@divtext: ~";

    const el = document.createElement("section");
    el.className =
        "window absolute pointer-events-auto bg-term border border-white/[0.06] rounded-[10px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]";
    el.innerHTML = windowTemplate(title);

    const width = currentWidth();
    const baseLeft = Math.max(20, (desktop.clientWidth - width) / 2);
    const offset = (spawnCount % 8) * CASCADE;
    spawnCount++;
    el.style.width = `${width}px`;
    el.style.left = `${clamp(baseLeft + offset, 8, Math.max(8, desktop.clientWidth - width - 8))}px`;
    el.style.top = `${clamp(56 + offset, 8, Math.max(8, desktop.clientHeight - 120))}px`;
    el.style.zIndex = String(++zSeq);

    desktop.appendChild(el);

    const win: TerminalWindow = { id, el, title, state: "open", restore: null };
    windows.push(win);

    const bar = el.querySelector('[data-role="bar"]') as HTMLElement;
    el.addEventListener("pointerdown", () => bringToFront(win), true);
    startDrag(win, bar);

    el.querySelector('[data-action="close"]')!.addEventListener("click", () => closeWindow(win));
    el.querySelector('[data-action="minimize"]')!.addEventListener("click", () => minimizeWindow(win));
    el.querySelector('[data-action="maximize"]')!.addEventListener("click", () => toggleMaximize(win));

    const input = el.querySelector('[data-role="input"]') as HTMLInputElement;
    const output = el.querySelector('[data-role="output"]') as HTMLDivElement;

    // clicking anywhere in the window (except controls / while selecting text) focuses the prompt
    el.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button, a")) return;
        if (window.getSelection()?.toString()) return;
        input.focus();
    });
    input.addEventListener("input", (e) => {
        const text = (e.target as HTMLInputElement).value;
        // TODO: render the text logo here -> grid of divs.
        void text;
        void output;
    });
    input.focus();

    return win;
}

newWindowBtn.addEventListener("click", () => {
    const win = createWindow();
    bringToFront(win);
});

// spawn the first window
createWindow();
