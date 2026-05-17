import {getAtPath} from "./dotPath";
import {type SettingRow, findStackRightByControlId} from "./settingRows";

/**
 * 从 DOM 读出控件值。
 * @param row 当前 Tab 内与 `el.id` 对应的 `SettingRow`；`custom` 内控件通常无行定义，可省略。
 */
export function readDomValue(el: HTMLElement, row?: SettingRow): unknown {
    if (el instanceof HTMLSelectElement) {
        if (!row) {
            return parseInt(el.value, 10);
        }
        if (row.type === "select") {
            // 约定同一个 options 里的 value 都是相同类型
            return row.options.length > 0 && typeof row.options[0].value === "number"
                ? parseInt(el.value, 10)
                : el.value;
        }
        if (row.type === "stack") {
            const sub = findStackRightByControlId(row, el.id);
            if (sub?.kind === "select") {
                return sub.options.length > 0 && typeof sub.options[0].value === "number"
                    ? parseInt(el.value, 10)
                    : el.value;
            }
        }
        if (row.type === "notebookSavePath") {
            return el.value;
        }
        return parseInt(el.value, 10);
    }
    if (el instanceof HTMLTextAreaElement) {
        return el.value;
    }
    if (el instanceof HTMLInputElement) {
        switch (el.type) {
            case "checkbox":
                return el.checked;
            case "number":
            case "range": {
                const step = el.getAttribute("step")?.trim().toLowerCase() ?? "";
                const useFloat = step === "any" || step.includes(".");
                const parseNum = (s: string) => (useFloat ? parseFloat(s) : parseInt(s, 10));
                let number = useFloat ? parseFloat(el.value) : parseInt(el.value, 10);
                const invalid = Number.isNaN(number);
                if (invalid) {
                    // 无效时回退原配置或默认值 0
                    const raw = getAtPath(window.siyuan.config, el.id);
                    number = typeof raw === "number" && !Number.isNaN(raw) ? raw : 0;
                }
                const minRaw = el.getAttribute("min") ?? "";
                const maxRaw = el.getAttribute("max") ?? "";
                const min = minRaw === "" ? NaN : parseNum(minRaw);
                const max = maxRaw === "" ? NaN : parseNum(maxRaw);
                if (!Number.isNaN(min)) {
                    number = Math.max(min, number);
                }
                if (!Number.isNaN(max)) {
                    number = Math.min(max, number);
                }
                // 写回控件
                const valueStr = String(number);
                if (el.value !== valueStr) {
                    el.value = valueStr;
                }
                if (el.type === "range") {
                    el.parentElement?.setAttribute("aria-label", valueStr);
                }
                return number;
            }
            default:
                return el.value;
        }
    }
    return undefined;
}
