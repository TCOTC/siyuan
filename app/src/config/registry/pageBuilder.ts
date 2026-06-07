import type {App} from "../../index";
import type {RowPart, StackLine, SwitchQueryItem} from "../render/parts";
import {genButtonRowHtml, genStackHtml, genSwitchQueryHtml, genTextPairHtml} from "../render/render";
import {getAtPath} from "../ui/dotPath";
import {readControlPart} from "../render/read";
import {bindPasswordIconaToggle} from "../ui/render";
import {collectTabSearchStrings} from "../filter/itemSearch";
import {getMountableItemsByTabId, registerItem, type ControlPart} from "./item";
import {mountConfigPage} from "./mount";

export type SaveFn = (value: unknown) => void | Promise<void>;
export interface ConfigPageSaveDefaults {
    patch: (relOrFullId: string, value: unknown) => void;
}
/** 侧栏 / 菜单等壳层字段（define*Page 入参与 `ConfigPage` 返回值均平铺） */
export interface ConfigPageShell<TId extends string = string> {
    id: TId;
    order: number;
    icon: string;
    title: () => string;
    hidden?: () => boolean;
}

export interface ConfigPageOptions<TId extends string = string> extends ConfigPageShell<TId> {
    namespace: string;
    saveDefaults?: ConfigPageSaveDefaults;
    /** 注册表 mount 完成后的 Tab 级初始化（如记录根节点、拉取动态数据） */
    afterMount?: (root: HTMLElement, app?: App) => void | Promise<void>;
}

export interface PanelPageOptions<TId extends string = string> extends ConfigPageShell<TId> {
    searchStrings: () => string[];
    mount: (root: HTMLElement, searchQuery?: string, app?: App) => void | Promise<void>;
}

type SwitchMeta = {
    title: string;
    desc?: string;
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
    afterMount?: (root: HTMLElement) => void | Promise<void>;
};
export type CompositeControlMeta = {
    /** DOM id 或相对路径（与 `resolveId` 一致） */
    id: string;
    part: ControlPart;
    read?: (el: HTMLElement) => unknown;
    save?: SaveFn;
};
type CompositeMeta = SlotMeta & {
    controls: CompositeControlMeta[];
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
    afterMount?: (root: HTMLElement) => void | Promise<void>;
};

const stackLinesToControls = (lines: StackLine[]): CompositeControlMeta[] => {
    const controls: CompositeControlMeta[] = [];
    for (const line of lines) {
        if (line.left.kind === "textBlock") {
            controls.push({
                id: line.left.id,
                part: {
                    kind: "textBlock",
                    id: line.left.id,
                    mode: line.left.mode,
                    value: line.left.value,
                },
            });
        }
        const right = line.right;
        if (!right || right.kind === "button") {
            continue;
        }
        if (right.kind === "switch") {
            controls.push({id: right.id, part: {kind: "switch", id: right.id}});
        } else if (right.kind === "number") {
            controls.push({
                id: right.id,
                part: {kind: "number", id: right.id, min: right.min, max: right.max},
            });
        } else if (right.kind === "select") {
            controls.push({
                id: right.id,
                part: {kind: "select", id: right.id, options: right.options, value: right.value},
            });
        }
    }
    return controls;
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

class SectionBuilder<TId extends string> {
    constructor(
        private readonly page: ConfigPageOptions<TId>,
        readonly sectionKey: string,
        readonly sectionTitle: string,
    ) {}

    /**
     * 注册标准控件：由 `parts` 参与 mount 渲染，并接入 save 路由与设置搜索。
     */
    private registerControl(
        path: string,
        parts: RowPart[],
        meta: SwitchMeta & {keywords?: string[]},
    ) {
        const id = resolveId(this.page.namespace, path);
        registerItem({
            id,
            tabId: this.page.id,
            sectionKey: this.sectionKey,
            sectionTitle: this.sectionTitle,
            kind: "full",
            parts,
            searchTexts: defaultSearchTexts({title: meta.title, desc: meta.desc, keywords: meta.keywords}),
            read: meta.read,
            save: meta.save ?? ((value) => (this.page.saveDefaults?.patch ?? noopPatch)(id, value)),
            afterMount: meta.afterMount,
        });
        return this;
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
        this.composite({
            key,
            keywords: searchTexts,
            html: () => genTextPairHtml(meta.title, meta.desc, leftId, leftStr, rightId, rightStr),
            controls: [
                {id: leftId, part: {kind: "text", id: leftId}},
                {id: rightId, part: {kind: "text", id: rightId}},
            ],
        });
        return this;
    }

    block(meta: BlockMeta, configure: (b: BlockBuilder) => void) {
        const builder = new BlockBuilder(this.page.namespace);
        configure(builder);
        const lines = builder.getLines();
        const searchTexts = meta.keywords ?? [];
        this.composite({
            key: meta.key,
            keywords: searchTexts,
            html: () => genStackHtml(lines),
            afterMount: meta.afterMount,
            controls: stackLinesToControls(lines),
        });
        return this;
    }

    button(meta: ButtonMeta) {
        const searchTexts = meta.keywords ?? [meta.title, meta.desc, meta.label].filter((s): s is string => Boolean(s));
        const key = meta.key ?? `button_${meta.id}`;
        this.slot({
            key,
            keywords: searchTexts,
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
        const controls: CompositeControlMeta[] = meta.items.map((item) => {
            const controlId = resolveId(this.page.namespace, item.id);
            if (item.kind === "switch") {
                return {id: controlId, part: {kind: "switch", id: controlId}};
            }
            return {
                id: controlId,
                part: {kind: "number", id: controlId, min: item.min, max: item.max},
            };
        });
        this.composite({
            key: meta.key,
            keywords: searchTexts,
            html: () => genSwitchQueryHtml(meta.title, meta.items, meta.footer),
            controls,
        });
        return this;
    }

    /**
     * 纯展示 / 自行绑定事件的块。
     */
    slot(meta: SlotMeta) {
        const id = `${this.page.namespace}.__slot.${meta.key}`;
        registerItem({
            id,
            tabId: this.page.id,
            sectionKey: this.sectionKey,
            sectionTitle: this.sectionTitle,
            kind: "render",
            html: meta.html,
            searchTexts: () => [...meta.keywords],
            afterMount: meta.afterMount,
        });
        return this;
    }

    /**
     * 自定义 HTML 块 + 内嵌控件 save：分别声明 render 项与 binding 项。
     */
    composite(meta: CompositeMeta) {
        this.slot({
            key: meta.key,
            keywords: meta.keywords,
            html: meta.html,
            afterMount: meta.afterMount,
        });
        for (const control of meta.controls) {
            const controlId = resolveId(this.page.namespace, control.id);
            const part = {...control.part, id: controlId};
            registerItem({
                id: controlId,
                tabId: this.page.id,
                sectionKey: this.sectionKey,
                sectionTitle: this.sectionTitle,
                kind: "binding",
                part,
                read: control.read ?? ((el) => readControlPart(part, el)),
                save: control.save ?? ((value) => (this.page.saveDefaults?.patch ?? noopPatch)(controlId, value)),
            });
        }
        return this;
    }
}
export class PageBuilder<TId extends string = string> {
    constructor(private readonly page: ConfigPageOptions<TId>) {}
    section(sectionKey: string, sectionTitle: string) {
        return new SectionBuilder(this.page, sectionKey, sectionTitle);
    }
}

export type ConfigPage<TId extends string = string> = ConfigPageShell<TId> & {
    mount: (root: HTMLElement, searchQuery?: string, app?: App) => Promise<void>;
    searchStrings: () => string[];
};

/** 定义配置页面 */
export const defineConfigPage = <TId extends string>(
    options: ConfigPageOptions<TId>,
    setup: (page: PageBuilder<TId>) => void,
): ConfigPage<TId> => {
    const {namespace, saveDefaults, afterMount, ...shell} = options;
    let registered = false;
    const ensureRegistered = () => {
        if (registered) {
            return;
        }
        registered = true;
        setup(new PageBuilder(options));
    };
    return {
        ...shell,
        mount: async (root, searchQuery, app) => {
            ensureRegistered();
            await mountConfigPage(options.id, root, searchQuery);
            await afterMount?.(root, app);
        },
        searchStrings: () => {
            ensureRegistered();
            const items = getMountableItemsByTabId(options.id);
            return collectTabSearchStrings(options.title(), items);
        },
    };
};

/** 定义无注册项的页面 */
export const definePanelPage = <TId extends string>(
    options: PanelPageOptions<TId>,
): ConfigPage<TId> => {
    const {searchStrings, mount: panelMount, ...shell} = options;
    return {
        ...shell,
        mount: async (root, searchQuery, app) => panelMount(root, searchQuery, app),
        searchStrings,
    };
};
