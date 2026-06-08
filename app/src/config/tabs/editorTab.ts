import {updateHotkeyTip} from "../../protyle/util/compatibility";
import {Constants} from "../../constants";
import {isBrowser} from "../../util/functions";
import {editorConfigApi} from "./editorRuntime";
import type {TabBuilder} from "../registry/tabBuilder";
/// #if !BROWSER
import {ipcRenderer} from "electron";
/// #endif

/** 编辑器 Tab：各组注册实现（由 registry/tabs.ts 中的 registry 调用） */
export const registerEditorBehaviorGroup = (p: TabBuilder) => {
    const browser = isBrowser();
    const s = p.group("behavior", window.siyuan.languages.configGroupBehavior);
    const readOnlyKeymap = window.siyuan.config.keymap.general.editReadonly.custom;
    s.switch("readOnly", {
        title: `${window.siyuan.languages.editReadonly} <code class="fn__code${readOnlyKeymap ? "" : " fn__none"}">${updateHotkeyTip(readOnlyKeymap)}</code>`,
        desc: window.siyuan.languages.editReadonlyTip,
    });
    s.switch("spellcheck", {
        title: window.siyuan.languages.spellcheck,
        desc: browser ? window.siyuan.languages.spellcheckTip : window.siyuan.languages.spellcheckTip2,
        afterMount: bindSpellcheckLanguagesVisibility,
    });
    if (!browser) {
        s.slot({
            key: "spellcheckLanguages",
            keywords: [
                window.siyuan.languages.spellcheck,
                window.siyuan.languages.spellcheckTip2,
            ],
            html: () => `<div class="fn__flex b3-label config-item fn__none"><div class="b3-chips" id="editor.spellcheckLanguages"></div></div>`,
            afterMount: bindSpellcheckLanguagesChips,
        });
    }
    s.range("codeTabSpaces", {
        title: window.siyuan.languages.md29,
        desc: window.siyuan.languages.md30,
        min: 0,
        max: 8,
        step: 2,
    });
    s.switch("listLogicalOutdent", {
        title: window.siyuan.languages.outlineOutdent,
        desc: window.siyuan.languages.outlineOutdentTip,
    });
    s.switch("listItemDotNumberClickFocus", {
        title: window.siyuan.languages.listItemDotNumberClickFocus,
        desc: window.siyuan.languages.listItemDotNumberClickFocusTip,
    });
    s.switch("pasteURLAutoConvert", {
        title: window.siyuan.languages.pasteURLAutoConvert,
        desc: window.siyuan.languages.pasteURLAutoConvertTip,
    });
    s.number("dynamicLoadBlocks", {
        title: window.siyuan.languages.dynamicLoadBlocks,
        desc: window.siyuan.languages.dynamicLoadBlocksTip,
        min: 48,
    });
};
const bindSpellcheckLanguagesVisibility = async (root: HTMLElement) => {
    /// #if !BROWSER
    const spellcheckSwitch = root.querySelector<HTMLInputElement>(`#${CSS.escape("editor.spellcheck")}`);
    if (!spellcheckSwitch) {
        return;
    }
    const toggleWrap = () => {
        root.querySelector(`#${CSS.escape("editor.spellcheckLanguages")}`)?.closest(".config-item")?.classList.toggle("fn__none", !spellcheckSwitch.checked);
    };
    spellcheckSwitch.addEventListener("change", toggleWrap);
    toggleWrap();
    /// #endif
};
const bindSpellcheckLanguagesChips = async (root: HTMLElement) => {
    /// #if !BROWSER
    const el = root.querySelector<HTMLDivElement>(`#${CSS.escape("editor.spellcheckLanguages")}`);
    if (!el) {
        return;
    }
    const languages: string[] = await ipcRenderer.invoke(Constants.SIYUAN_GET, {
        cmd: "availableSpellCheckerLanguages",
    });
    el.innerHTML = languages.map((item) =>
        `<div class="fn__pointer b3-chip b3-chip--middle${window.siyuan.config.editor.spellcheckLanguages.includes(item) ? " b3-chip--current" : ""}">${item}</div>`
    ).join("");
    el.addEventListener("click", (event) => {
        const target = event.target as Element;
        if (target.classList.contains("b3-chip")) {
            target.classList.toggle("b3-chip--current");
            const selected = Array.from(el.querySelectorAll(".b3-chip--current")).map((chip) => chip.textContent || "");
            ipcRenderer.send(Constants.SIYUAN_CMD, {
                cmd: "setSpellCheckerLanguages",
                languages: selected,
            });
            editorConfigApi.patch("spellcheckLanguages", selected);
        }
    });
    /// #endif
};

export const registerEditorBlockFeaturesGroup = (p: TabBuilder) => {
    const s = p.group("blockFeatures", window.siyuan.languages.configGroupBlockFeatures);
    s.switch("displayNetImgMark", {
        title: window.siyuan.languages.md7,
        desc: window.siyuan.languages.md8,
    });
    s.switch("displayBookmarkIcon", {
        title: window.siyuan.languages.md12,
        desc: window.siyuan.languages.md16,
    });
    s.switch("embedBlockBreadcrumb", {
        title: window.siyuan.languages.embedBlockBreadcrumb,
        desc: window.siyuan.languages.embedBlockBreadcrumbTip,
    });
    s.select("headingEmbedMode", {
        title: window.siyuan.languages.headingEmbedMode,
        desc: window.siyuan.languages.headingEmbedModeTip,
        options: [
            {value: 0, label: window.siyuan.languages.showHeadingWithBlocks},
            {value: 1, label: window.siyuan.languages.showHeadingOnlyTitle},
            {value: 2, label: window.siyuan.languages.showHeadingOnlyBlocks},
        ],
    });
    s.switch("codeLineWrap", {
        title: window.siyuan.languages.md31,
        desc: window.siyuan.languages.md32,
    });
    s.switch("codeLigatures", {
        title: window.siyuan.languages.md2,
        desc: window.siyuan.languages.md3,
    });
    s.switch("codeSyntaxHighlightLineNum", {
        title: window.siyuan.languages.md27,
        desc: window.siyuan.languages.md28,
    });
};

export const registerEditorBidirectionalGroup = (p: TabBuilder) => {
    const s = p.group("bidirectional", window.siyuan.languages.configGroupBidirectionalLinks);
    s.switch("onlySearchForDoc", {
        title: window.siyuan.languages.onlySearchForDoc,
        desc: window.siyuan.languages.onlySearchForDocTip,
    });
    s.number("blockRefDynamicAnchorTextMaxLen", {
        title: window.siyuan.languages.md37,
        desc: window.siyuan.languages.md38,
        min: 1,
        max: 5120,
    });
    s.switch("virtualBlockRef", {
        title: window.siyuan.languages.md33,
        desc: window.siyuan.languages.md34,
    });
    s.textBlock("virtualBlockRefInclude", {
        title: window.siyuan.languages.md9,
        desc: window.siyuan.languages.md36,
        mode: "textarea",
    });
    s.textBlock("virtualBlockRefExclude", {
        title: window.siyuan.languages.md35,
        desc: window.siyuan.languages.md41,
        mode: "textarea",
    });
    s.switch("backlinkContainChildren", {
        title: window.siyuan.languages.backlinkContainChildren,
        desc: window.siyuan.languages.backlinkContainChildrenTip,
    });
    s.number("backlinkExpandCount", {
        title: window.siyuan.languages.backlinkExpand,
        desc: window.siyuan.languages.backlinkExpandTip,
        min: 0,
        max: 512,
    });
    s.number("backmentionExpandCount", {
        title: window.siyuan.languages.backmentionExpand,
        desc: window.siyuan.languages.backmentionExpandTip,
        min: -1,
        max: 512,
    });
};

export const registerEditorMarkdownInlineGroup = (p: TabBuilder) => {
    const s = p.group("markdownInline", window.siyuan.languages.configGroupMarkdownInlineSyntax);
    s.switch("markdown.inlineAsterisk", {
        title: window.siyuan.languages.editorMarkdownInlineAsterisk,
        desc: window.siyuan.languages.editorMarkdownInlineAsteriskTip,
    });
    s.switch("markdown.inlineUnderscore", {
        title: window.siyuan.languages.editorMarkdownInlineUnderscore,
        desc: window.siyuan.languages.editorMarkdownInlineUnderscoreTip,
    });
    s.switch("markdown.inlineSup", {
        title: window.siyuan.languages.editorMarkdownInlineSup,
        desc: window.siyuan.languages.editorMarkdownInlineSupTip,
    });
    s.switch("markdown.inlineSub", {
        title: window.siyuan.languages.editorMarkdownInlineSub,
        desc: window.siyuan.languages.editorMarkdownInlineSubTip,
    });
    s.switch("markdown.inlineTag", {
        title: window.siyuan.languages.editorMarkdownInlineTag,
        desc: window.siyuan.languages.editorMarkdownInlineTagTip,
    });
    s.switch("markdown.inlineMath", {
        title: window.siyuan.languages.editorMarkdownInlineMath,
        desc: window.siyuan.languages.editorMarkdownInlineMathTip,
    });
    s.switch("markdown.inlineStrikethrough", {
        title: window.siyuan.languages.editorMarkdownInlineStrikethrough,
        desc: window.siyuan.languages.editorMarkdownInlineStrikethroughTip,
    });
    s.switch("markdown.inlineMark", {
        title: window.siyuan.languages.editorMarkdownInlineMark,
        desc: window.siyuan.languages.editorMarkdownInlineMarkTip,
    });
};

export const registerEditorAdvancedGroup = (p: TabBuilder) => {
    const s = p.group("advanced", window.siyuan.languages.configGroupAdvanced);
    s.text("plantUMLServePath", {
        title: window.siyuan.languages.md39,
        desc: window.siyuan.languages.md40,
    });
    s.textBlock("katexMacros", {
        title: window.siyuan.languages.katexMacros,
        desc: window.siyuan.languages.katexMacrosTip,
        mode: "textarea",
    });
    s.switch("allowSVGScript", {
        title: window.siyuan.languages.allowSVGScript,
        desc: window.siyuan.languages.allowSVGScriptTip,
    });
    s.switch("allowHTMLBLockScript", {
        title: window.siyuan.languages.allowHTMLBLockScript,
        desc: window.siyuan.languages.allowHTMLBLockScriptTip,
    });
};

export const registerEditorTab = (p: TabBuilder) => {
    registerEditorBehaviorGroup(p);
    registerEditorBlockFeaturesGroup(p);
    registerEditorBidirectionalGroup(p);
    registerEditorMarkdownInlineGroup(p);
    registerEditorAdvancedGroup(p);
};
