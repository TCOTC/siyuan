import type {
    SettingRow,
    SettingSection,
    SettingRowButton,
    SettingRowTextBlock,
    SettingRowStack,
    SettingRowSwitchQuery,
    SwitchQueryItem,
    StackLeft,
    StackRight,
} from "./settingRows";
import {getAtPath} from "./dotPath";
import {buildRangeValues, snapRangeValue} from "./formValue";

const getSwitchChecked = (id: string): boolean => Boolean(getAtPath(window.siyuan.config, id));

/** 配置项标题 */
export const wrapConfigItemName = (title: string): string =>
    `<div class="config-name">${title}</div>`;

/** 配置项左侧区域（标题 + 描述） */
export const buildConfigItemMainHtml = (title: string, desc?: string): string =>
    `<div class="fn__flex-1">
    ${wrapConfigItemName(title)}
    ${desc ? `<div class="b3-label__text">${desc}</div>` : ""}
</div>`;

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
    step?: string,
    unit?: string,
): string => {
    const fieldClass = unit ? "fn__flex-1" : "fn__flex-center fn__size200";
    const input = `<input class="b3-text-field ${fieldClass}" id="${id}" type="number" min="${min ?? ""}" max="${max ?? ""}" step="${step ?? ""}" value="${value}"/>`;
    if (unit) {
        return `<div class="fn__size200 fn__flex-center fn__flex">${input}<span class="fn__space"></span><span class="ft__on-surface fn__flex-center">${unit}</span></div>`;
    }
    return input;
};

const buildSwitchInputHtml = (id: string, checked: boolean): string =>
    `<input class="b3-switch fn__flex-center" id="${id}" type="checkbox"${checked ? " checked" : ""}/>`;

const buildSelectOptionsHtml = <T extends number | string>(
    id: string,
    options: {value: T; label?: string}[],
    current: T,
): string =>
    `<select class="b3-select fn__flex-center fn__size200" id="${id}">
    ${options
        .map((o) => `<option value="${o.value}" ${current === o.value ? "selected" : ""}>${o.label ?? String(o.value)}</option>`)
        .join("")
    }
</select>`;

export const renderSwitchRow = (id: string, title: string, desc: string | undefined, checked: boolean): string =>
    `<label class="fn__flex b3-label config-item">
    ${buildConfigItemMainHtml(title, desc)}
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
    value: number,
): string =>
    `<div class="fn__flex b3-label config-item config-wrap config-wrap--range">
    ${buildConfigItemMainHtml(title, desc)}
    <span class="fn__space"></span>
    <div class="config-range__desktop b3-tooltips b3-tooltips__n fn__flex-center" aria-label="${value}">
        <input class="b3-slider fn__size200" id="${id}" max="${max}" min="${min}" step="${step}" type="range" value="${value}">
    </div>
    <select class="config-range__mobile b3-select fn__flex-center fn__size200" data-control-id="${id}">
    ${buildRangeValues(min, max, step)
        .map((v) => `<option value="${v}" ${value === v ? "selected" : ""}>${v}</option>`)
        .join("")}
    </select>
</div>`;

const renderNumberRow = (
    id: string,
    title: string,
    desc: string,
    value: number,
    min?: number,
    max?: number,
    step?: string,
    unit?: string,
): string =>
    `<div class="fn__flex b3-label config-item config-wrap">
    ${buildConfigItemMainHtml(title, desc)}
    <span class="fn__space"></span>
    ${buildNumberInputHtml(id, value, min, max, step, unit)}
</div>`;

const renderButtonRow = (row: Pick<SettingRowButton, "id" | "title" | "desc" | "label" | "icon">): string => {
    const {id, title, desc, label, icon} = row;
    return `<div class="fn__flex b3-label config-item config-wrap">
    ${buildConfigItemMainHtml(title, desc || undefined)}
    <span class="fn__space"></span>
    ${buildButtonHtml(id, label, icon)}
</div>`;
};

/** 同一组 options 与 current 的 value 须同型（泛型 T 约束） */
const renderSelectRow = <T extends number | string>(
    id: string,
    title: string,
    desc: string,
    options: {value: T; label?: string}[],
    current: T,
): string =>
    `<div class="fn__flex b3-label config-item config-wrap">
    ${buildConfigItemMainHtml(title, desc)}
    <span class="fn__space"></span>
    ${buildSelectOptionsHtml(id, options, current)}
</div>`;

const renderTextRow = (id: string, title: string, desc: string, value: string): string =>
    `<div class="fn__flex b3-label config-item config-wrap">
    ${buildConfigItemMainHtml(title, desc)}
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size200" id="${id}" value="${value}"/>
</div>`;

const renderTextPairRow = (
    title: string,
    desc: string,
    leftId: string,
    leftValue: string,
    rightId: string,
    rightValue: string,
): string =>
    `<div class="fn__flex b3-label config-item config-wrap">
    ${buildConfigItemMainHtml(title, desc)}
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size96" id="${leftId}" value="${Lute.EscapeHTMLStr(leftValue)}">
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size96" id="${rightId}" value="${Lute.EscapeHTMLStr(rightValue)}">
</div>`;

const buildTextBlockFieldHtml = (
    id: string,
    mode: SettingRowTextBlock["mode"],
    value: string,
): string => {
    const spellcheck = window.siyuan.config.editor.spellcheck ? "true" : "false";
    if (mode === "textarea") {
        return `<textarea class="b3-text-field fn__block" id="${id}" spellcheck="${spellcheck}">${value}</textarea>`;
    }
    if (mode === "input-password") {
        return `<div class="b3-form__icona fn__block">
    <input id="${id}" type="password" class="b3-text-field b3-form__icona-input" value="${Lute.EscapeHTMLStr(value)}">
    <svg class="b3-form__icona-icon" data-action="togglePassword" style="user-select: none;"><use xlink:href="#iconEye"></use></svg>
</div>`;
    }
    return `<input class="b3-text-field fn__block" id="${id}" type="text" spellcheck="${spellcheck}" value="${Lute.EscapeHTMLStr(value)}"/>`;
};

const renderTextBlockRow = (row: Pick<SettingRowTextBlock, "id" | "title" | "desc" | "mode" | "value">): string => {
    const {id, title, desc, mode, value} = row;
    const field = buildTextBlockFieldHtml(id, mode, value);
    return `<div class="b3-label config-item">
    <div class="fn__block">
        ${wrapConfigItemName(title)}
        <div class="b3-label__text">${desc}</div>
        <div class="fn__hr"></div>
        ${field}
    </div>
</div>`;
};

/** 为指定 `id` 的密码框绑定显隐图标（与 `renderTextBlockRow` 中 `input-password` 分支的 DOM 结构配套） */
export const bindPasswordIconaToggle = (root: HTMLElement, inputId: string): void => {
    root.querySelector<HTMLElement>(`#${CSS.escape(inputId)} + .b3-form__icona-icon[data-action="togglePassword"]`)?.addEventListener("click", (event) => {
        const svg = event.currentTarget as SVGSVGElement;
        const icon = svg.firstElementChild as SVGUseElement;
        const field = svg.previousElementSibling as HTMLInputElement;
        if (!icon || !field) {
            return;
        }
        const isEye = icon.getAttribute("xlink:href") === "#iconEye";
        icon.setAttribute("xlink:href", isEye ? "#iconEyeoff" : "#iconEye");
        field.setAttribute("type", isEye ? "text" : "password");
    });
};

const renderStackRight = (r: StackRight): string => {
    switch (r.kind) {
        case "button":
            return buildButtonHtml(r.id, r.label, r.icon);
        case "select":
            return buildSelectOptionsHtml(r.id, r.options, r.value);
        case "number":
            return buildNumberInputHtml(r.id, r.value, r.min, r.max, undefined, undefined);
        case "switch":
            return buildSwitchInputHtml(r.id, getSwitchChecked(r.id));
    }
};

const renderStackLeft = (left: StackLeft): string => {
    if (left.kind === "textBlock") {
        return `<div class="fn__flex-1 fn__block">${buildTextBlockFieldHtml(left.id, left.mode, left.value)}</div>`;
    }
    return `<div class="fn__flex-center fn__flex-1${left.kind === "desc" ? " ft__on-surface" : ""}">${left.text}</div>`;
};

const renderSwitchQueryItem = (item: SwitchQueryItem): string => {
    switch (item.kind) {
        case "switch": {
            const checked = getSwitchChecked(item.id);
            return `<label class="fn__flex">
    ${item.icon ? `<svg class="svg"><use xlink:href="#${item.icon}"></use></svg><span class="fn__space"></span>` : ""}
    <div class="fn__flex-1">${item.label}</div>
    <span class="fn__space"></span>
    <input class="b3-switch" id="${item.id}" type="checkbox"${checked ? " checked" : ""}/>
</label>`;
        }
        case "number": {
            const raw = getAtPath(window.siyuan.config, item.id);
            const value = typeof raw === "number" && !Number.isNaN(raw) ? raw : 0;
            return `<div class="fn__flex label">
    ${item.label}
    <span class="fn__flex-1"></span>
    <input class="b3-text-field" id="${item.id}" type="number" min="${item.min ?? ""}" max="${item.max ?? ""}" value="${value}"/>
</div>`;
        }
    }
};

const renderSwitchQuery = (row: SettingRowSwitchQuery): string =>
`<div class="b3-label config-item">
    ${wrapConfigItemName(row.title)}
    <div class="config-query">
        ${row.items.map(renderSwitchQueryItem).join("")}
    </div>
    ${row.footer ? `<div class="fn__hr"></div><div class="fn__flex-1"><div class="b3-label__text">${row.footer}</div></div>` : ""}
</div>`;

const renderStack = (entry: SettingRowStack): string => {
    const parts: string[] = [];
    entry.lines.forEach((line, index) => {
        if (index > 0) {
            parts.push('<div class="fn__hr"></div>');
        }
        const {left, right} = line;
        if (!right) {
            parts.push(`<div class="fn__flex config-wrap">${renderStackLeft(left)}</div>`);
        } else {
            const tag = right.kind === "switch" ? "label" : "div";
            parts.push(`<${tag} class="fn__flex${right.kind === "switch" ? "" : " config-wrap"}">
    ${renderStackLeft(left)}
    <span class="fn__space"></span>
    ${renderStackRight(right)}
</${tag}>`);
        }
    });
    return `<div class="b3-label config-item">${parts.join("")}</div>`;
};

const renderNotebookSavePathRow = (
    title: string,
    desc: string,
    selectId: string,
    pathId: string,
    selectOptionsHtml: string,
): string =>
    `<div class="b3-label config-item config-item--save-path">
    ${wrapConfigItemName(title)}
    <div class="b3-label__text">${desc}</div>
    <div class="fn__hr"></div>
    <div class="fn__flex config-wrap">
        <select class="b3-select fn__size200" id="${selectId}">${selectOptionsHtml}</select>
        <div class="fn__space"></div>
        <input class="b3-text-field fn__flex-1" id="${pathId}" value="">
    </div>
</div>`;

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
        case "textPair": {
            const leftVal = getAtPath(cfg, row.leftId);
            const rightVal = getAtPath(cfg, row.rightId);
            const leftStr = typeof leftVal === "string" ? leftVal : "";
            const rightStr = typeof rightVal === "string" ? rightVal : "";
            return renderTextPairRow(row.title, row.desc, row.leftId, leftStr, row.rightId, rightStr);
        }
        case "textBlock":
            return renderTextBlockRow(row);
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
                row.step,
                row.unit,
            );
        }
        case "range": {
            const v = getAtPath(cfg, row.id);
            const raw = typeof v === "number" && !Number.isNaN(v) ? v : row.min;
            const num = snapRangeValue(raw, row.min, row.max, row.step);
            return renderRangeRow(
                row.id,
                row.title,
                row.desc,
                row.min,
                row.max,
                row.step,
                num,
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
            return renderButtonRow(row);
        case "custom":
            return row.html();
        case "stack":
            return renderStack(row);
        case "switchQuery":
            return renderSwitchQuery(row);
        case "notebookSavePath":
            return renderNotebookSavePathRow(
                row.title,
                row.desc,
                row.selectId,
                row.pathId,
                row.getOptionsHtml(),
            );
    }
};

/** 生成设置分组 HTML */
export const renderConfigGroup = (itemsHtml: string, title?: string): string =>
    `<div class="config-group">${title ? `<div class="config-title">${title}</div>` : ""}<div class="config-items">${itemsHtml}</div></div>`;

/** 按节列表生成设置页面 HTML */
export const renderSettingTabHtmlFromSections = (sections: SettingSection[]): string => {
    const parts: string[] = [];
    sections.forEach((section) => {
        const itemsHtml = section.items.map((row) => renderRow(row)).join("");
        parts.push(renderConfigGroup(itemsHtml, section.title));
    });
    return parts.join("");
};
