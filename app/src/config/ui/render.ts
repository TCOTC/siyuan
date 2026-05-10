import type {SettingRow, SettingSection} from "./types";
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

const renderNumberRow = (id: string, title: string, desc: string, min?: number, max?: number): string => {
    const raw = getAtPath(window.siyuan.config, id);
    const value = typeof raw === "number" && !Number.isNaN(raw) ? raw : 0;
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
                num,
                num
            );
        }
        case "number":
            return renderNumberRow(entry.id, entry.title, entry.desc, entry.min, entry.max);
        case "select": {
            const cur = getAtPath(cfg, entry.id);
            const fallbackHeading = getAtPath(cfg, "editor.headingEmbedMode");
            const num =
                typeof cur === "number" && !Number.isNaN(cur)
                    ? cur
                    : typeof fallbackHeading === "number" && !Number.isNaN(fallbackHeading)
                      ? fallbackHeading
                      : 0;
            return renderSelectRow(entry.id, entry.title, entry.desc, entry.options, num);
        }
        case "text": {
            const val = getAtPath(cfg, entry.id);
            const fallbackPath = getAtPath(cfg, "editor.plantUMLServePath");
            const str = typeof val === "string" ? val : typeof fallbackPath === "string" ? fallbackPath : "";
            return renderTextRow(entry.id, entry.title, entry.desc, str);
        }
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
