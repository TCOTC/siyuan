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
export const genConfigItemName = (title: string): string =>
    `<div class="config-name">${title}</div>`;

/** 配置项左侧区域（标题 + 描述） */
export const genConfigItemMainHtml = (title: string, desc?: string): string =>
    `<div class="fn__flex-1">
    ${genConfigItemName(title)}
    ${desc ? `<div class="b3-label__text">${desc}</div>` : ""}
</div>`;

const genButtonHtml = (id: string, label: string, icon: string): string =>
    `<button class="b3-button b3-button--outline fn__flex-center fn__size200" id="${id}">
        <svg><use xlink:href="#${icon}"></use></svg>
        ${label}
    </button>`;

const genNumberInputHtml = (
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

const genSwitchInputHtml = (id: string, checked: boolean): string =>
    `<input class="b3-switch fn__flex-center" id="${id}" type="checkbox"${checked ? " checked" : ""}/>`;

const genSelectOptionsHtml = <T extends number | string>(
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

export const genSwitchRow = (id: string, title: string, desc: string | undefined, checked: boolean): string =>
    `<label class="fn__flex b3-label config-item">
    ${genConfigItemMainHtml(title, desc)}
    <span class="fn__space"></span>
    ${genSwitchInputHtml(id, checked)}
</label>`;

const genRangeRow = (
    id: string,
    title: string,
    desc: string,
    min: number,
    max: number,
    step: number,
    value: number,
): string =>
    `<div class="fn__flex b3-label config-item config-wrap config-wrap--range">
    ${genConfigItemMainHtml(title, desc)}
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

const genNumberRow = (
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
    ${genConfigItemMainHtml(title, desc)}
    <span class="fn__space"></span>
    ${genNumberInputHtml(id, value, min, max, step, unit)}
</div>`;

const genButtonRow = (row: Pick<SettingRowButton, "id" | "title" | "desc" | "label" | "icon">): string => {
    const {id, title, desc, label, icon} = row;
    return `<div class="fn__flex b3-label config-item config-wrap">
    ${genConfigItemMainHtml(title, desc || undefined)}
    <span class="fn__space"></span>
    ${genButtonHtml(id, label, icon)}
</div>`;
};

/** 同一组 options 与 current 的 value 须同型（泛型 T 约束） */
const genSelectRow = <T extends number | string>(
    id: string,
    title: string,
    desc: string,
    options: {value: T; label?: string}[],
    current: T,
): string =>
    `<div class="fn__flex b3-label config-item config-wrap">
    ${genConfigItemMainHtml(title, desc)}
    <span class="fn__space"></span>
    ${genSelectOptionsHtml(id, options, current)}
</div>`;

const genTextRow = (id: string, title: string, desc: string, value: string): string =>
    `<div class="fn__flex b3-label config-item config-wrap">
    ${genConfigItemMainHtml(title, desc)}
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size200" id="${id}" value="${value}"/>
</div>`;

const genTextPairRow = (
    title: string,
    desc: string,
    leftId: string,
    leftValue: string,
    rightId: string,
    rightValue: string,
): string =>
    `<div class="fn__flex b3-label config-item config-wrap">
    ${genConfigItemMainHtml(title, desc)}
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size96" id="${leftId}" value="${Lute.EscapeHTMLStr(leftValue)}">
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size96" id="${rightId}" value="${Lute.EscapeHTMLStr(rightValue)}">
</div>`;

const genTextBlockFieldHtml = (
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

const genTextBlockRow = (row: Pick<SettingRowTextBlock, "id" | "title" | "desc" | "mode" | "value">): string => {
    const {id, title, desc, mode, value} = row;
    const field = genTextBlockFieldHtml(id, mode, value);
    return `<div class="b3-label config-item">
    <div class="fn__block">
        ${genConfigItemName(title)}
        <div class="b3-label__text">${desc}</div>
        <div class="fn__hr"></div>
        ${field}
    </div>
</div>`;
};

/** 为指定 `id` 的密码框绑定显隐图标（与 `genTextBlockRow` 中 `input-password` 分支的 DOM 结构配套） */
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

const genStackRight = (r: StackRight): string => {
    switch (r.kind) {
        case "button":
            return genButtonHtml(r.id, r.label, r.icon);
        case "select":
            return genSelectOptionsHtml(r.id, r.options, r.value);
        case "number":
            return genNumberInputHtml(r.id, r.value, r.min, r.max, undefined, undefined);
        case "switch":
            return genSwitchInputHtml(r.id, getSwitchChecked(r.id));
    }
};

const genStackLeft = (left: StackLeft): string => {
    if (left.kind === "textBlock") {
        return `<div class="fn__flex-1 fn__block">${genTextBlockFieldHtml(left.id, left.mode, left.value)}</div>`;
    }
    return `<div class="fn__flex-center fn__flex-1${left.kind === "desc" ? " ft__on-surface" : " config-name"}">${left.text}</div>`;
};

const genSwitchQueryItem = (item: SwitchQueryItem): string => {
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

const genSwitchQuery = (row: SettingRowSwitchQuery): string =>
`<div class="b3-label config-item">
    ${genConfigItemName(row.title)}
    <div class="config-query">
        ${row.items.map(genSwitchQueryItem).join("")}
    </div>
    ${row.footer ? `<div class="fn__hr"></div><div class="fn__flex-1"><div class="b3-label__text">${row.footer}</div></div>` : ""}
</div>`;

const genStack = (entry: SettingRowStack): string => {
    const parts: string[] = [];
    entry.lines.forEach((line, index) => {
        if (index > 0) {
            parts.push('<div class="fn__hr"></div>');
        }
        const {left, right} = line;
        if (!right) {
            parts.push(`<div class="fn__flex config-wrap">${genStackLeft(left)}</div>`);
        } else {
            const tag = right.kind === "switch" ? "label" : "div";
            parts.push(`<${tag} class="fn__flex${right.kind === "switch" ? "" : " config-wrap"}">
    ${genStackLeft(left)}
    <span class="fn__space"></span>
    ${genStackRight(right)}
</${tag}>`);
        }
    });
    return `<div class="b3-label config-item">${parts.join("")}</div>`;
};

const genNotebookSavePathRow = (
    title: string,
    desc: string,
    selectId: string,
    pathId: string,
    selectOptionsHtml: string,
): string =>
    `<div class="b3-label config-item config-item--save-path">
    ${genConfigItemName(title)}
    <div class="b3-label__text">${desc}</div>
    <div class="fn__hr"></div>
    <div class="fn__flex config-wrap">
        <select class="b3-select fn__size200" id="${selectId}">${selectOptionsHtml}</select>
        <div class="fn__space"></div>
        <input class="b3-text-field fn__flex-1" id="${pathId}" value="">
    </div>
</div>`;

const genRowHtml = (row: SettingRow): string => {
    const cfg = window.siyuan.config;
    switch (row.type) {
        case "switch":
            return genSwitchRow(row.id, row.title, row.desc, getSwitchChecked(row.id));
        case "text": {
            const val = getAtPath(cfg, row.id);
            const str = typeof val === "string" ? val : "";
            return genTextRow(row.id, row.title, row.desc, str);
        }
        case "textPair": {
            const leftVal = getAtPath(cfg, row.leftId);
            const rightVal = getAtPath(cfg, row.rightId);
            const leftStr = typeof leftVal === "string" ? leftVal : "";
            const rightStr = typeof rightVal === "string" ? rightVal : "";
            return genTextPairRow(row.title, row.desc, row.leftId, leftStr, row.rightId, rightStr);
        }
        case "textBlock":
            return genTextBlockRow(row);
        case "number": {
            const raw = getAtPath(cfg, row.id);
            const value = typeof raw === "number" && !Number.isNaN(raw) ? raw : 0;
            return genNumberRow(
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
            return genRangeRow(
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
            return genSelectRow(row.id, row.title, row.desc, row.options, current);
        }
        case "button":
            return genButtonRow(row);
        case "custom":
            return row.html();
        case "stack":
            return genStack(row);
        case "switchQuery":
            return genSwitchQuery(row);
        case "notebookSavePath":
            return genNotebookSavePathRow(
                row.title,
                row.desc,
                row.selectId,
                row.pathId,
                row.getOptionsHtml(),
            );
    }
};

/** 生成设置分组 HTML */
export const genConfigGroup = (itemsHtml: string, title?: string): string =>
    `<div class="config-group">${title ? `<div class="config-title">${title}</div>` : ""}<div class="config-items">${itemsHtml}</div></div>`;

/** 按节列表生成设置页面 HTML */
export const genSettingTabHtmlFromSections = (sections: SettingSection[]): string => {
    const parts: string[] = [];
    sections.forEach((section) => {
        const itemsHtml = section.items.map((row) => genRowHtml(row)).join("");
        parts.push(genConfigGroup(itemsHtml, section.title));
    });
    return parts.join("");
};
