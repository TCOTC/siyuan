import type {EditorRow} from "./editorEntries";
import {getEditorRowById, getEditorSections} from "./editorEntries";
import {getAtPath} from "./editorMergePatch";

const getSwitchChecked = (id: string): boolean => Boolean(getAtPath(window.siyuan.config.editor, id));

const getNumberInputAttrs = (id: string): {value: number; min?: number; max?: number} => {
    const row = getEditorRowById().get(id);
    const raw = getAtPath(window.siyuan.config.editor, id);
    const value = typeof raw === "number" && !Number.isNaN(raw) ? raw : 0;
    if (row?.type === "number") {
        return {value, min: row.min, max: row.max};
    }
    return {value: 0};
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
            const v = getAtPath(e, entry.id);
            const num = typeof v === "number" && !Number.isNaN(v) ? v : entry.min;
            return renderRangeRow(
                entry.id,
                entry.title,
                entry.desc,
                entry.min,
                entry.max,
                entry.step,
                num,
                num
            );
        }
        case "number":
            return renderNumberRow(entry.id, entry.title, entry.desc, entry.min, entry.max);
        case "select": {
            const cur = getAtPath(e, entry.id);
            const num = typeof cur === "number" && !Number.isNaN(cur) ? cur : e.headingEmbedMode;
            return renderSelectRow(entry.id, entry.title, entry.desc, entry.options, num);
        }
        case "text": {
            const val = getAtPath(e, entry.id);
            const str = typeof val === "string" ? val : e.plantUMLServePath;
            return renderTextRow(entry.id, entry.title, entry.desc, str);
        }
    }
};

/** 按 `getEditorSections()` 生成「设置 — 编辑器」标签页 HTML，结构与原版一致 */
export const renderEditorTabHtml = (): string => {
    const parts: string[] = [];
    getEditorSections().forEach((section) => {
        parts.push(`<b class="config-group__title">${section.title}</b>`);
        parts.push('<div class="config-group">');
        section.items.forEach((row) => {
            parts.push(renderOne(row));
        });
        parts.push("</div>");
    });
    return parts.join("");
};
