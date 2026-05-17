import type {SettingRow, SettingRowSelect, SettingSection} from "./settingRows";
import {getAtPath} from "./dotPath";

const getSwitchChecked = (id: string): boolean => Boolean(getAtPath(window.siyuan.config, id));

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
): string => {
    const minAttr = min ?? "";
    const maxAttr = max ?? "";
    const input = `<input class="b3-text-field ${unit ? "fn__flex-1" : "fn__flex-center fn__size200"}" id="${id}" type="number" min="${minAttr}" max="${maxAttr}" value="${value}"/>`;
    const control = unit
        ? `<div class="fn__size200 fn__flex-center fn__flex">${input}<span class="fn__space"></span><span class="ft__on-surface fn__flex-center">${unit}</span></div>`
        : input;
    return `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${title}
        <div class="b3-label__text">${desc}</div>
    </div>
    <span class="fn__space"></span>
    ${control}
</div>`;
};

/** 同一组 options 与 current 的 value 须同型（泛型 T 约束） */
const renderSelectRow = <T extends number | string>(
    id: string,
    title: string,
    desc: string,
    options: {value: T; label: string}[],
    current: T
): string => {
    const optionsHtml = options
        .map((o) => `<option value="${o.value}" ${current === o.value ? "selected" : ""}>${o.label}</option>`)
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

const renderBlockTextareaRow = (title: string, desc: string, id: string, value: string): string =>
    `<div class="b3-label">
    <div class="fn__block">
        ${title}
        <div class="b3-label__text">${desc}</div>
        <div class="fn__hr"></div>
        <textarea class="b3-text-field fn__block" id="${id}" spellcheck="${window.siyuan.config.editor.spellcheck ? "true" : "false"}">${value}</textarea>
    </div>
</div>`;

const renderOne = (entry: SettingRow): string => {
    const cfg = window.siyuan.config;
    switch (entry.type) {
        case "custom":
            return entry.html();
        case "switch":
            return renderSwitchRow(entry.id, entry.title, entry.desc, getSwitchChecked(entry.id));
        case "range": {
            const v = getAtPath(cfg, entry.id);
            const num = typeof v === "number" && !Number.isNaN(v) ? v : entry.min;
            return renderRangeRow(
                entry.id,
                entry.title,
                entry.desc,
                entry.min,
                entry.max,
                entry.step,
                num
            );
        }
        case "number": {
            const raw = getAtPath(cfg, entry.id);
            const value = typeof raw === "number" && !Number.isNaN(raw) ? raw : 0;
            return renderNumberRow(
                entry.id,
                entry.title,
                entry.desc,
                value,
                entry.min,
                entry.max,
                entry.unit
            );
        }
        case "select": {
            const firstVal = entry.options[0]?.value;
            const numericSelect = entry.options.length > 0 && typeof firstVal === "number";
            let current: number | string;
            if (numericSelect) {
                current = 0;
                if (typeof entry.value === "number" && !Number.isNaN(entry.value)) {
                    current = entry.value;
                } else if (typeof firstVal === "number" && !Number.isNaN(firstVal)) {
                    current = firstVal;
                }
            } else {
                current = "";
                if (typeof entry.value === "string") {
                    current = entry.value;
                } else if (typeof firstVal === "string") {
                    current = firstVal;
                }
            }
            return renderSelectRow(entry.id, entry.title, entry.desc, entry.options, current);
        }
        case "text": {
            const val = getAtPath(cfg, entry.id);
            const str = typeof val === "string" ? val : "";
            return renderTextRow(entry.id, entry.title, entry.desc, str);
        }
        case "notebookSavePath":
            return renderNotebookSavePathRow(
                entry.title,
                entry.desc,
                entry.selectId,
                entry.pathId,
                entry.getOptionsHtml()
            );
        case "blockTextarea":
            return renderBlockTextareaRow(entry.title, entry.desc, entry.id, entry.getTextValue());
    }
};

/** 按节列表生成设置 Tab HTML（编辑器 / 文档等共用；通常传入 `filterSettingSections(build*Sections(), query)` 的结果） */
export const renderSettingTabHtmlFromSections = (sections: SettingSection[]): string => {
    const parts: string[] = [];
    sections.forEach((section) => {
        if (section.title) {
            parts.push(`<b class="config-group__title">${section.title}</b>`);
        }
        parts.push('<div class="config-group">');
        section.items.forEach((row) => {
            parts.push(renderOne(row));
        });
        parts.push("</div>");
    });
    return parts.join("");
};
