import { ICON_EXPAND } from "../icons";

export function terminalWindowTemplate(): string {
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
      <span data-role="title" class="text-[13px] text-muted truncate"></span>
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
