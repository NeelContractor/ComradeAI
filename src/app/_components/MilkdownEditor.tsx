"use client";

import { useEffect, useRef, useImperativeHandle } from "react";
import type React from "react";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import { editorViewCtx } from "@milkdown/kit/core";
import { markdownToSlice } from "@milkdown/kit/utils";

export interface MilkdownEditorHandle {
  getMarkdown: () => string;
  isReady: () => boolean;
}

interface MilkdownEditorProps {
  onChange?: () => void;
  defaultValue?: string;
  ref?: React.Ref<MilkdownEditorHandle>;
}

export function MilkdownEditor({ onChange, defaultValue, ref }: MilkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const suppressRef = useRef(false);

  useImperativeHandle(ref, () => ({
    getMarkdown: () => (crepeRef.current ? crepeRef.current.getMarkdown() : ""),
    isReady: () => crepeRef.current !== null,
  }));

  // Create the editor exactly once per mount. Recreating on every defaultValue
  // change leaks an in-flight instance (duplicate editors, empty getMarkdown()).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const crepe = new Crepe({
      root: container,
      defaultValue: defaultValue ?? "",
      featureConfigs: {
        [Crepe.Feature.Placeholder]: {
          mode: "doc",
        },
      },
    });

    let alive = true;

    crepe.on((listener) => {
      listener.markdownUpdated(() => {
        if (alive && !suppressRef.current) onChangeRef.current?.();
      });
    });

    void crepe
      .create()
      .then(() => {
        if (!alive) {
          void crepe.destroy().catch(() => {});
          return;
        }
        crepeRef.current = crepe;
      })
      .catch(console.error);

    return () => {
      alive = false;
      if (crepeRef.current === crepe) crepeRef.current = null;
      void crepe.destroy().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync programmatic content changes (e.g. a different journal loads) without
  // going through the lifecycle race above.
  useEffect(() => {
    const crepe = crepeRef.current;
    if (!crepe || defaultValue === undefined) return;
    if (crepe.getMarkdown() === defaultValue) return;

    suppressRef.current = true;
    crepe.editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const slice = markdownToSlice(defaultValue)(ctx);
      view.dispatch(view.state.tr.replace(0, view.state.doc.content.size, slice));
    });
    suppressRef.current = false;
  }, [defaultValue]);

  return <div ref={containerRef} className="milkdown-crepe-container" />;
}