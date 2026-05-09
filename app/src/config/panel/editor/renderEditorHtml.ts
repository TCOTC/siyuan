import type {EditorRow} from "./editorEntries";
import {EDITOR_SECTIONS} from "./editorEntries";

const getSwitchChecked = (id: string): boolean => {
    const e = window.siyuan.config.editor;
    const md = e.markdown;
    switch (id) {
        case "listLogicalOutdent":
            return e.listLogicalOutdent;
        case "listItemDotNumberClickFocus":
            return e.listItemDotNumberClickFocus;
        case "pasteURLAutoConvert":
            return e.pasteURLAutoConvert;
        case "displayNetImgMark":
            return e.displayNetImgMark;
        case "displayBookmarkIcon":
            return e.displayBookmarkIcon;
        case "embedBlockBreadcrumb":
            return e.embedBlockBreadcrumb;
        case "codeLineWrap":
            return e.codeLineWrap;
        case "codeLigatures":
            return e.codeLigatures;
        case "codeSyntaxHighlightLineNum":
            return e.codeSyntaxHighlightLineNum;
        case "onlySearchForDoc":
            return e.onlySearchForDoc;
        case "virtualBlockRef":
            return e.virtualBlockRef;
        case "backlinkContainChildren":
            return e.backlinkContainChildren;
        case "editorMarkdownInlineAsterisk":
            return md.inlineAsterisk;
        case "editorMarkdownInlineUnderscore":
            return md.inlineUnderscore;
        case "editorMarkdownInlineSup":
            return md.inlineSup;
        case "editorMarkdownInlineSub":
            return md.inlineSub;
        case "editorMarkdownInlineTag":
            return md.inlineTag;
        case "editorMarkdownInlineMath":
            return md.inlineMath;
        case "editorMarkdownInlineStrikethrough":
            return md.inlineStrikethrough;
        case "editorMarkdownInlineMark":
            return md.inlineMark;
        case "allowSVGScript":
            return e.allowSVGScript;
        case "allowHTMLBLockScript":
            return e.allowHTMLBLockScript;
        default:
            return false;
    }
};

const getNumberInputAttrs = (id: string): {value: number; min?: number; max?: number} => {
    const e = window.siyuan.config.editor;
    switch (id) {
        case "dynamicLoadBlocks":
            return {value: e.dynamicLoadBlocks, min: 48};
        case "blockRefDynamicAnchorTextMaxLen":
            return {value: e.blockRefDynamicAnchorTextMaxLen, min: 1, max: 5120};
        case "backlinkExpandCount":
            return {value: e.backlinkExpandCount, min: 0, max: 512};
        case "backmentionExpandCount":
            return {value: e.backmentionExpandCount, min: -1, max: 512};
        default:
            return {value: 0};
    }
};

const renderSwitchRow = (id: string, title: string, desc: string, checked: boolean): string =>
    `<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="${id}" type="checkbox"${checked ? " checked" : ""}/>
</label>`;

const renderRangeRow = (
    id: string,
    title: string,
    desc: string,
    min: number,
    max: number,
    step: number,
    ariaValue: number,
    currentValue: number
): string =>
    `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${ariaValue}">   
        <input class="b3-slider fn__size200" id="${id}" max="${max}" min="${min}" step="${step}" type="range" value="${currentValue}">
    </div>
</div>`;

const renderNumberRow = (
    id: string,
    title: string,
    desc: string,
    min?: number,
    max?: number
): string => {
    const {value} = getNumberInputAttrs(id);
    const minAttr = min !== undefined ? ` min="${min}"` : "";
    const maxAttr = max !== undefined ? ` max="${max}"` : "";
    return `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size200" id="${id}" type="number"${minAttr}${maxAttr} value="${value}"/>
</div>`;
};

const renderSelectRow = (
    id: string,
    title: string,
    desc: string,
    options: {value: number; label: string}[],
    current: number
): string => {
    const optionsHtml = options
        .map(
            (o) =>
                `<option value="${o.value}" ${current === o.value ? "selected" : ""}>${o.label}</option>`
        )
        .join("");
    return `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    <select class="b3-select fn__flex-center fn__size200" id="${id}">
      ${optionsHtml}
    </select>
</div>`;
};

const renderTextRow = (id: string, title: string, desc: string, value: string): string =>
    `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size200" id="${id}" value="${value}"/>
</div>`;

const renderOne = (entry: EditorRow): string => {
    const e = window.siyuan.config.editor;
    switch (entry.type) {
        case "custom":
            return entry.html();
        case "switch":
            return renderSwitchRow(
                entry.id,
                entry.title,
                entry.desc,
                getSwitchChecked(entry.id)
            );
        case "range": {
            const v = e[entry.ariaField] as number;
            return renderRangeRow(
                entry.id,
                entry.title,
                entry.desc,
                entry.min,
                entry.max,
                entry.step,
                v,
                v
            );
        }
        case "number":
            return renderNumberRow(entry.id, entry.title, entry.desc, entry.min, entry.max);
        case "select":
            return renderSelectRow(entry.id, entry.title, entry.desc, entry.options, e.headingEmbedMode);
        case "text":
            return renderTextRow(entry.id, entry.title, entry.desc, e.plantUMLServePath);
    }
};

/** 按 EDITOR_SECTIONS 生成「设置 — 编辑器」标签页 HTML，结构与原版一致 */
export const renderEditorTabHtml = (): string => {
    const parts: string[] = [];
    EDITOR_SECTIONS.forEach((section) => {
        parts.push(`<b class="config-group__title">${section.title}</b>`);
        parts.push('<div class="config-group">');
        section.items.forEach((row) => {
            parts.push(renderOne(row));
        });
        parts.push("</div>");
    });
    return parts.join("");
};
