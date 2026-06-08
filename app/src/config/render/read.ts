import type {RowPart} from "./parts";
import {readDomValue} from "../ui/formValue";

/** 按控件部件从 DOM 读值（与 ui/formValue 约定一致） */
export const readControlPart = (part: Exclude<RowPart, {kind: "title"} | {kind: "desc"}>, el: HTMLElement): unknown => {
    switch (part.kind) {
        case "switch":
            return (el as HTMLInputElement).checked;
        case "number":
        case "range":
            return readDomValue(el);
        case "select": {
            const options = part.options ?? [];
            const num = options.length > 0 && typeof options[0].value === "number";
            return num ? parseInt((el as HTMLSelectElement).value, 10) : (el as HTMLSelectElement).value;
        }
        case "text":
        case "textBlock":
            return (el as HTMLInputElement | HTMLTextAreaElement).value;
    }
};
