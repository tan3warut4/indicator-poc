// Token.tsx
import React from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import { PluginKey } from "prosemirror-state";

export type TokenAttrs = {
  id: string;
  kind: "position" | "impact";
  label: string;
};

type Item = { id: string; label: string };

export interface TokenOptions {
  fetchPositions: (q: string) => Promise<Item[]>;
  fetchImpacts: (q: string) => Promise<Item[]>;
}

const TokenView: React.FC<any> = ({ node, editor, getPos }) => {
  const { id, kind, label } = node.attrs as TokenAttrs;

  const remove = () => {
    const pos = getPos();
    editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
  };

  return (
    <NodeViewWrapper
      as="span"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-sm align-middle"
    >
      <span className="font-medium">{label}</span>
      <span className="opacity-80 text-[11px]">
        ({kind === "position" ? "$" : "#"}
        {id})
      </span>
      <button
        type="button"
        onClick={remove}
        className="ml-1 leading-none rounded-sm px-1 hover:bg-white/20"
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </NodeViewWrapper>
  );
};

// Suggestion helper with UNIQUE pluginKey and safe typing
function suggestionPlugin(
  editor: any,
  char: "$" | "#",
  kind: "position" | "impact",
  fetchItems: (q: string) => Promise<Item[]>,
  nodeName: string,
  pluginKey: string
) {
  return Suggestion<TokenAttrs>({
    editor,
    char,
    pluginKey: new PluginKey(pluginKey),
    allowSpaces: true,
    startOfLine: false,
    items: async ({ query }) => {
      const items = await fetchItems(query ?? "");
      return items.map((i) => ({ id: i.id, kind, label: i.label }));
    },
    render: () => {
      let el: HTMLDivElement | null = null;
      return {
        onStart: (props: SuggestionProps<TokenAttrs, any>) => {
          el = document.createElement("div");
          el.className = "z-50 rounded-lg bg-white shadow-lg border p-1 w-80";
          document.body.appendChild(el);
          renderList(el, props.items, props.command);
          positionList(el, props.clientRect?.() ?? null);
        },
        onUpdate: (props: SuggestionProps<TokenAttrs, any>) => {
          if (!el) return;
          renderList(el, props.items, props.command);
          positionList(el, props.clientRect?.() ?? null);
        },
        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === "Escape") {
            props.event.preventDefault();
            return true;
          }
          return false;
        },
        onExit: () => {
          el?.remove();
          el = null;
        },
      };
    },
    command: ({ range, props }) => {
      editor
        .chain()
        .focus()
        .insertContentAt(range, { type: nodeName, attrs: props })
        .run();
    },
  }) as any;
}

function renderList(
  container: HTMLDivElement,
  items: TokenAttrs[],
  command: (item: TokenAttrs) => void
) {
  container.innerHTML = "";
  items.forEach((it) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className =
      "w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center justify-between";
    row.innerHTML = `<span>${it.label}</span><span class="text-xs text-gray-500">${it.id}</span>`;
    row.onclick = () => command(it);
    container.appendChild(row);
  });
}

function positionList(el: HTMLDivElement, rect: DOMRect | null) {
  if (!rect) return;
  Object.assign(el.style, {
    position: "absolute",
    left: `${rect.left}px`,
    top: `${rect.bottom + 6}px`,
  });
}

const Token = Node.create<TokenOptions>({
  name: "token",
  inline: true,
  group: "inline",
  atom: true,

  addAttributes() {
    return {
      id: { default: "" },
      kind: { default: "position" },
      label: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "token-chip" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["token-chip", mergeAttributes(HTMLAttributes), HTMLAttributes.label || ""];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TokenView);
  },

  addProseMirrorPlugins() {
    const ed = this.editor;
    return [
      suggestionPlugin(ed, "$", "position", this.options.fetchPositions, this.name, "token-suggest-dollar"),
      suggestionPlugin(ed, "#", "impact", this.options.fetchImpacts, this.name, "token-suggest-hash"),
    ];
  },
});

export default Token;