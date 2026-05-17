import type {
    SettingRow,
    SettingRowStack,
    SettingSection,
    StackLeft,
    StackRight,
} from "./settingRows";
import {getAtPath} from "./dotPath";

const getSwitchChecked = (id: string): boolean => Boolean(getAtPath(window.siyuan.config, id));

const buildButtonHtml = (id: string, label: string, icon: string): string =>
    `<button class="b3-button b3-button--outline fn__flex-center fn__size200" id="${id}">
        <svg><use xlink:href="#${icon}"></use></svg>
        ${label}
    </button>`;

const buildNumberInputHtml = (
    id: string,
    value: number,
    min?: number,
    max?: number,
    unit?: string
): string => {
    const minAttr = min ?? "";
    const maxAttr = max ?? "";
    const fieldClass = unit ? "fn__flex-1" : "fn__flex-center fn__size200";
    const input = `<input class="b3-text-field ${fieldClass}" id="${id}" type="number" min="${minAttr}" max="${maxAttr}" value="${value}"/>`;
    if (unit) {
        return `<div class="fn__size200 fn__flex-center fn__flex">${input}<span class="fn__space"></span><span class="ft__on-surface fn__flex-center">${unit}</span></div>`;
    }
    return input;
};

const buildSwitchInputHtml = (id: string, checked: boolean): string =>
    `<input class="b3-switch fn__flex-center" id="${id}" type="checkbox"${checked ? " checked" : ""}/>`;

const buildSelectOptionsHtml = <T extends number | string>(
    id: string,
    options: {value: T; label: string}[],
    current: T
): string =>
    `<select class="b3-select fn__flex-center fn__size200" id="${id}">
    ${options
        .map((o) => `<option value="${o.value}" ${current === o.value ? "selected" : ""}>${o.label}</option>`)
        .join("")
    }
</select>`;

export const renderSwitchRow = (id: string, title: string, desc: string, checked: boolean): string =>
    `<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    ${buildSwitchInputHtml(id, checked)}
</label>`;

const renderRangeRow = (
    id: string,
    title: string,
    desc: string,
    min: number,
    max: number,
    step: number,
    value: number
): string =>
    `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${value}">   
        <input class="b3-slider fn__size200" id="${id}" max="${max}" min="${min}" step="${step}" type="range" value="${value}">
    </div>
</div>`;

const renderNumberRow = (
    id: string,
    title: string,
    desc: string,
    value: number,
    min?: number,
    max?: number,
    unit?: string
): string =>
    `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    ${buildNumberInputHtml(id, value, min, max, unit)}
</div>`;

const renderButtonRow = (id: string, title: string, desc: string, label: string, icon: string): string =>
    `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    ${buildButtonHtml(id, label, icon)}
</div>`;

/** 同一组 options 与 current 的 value 须同型（泛型 T 约束） */
const renderSelectRow = <T extends number | string>(
    id: string,
    title: string,
    desc: string,
    options: {value: T; label: string}[],
    current: T
): string =>
    `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    ${buildSelectOptionsHtml(id, options, current)}
</div>`;

const renderTextRow = (id: string, title: string, desc: string, value: string): string =>
    `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size200" id="${id}" value="${value}"/>
</div>`;

const renderNotebookSavePathRow = (
    title: string,
    desc: string,
    selectId: string,
    pathId: string,
    selectOptionsHtml: string
): string =>
    `<div class="b3-label config__item">
    ${title}
    <div class="b3-label__text">${desc}</div>
    <span class="fn__hr"></span>
    <div class="fn__flex">
        <select style="min-width: 200px" class="b3-select" id="${selectId}">${selectOptionsHtml}</select>
        <div class="fn__space"></div>
        <input class="b3-text-field fn__flex-1" id="${pathId}" value="">
    </div>
</div>`;

const renderTextBlockRow = (title: string, desc: string, id: string, value: string): string =>
    `<div class="b3-label">
    <div class="fn__block">
        ${title}
        <div class="b3-label__text">${desc}</div>
        <div class="fn__hr"></div>
        <textarea class="b3-text-field fn__block" id="${id}" spellcheck="${window.siyuan.config.editor.spellcheck ? "true" : "false"}">${value}</textarea>
    </div>
</div>`;

const renderStackRight = (r: StackRight): string => {
    switch (r.kind) {
        case "button":
            return buildButtonHtml(r.id, r.label, r.icon);
        case "select":
            return buildSelectOptionsHtml(r.id, r.options, r.value);
        case "number":
            return buildNumberInputHtml(r.id, r.value, r.min, r.max);
        case "switch":
            return buildSwitchInputHtml(r.id, getSwitchChecked(r.id));
    }
};

const renderStackLeft = (left: StackLeft): string =>
    `<div class="fn__flex-center fn__flex-1${left.kind === "desc" ? " ft__on-surface" : ""}">${left.text}</div>`;

const renderStack = (entry: SettingRowStack): string => {
    const parts: string[] = [];
    entry.lines.forEach((line, index) => {
        if (index > 0) {
            parts.push('<div class="fn__hr"></div>');
        }
        const {left, right} = line;
        if (!right) {
            parts.push(`<div class="fn__flex">${renderStackLeft(left)}</div>`);
        } else {
            const tag = right.kind === "switch" ? "label" : "div";
            parts.push(`<${tag} class="fn__flex config__item">
    ${renderStackLeft(left)}
    <span class="fn__space"></span>
    ${renderStackRight(right)}
</${tag}>`);
        }
    });
    return `<div class="b3-label">${parts.join("")}</div>`;
};

const renderRow = (row: SettingRow): string => {
    const cfg = window.siyuan.config;
    switch (row.type) {
        case "switch":
            return renderSwitchRow(row.id, row.title, row.desc, getSwitchChecked(row.id));
        case "text": {
            const val = getAtPath(cfg, row.id);
            const str = typeof val === "string" ? val : "";
            return renderTextRow(row.id, row.title, row.desc, str);
        }
        case "textBlock":
            return renderTextBlockRow(row.title, row.desc, row.id, row.getTextValue());
        case "number": {
            const raw = getAtPath(cfg, row.id);
            const value = typeof raw === "number" && !Number.isNaN(raw) ? raw : 0;
            return renderNumberRow(
                row.id,
                row.title,
                row.desc,
                value,
                row.min,
                row.max,
                row.unit
            );
        }
        case "range": {
            const v = getAtPath(cfg, row.id);
            const num = typeof v === "number" && !Number.isNaN(v) ? v : row.min;
            return renderRangeRow(
                row.id,
                row.title,
                row.desc,
                row.min,
                row.max,
                row.step,
                num
            );
        }
        case "select": {
            const firstVal = row.options[0]?.value;
            const numericSelect = row.options.length > 0 && typeof firstVal === "number";
            let current: number | string;
            if (numericSelect) {
                current = 0;
                if (typeof row.value === "number" && !Number.isNaN(row.value)) {
                    current = row.value;
                } else if (typeof firstVal === "number" && !Number.isNaN(firstVal)) {
                    current = firstVal;
                }
            } else {
                current = "";
                if (typeof row.value === "string") {
                    current = row.value;
                } else if (typeof firstVal === "string") {
                    current = firstVal;
                }
            }
            return renderSelectRow(row.id, row.title, row.desc, row.options, current);
        }
        case "button":
            return renderButtonRow(row.id, row.title, row.desc, row.label, row.icon);
        case "custom":
            return row.html();
        case "stack":
            return renderStack(row);
        case "notebookSavePath":
            return renderNotebookSavePathRow(
                row.title,
                row.desc,
                row.selectId,
                row.pathId,
                row.getOptionsHtml()
            );
    }
};

/** 按节列表生成设置页面 HTML */
export const renderSettingTabHtmlFromSections = (sections: SettingSection[]): string => {
    const parts: string[] = [];
    sections.forEach((section) => {
        if (section.title) {
            parts.push(`<b class="config-group__title">${section.title}</b>`);
        }
        parts.push('<div class="config-group">');
        section.items.forEach((row) => {
            parts.push(renderRow(row));
        });
        parts.push("</div>");
    });
    return parts.join("");
};
