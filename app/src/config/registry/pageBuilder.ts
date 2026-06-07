import type {App} from "../../index";
import type {TConfigTab} from "../types";
import type {RowPart, StackLine, SwitchQueryItem} from "../render/parts";
import {genButtonRowHtml, genStackHtml, genSwitchQueryHtml, genTextPairHtml} from "../render/render";
import {getAtPath} from "../ui/dotPath";
import {readControlPart} from "../render/read";
import {bindPasswordIconaToggle} from "../ui/render";
import {collectTabSearchStrings} from "../filter/itemSearch";
import {getAllSettingItems, registerItem} from "./item";
import {mountConfigPage} from "./mount";

export type SaveFn = (value: unknown) => void | Promise<void>;
export interface ConfigPageSaveDefaults {
    patch: (relOrFullId: string, value: unknown) => void;
}
export interface ConfigPageOptions {
    id: TConfigTab;
    namespace: string;
    tabLabel: () => string;
    saveDefaults?: ConfigPageSaveDefaults;
    /** 注册表 mount 完成后的 Tab 级初始化（如记录根节点、拉取动态数据） */
    afterMount?: (root: HTMLElement, app?: App) => void | Promise<void>;
}

export interface PanelPageOptions {
    id: TConfigTab;
    tabLabel: () => string;
    searchStrings: () => string[];
    mount: (root: HTMLElement, searchQuery?: string, app?: App) => void | Promise<void>;
}

type SwitchMeta = {
    title: string;
    desc?: string;
    visible?: () => boolean;
    read?: (el: HTMLElement) => unknown;
    save?: SaveFn;
    afterMount?: (root: HTMLElement) => void | Promise<void>;
};
type NumberMeta = SwitchMeta & {
    min?: number;
    max?: number;
    step?: string;
    unit?: string;
};
type RangeMeta = SwitchMeta & {
    min: number;
    max: number;
    step: number;
};
type SelectMeta = SwitchMeta & {
    options: {
        value: number | string;
        label?: string;
    }[];
    value: number | string;
};
type TextMeta = SwitchMeta & {
    desc: string;
};
type TextBlockMeta = TextMeta & {
    mode: "input-text" | "input-password" | "textarea";
    value: string;
};
type SlotMeta = {
    key: string;
    keywords: string[];
    html: () => string;
    visible?: () => boolean;
    afterMount?: (root: HTMLElement) => void | Promise<void>;
};
type SwitchQueryMeta = {
    key: string;
    title: string;
    footer?: string;
    items: SwitchQueryItem[];
};
type TextPairMeta = {
    key?: string;
    title: string;
    desc: string;
    leftPath: string;
    rightPath: string;
    keywords?: string[];
};
type BlockMeta = {
    key: string;
    keywords?: string[];
    visible?: () => boolean;
    afterMount?: (root: HTMLElement) => void | Promise<void>;
};
type BlockButtonMeta = {
    id: string;
    label: string;
    icon: string;
};
type BlockSelectMeta = {
    desc: string;
    options: {
        value: number | string;
        label?: string;
    }[];
    value: number | string;
};
type BlockNumberMeta = {
    desc: string;
    value?: number;
    min?: number;
    max?: number;
};
type BlockSwitchMeta = {
    desc: string;
};
type BlockTextBlockMeta = {
    mode: "input-text" | "input-password" | "textarea";
    value: string;
};
type ButtonMeta = {
    key?: string;
    id: string;
    title: string;
    desc?: string;
    label: string;
    icon: string;
    keywords?: string[];
    visible?: () => boolean;
    afterMount?: (root: HTMLElement) => void | Promise<void>;
};

const registerStackEmbeddedControls = (
    sb: SectionBuilder,
    lines: StackLine[],
    searchTexts: string[],
) => {
    for (const line of lines) {
        if (line.left.kind === "textBlock") {
            const controlId = line.left.id;
            sb.registerEmbeddedControl(
                controlId,
                {kind: "textBlock", id: controlId, mode: line.left.mode, value: line.left.value},
                searchTexts,
            );
        }
        const right = line.right;
        if (!right || right.kind === "button") {
            continue;
        }
        const controlId = right.id;
        if (right.kind === "switch") {
            sb.registerEmbeddedControl(controlId, {kind: "switch", id: controlId}, searchTexts);
        } else if (right.kind === "number") {
            sb.registerEmbeddedControl(
                controlId,
                {kind: "number", id: controlId, min: right.min, max: right.max},
                searchTexts,
            );
        } else if (right.kind === "select") {
            sb.registerEmbeddedControl(
                controlId,
                {kind: "select", id: controlId, options: right.options, value: right.value},
                searchTexts,
            );
        }
    }
};

const CONFIG_ID_PREFIXES = [
    "editor.",
    "fileTree.",
    "appearance.",
    "export.",
    "search.",
    "flashcard.",
    "ai.",
    "system.",
    "api.",
    "publish.",
    "account.",
    "sync.",
    "repo.",
];

/** 相对路径加命名空间前缀；已含已知配置域前缀则视为全路径 */
const resolveId = (namespace: string, path: string) => {
    if (path.startsWith(`${namespace}.`) || CONFIG_ID_PREFIXES.some((prefix) => path.startsWith(prefix))) {
        return path;
    }
    return `${namespace}.${path}`;
};

const noopPatch = () => {};

const defaultSearchTexts = (meta: {title?: string; desc?: string; keywords?: string[]}) => {
    if (meta.keywords) {
        return () => [...meta.keywords!];
    }
    return () => [meta.title, meta.desc].filter((s): s is string => Boolean(s));
};

/** 组合块内逐行注册；由 `SectionBuilder.block` 回调使用 */
export class BlockBuilder {
    private readonly lines: StackLine[] = [];

    constructor(private readonly namespace: string) {}

    getLines(): StackLine[] {
        return this.lines;
    }

    title(text: string) {
        this.lines.push({left: {kind: "title", text}});
        return this;
    }

    /** 为上一行（通常为 title / desc）追加右侧按钮 */
    button(meta: BlockButtonMeta) {
        const last = this.lines[this.lines.length - 1];
        if (last) {
            last.right = {kind: "button", ...meta};
        }
        return this;
    }

    desc(text: string) {
        this.lines.push({left: {kind: "desc", text}});
        return this;
    }

    select(path: string, meta: BlockSelectMeta) {
        const id = resolveId(this.namespace, path);
        this.lines.push({
            left: {kind: "desc", text: meta.desc},
            right: {kind: "select", id, options: meta.options, value: meta.value},
        });
        return this;
    }

    switch(path: string, meta: BlockSwitchMeta) {
        const id = resolveId(this.namespace, path);
        this.lines.push({
            left: {kind: "desc", text: meta.desc},
            right: {kind: "switch", id},
        });
        return this;
    }

    number(path: string, meta: BlockNumberMeta) {
        const id = resolveId(this.namespace, path);
        const raw = getAtPath(window.siyuan.config, id);
        const value = typeof meta.value === "number"
            ? meta.value
            : (typeof raw === "number" && !Number.isNaN(raw) ? raw : 0);
        this.lines.push({
            left: {kind: "desc", text: meta.desc},
            right: {kind: "number", id, value, min: meta.min, max: meta.max},
        });
        return this;
    }

    textBlock(path: string, meta: BlockTextBlockMeta) {
        const id = resolveId(this.namespace, path);
        this.lines.push({
            left: {kind: "textBlock", id, mode: meta.mode, value: meta.value},
        });
        return this;
    }
}

class SectionBuilder {
    constructor(
        private readonly page: ConfigPageOptions,
        readonly sectionKey: string,
        readonly sectionTitle: string,
    ) {}
    private registerControl(
        path: string,
        parts: RowPart[],
        meta: SwitchMeta & {keywords?: string[]},
    ) {
        if (meta.visible && !meta.visible()) {
            return this;
        }
        const id = resolveId(this.page.namespace, path);
        registerItem({
            id,
            tab: this.page.id,
            sectionKey: this.sectionKey,
            sectionTitle: this.sectionTitle,
            kind: "control",
            parts,
            visible: meta.visible,
            searchTexts: defaultSearchTexts({title: meta.title, desc: meta.desc, keywords: meta.keywords}),
            read: meta.read,
            save: meta.save ?? ((value) => (this.page.saveDefaults?.patch ?? noopPatch)(id, value)),
            afterMount: meta.afterMount,
        });
        return this;
    }
    /** slot / stack 内控件：仅参与 save 路由，不单独渲染 */
    registerEmbeddedControl(
        controlId: string,
        part: Exclude<RowPart, {kind: "title"} | {kind: "desc"}>,
        searchTexts: string[],
        save?: SaveFn,
    ) {
        registerItem({
            id: controlId,
            tab: this.page.id,
            sectionKey: this.sectionKey,
            sectionTitle: this.sectionTitle,
            kind: "control",
            parts: [part],
            visible: () => false,
            searchTexts: () => searchTexts,
            read: (el) => readControlPart(part, el),
            save: save ?? ((value) => (this.page.saveDefaults?.patch ?? noopPatch)(controlId, value)),
        });
    }
    switch(path: string, meta: SwitchMeta) {
        const id = resolveId(this.page.namespace, path);
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            ...(meta.desc ? [{kind: "desc" as const, text: meta.desc}] : []),
            {kind: "switch", id},
        ], meta);
    }
    number(path: string, meta: NumberMeta) {
        const id = resolveId(this.page.namespace, path);
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc ?? ""},
            {kind: "number", id, min: meta.min, max: meta.max, step: meta.step, unit: meta.unit},
        ], meta);
    }
    range(path: string, meta: RangeMeta) {
        const id = resolveId(this.page.namespace, path);
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc ?? ""},
            {kind: "range", id, min: meta.min, max: meta.max, step: meta.step},
        ], meta);
    }
    select(path: string, meta: SelectMeta) {
        const id = resolveId(this.page.namespace, path);
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc ?? ""},
            {kind: "select", id, options: meta.options, value: meta.value},
        ], meta);
    }
    text(path: string, meta: TextMeta) {
        const id = resolveId(this.page.namespace, path);
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc},
            {kind: "text", id},
        ], meta);
    }
    textBlock(path: string, meta: TextBlockMeta) {
        const id = resolveId(this.page.namespace, path);
        const afterMount = meta.mode === "input-password"
            ? async (root: HTMLElement) => {
                bindPasswordIconaToggle(root, id);
                await meta.afterMount?.(root);
            }
            : meta.afterMount;
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc},
            {kind: "textBlock", id, mode: meta.mode, value: meta.value},
        ], {...meta, afterMount});
    }
    textPair(meta: TextPairMeta) {
        const leftId = resolveId(this.page.namespace, meta.leftPath);
        const rightId = resolveId(this.page.namespace, meta.rightPath);
        const searchTexts = meta.keywords ?? [meta.title, meta.desc];
        const leftVal = getAtPath(window.siyuan.config, leftId);
        const rightVal = getAtPath(window.siyuan.config, rightId);
        const leftStr = typeof leftVal === "string" ? leftVal : "";
        const rightStr = typeof rightVal === "string" ? rightVal : "";
        const key = meta.key ?? `textPair_${meta.leftPath}_${meta.rightPath}`;
        this.slot({
            key,
            keywords: searchTexts,
            html: () => genTextPairHtml(meta.title, meta.desc, leftId, leftStr, rightId, rightStr),
        });
        this.registerEmbeddedControl(leftId, {kind: "text", id: leftId}, searchTexts);
        this.registerEmbeddedControl(rightId, {kind: "text", id: rightId}, searchTexts);
        return this;
    }
    block(meta: BlockMeta, configure: (b: BlockBuilder) => void) {
        if (meta.visible && !meta.visible()) {
            return this;
        }
        const builder = new BlockBuilder(this.page.namespace);
        configure(builder);
        const lines = builder.getLines();
        const searchTexts = meta.keywords ?? [];
        this.slot({
            key: meta.key,
            keywords: searchTexts,
            visible: meta.visible,
            html: () => genStackHtml(lines),
            afterMount: meta.afterMount,
        });
        registerStackEmbeddedControls(this, lines, searchTexts);
        return this;
    }
    button(meta: ButtonMeta) {
        if (meta.visible && !meta.visible()) {
            return this;
        }
        const searchTexts = meta.keywords ?? [meta.title, meta.desc, meta.label].filter((s): s is string => Boolean(s));
        const key = meta.key ?? `button_${meta.id}`;
        this.slot({
            key,
            keywords: searchTexts,
            visible: meta.visible,
            html: () => genButtonRowHtml(meta.id, meta.title, meta.desc, meta.label, meta.icon),
            afterMount: meta.afterMount,
        });
        return this;
    }
    switchQuery(meta: SwitchQueryMeta) {
        const searchTexts = [
            meta.title,
            ...(meta.footer ? [meta.footer] : []),
            ...meta.items.map((item) => item.label),
        ];
        this.slot({
            key: meta.key,
            keywords: searchTexts,
            html: () => genSwitchQueryHtml(meta.title, meta.items, meta.footer),
        });
        for (const item of meta.items) {
            const controlId = resolveId(this.page.namespace, item.id);
            if (item.kind === "switch") {
                this.registerEmbeddedControl(controlId, {kind: "switch", id: controlId}, searchTexts);
            } else {
                this.registerEmbeddedControl(
                    controlId,
                    {kind: "number", id: controlId, min: item.min, max: item.max},
                    searchTexts,
                );
            }
        }
        return this;
    }
    slot(meta: SlotMeta) {
        if (meta.visible && !meta.visible()) {
            return this;
        }
        const id = `${this.page.namespace}.__slot.${meta.key}`;
        registerItem({
            id,
            tab: this.page.id,
            sectionKey: this.sectionKey,
            sectionTitle: this.sectionTitle,
            kind: "slot",
            html: meta.html,
            visible: meta.visible,
            searchTexts: () => [...meta.keywords],
            afterMount: meta.afterMount,
        });
        return this;
    }
}
export class PageBuilder {
    constructor(private readonly page: ConfigPageOptions) {}
    section(sectionKey: string, sectionTitle: string) {
        return new SectionBuilder(this.page, sectionKey, sectionTitle);
    }
}

export interface ConfigPage {
    tab: TConfigTab;
    mount: (root: HTMLElement, searchQuery?: string, app?: App) => Promise<void>;
    searchStrings: () => string[];
}

/** 集市 / 资源等无注册项的面板 Tab */
export const definePanelPage = (options: PanelPageOptions): ConfigPage => ({
    tab: options.id,
    mount: async (root, searchQuery, app) => {
        await options.mount(root, searchQuery, app);
    },
    searchStrings: options.searchStrings,
});

/** 定义配置页：setup 在首次 mount / searchStrings 时执行，避免模块加载时 window.siyuan 未就绪 */
export const defineConfigPage = (
    options: ConfigPageOptions,
    setup: (page: PageBuilder) => void,
): ConfigPage => {
    let registered = false;
    const ensureRegistered = () => {
        if (registered) {
            return;
        }
        registered = true;
        setup(new PageBuilder(options));
    };
    return {
        tab: options.id,
        mount: async (root, searchQuery, app) => {
            ensureRegistered();
            await mountConfigPage(options.id, root, searchQuery);
            await options.afterMount?.(root, app);
        },
        searchStrings: () => {
            ensureRegistered();
            const items = getAllSettingItems().filter((i) => i.tab === options.id);
            return collectTabSearchStrings(options.tabLabel(), items);
        },
    };
};
