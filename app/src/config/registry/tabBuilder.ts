import type {App} from "../../index";
import type {RowPart, StackLine, SwitchQueryItem} from "../render/parts";
import {genButtonRowHtml, genStackHtml, genSwitchQueryHtml, genTextPairHtml} from "../render/render";
import type {ConfigValue} from "./configValue";
import {configBooleanValue, configNumberValue, configSelectValue, configStringValue} from "./configValue";
import {readControlPart, type ControlPart} from "./domIO";
import {bindPasswordIconaToggle} from "../render/fragments";
import {registerGroup} from "./group";
import {registerItem, RegisterSettingItem} from "./item";

export type SaveFn = (value: unknown) => void | Promise<void>;

/** 侧栏 / 菜单等壳层字段（`RegistryBuilder.tab` / `panel` 入参均平铺） */
export interface ConfigTabShell<TId extends string = string> {
    id: TId;
    icon: string;
    title: () => string;
    hidden?: () => boolean;
}

export interface ConfigTabOptions<TId extends string = string> extends ConfigTabShell<TId> {
    namespace: string;
    /** 控件未指定 save 时，按控件 id 提交配置变更 */
    defaultSave?: (controlId: string, value: unknown) => void;
    /** 注册表 mount 完成后的 Tab 级初始化（如记录根节点、拉取动态数据） */
    afterMount?: (root: HTMLElement, app?: App) => void | Promise<void>;
}

export interface PanelTabOptions<TId extends string = string> extends ConfigTabShell<TId> {
    searchStrings: () => string[];
    mount: (root: HTMLElement, searchQuery?: string, app?: App) => void | Promise<void>;
}

type ControlMetaBase = {
    title: string;
    desc?: string;
    read?: (el: HTMLElement) => unknown;
    save?: SaveFn;
    afterMount?: (root: HTMLElement) => void | Promise<void>;
    keywords?: string[];
};
type SwitchMeta = ControlMetaBase & {
    /** 省略时按控件 id 从 config 读取 */
    value?: ConfigValue<boolean>;
};
type NumberMeta = ControlMetaBase & {
    min?: number;
    max?: number;
    step?: string;
    unit?: string;
};
type RangeMeta = ControlMetaBase & {
    min: number;
    max: number;
    step: number;
};
type SelectMeta = ControlMetaBase & {
    options: {
        value: number | string;
        label?: string;
    }[];
    /** 省略时按控件 id 从 config 读取；虚拟 / 派生项需显式传入 */
    value?: ConfigValue<number | string>;
};
type TextMeta = ControlMetaBase & {
    desc: string;
};
type TextBlockMeta = TextMeta & {
    mode: "input-text" | "input-password" | "textarea";
    /** 省略时按控件 id 从 config 读取 */
    value?: ConfigValue<string>;
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
    controlPart: ControlPart;
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
    value?: ConfigValue<number | string>;
};
type BlockNumberMeta = {
    desc: string;
    min?: number;
    max?: number;
};
type BlockSwitchMeta = {
    desc: string;
};
type BlockTextBlockMeta = {
    mode: "input-text" | "input-password" | "textarea";
    value?: ConfigValue<string>;
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
                controlPart: {
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
            controls.push({id: right.id, controlPart: {kind: "switch", id: right.id, value: right.value}});
        } else if (right.kind === "number") {
            controls.push({
                id: right.id,
                controlPart: {kind: "number", id: right.id, value: right.value, min: right.min, max: right.max},
            });
        } else if (right.kind === "select") {
            controls.push({
                id: right.id,
                controlPart: {kind: "select", id: right.id, options: right.options, value: right.value},
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

const defaultSearchTexts = (meta: {title?: string; desc?: string; keywords?: string[]}) => {
    if (meta.keywords) {
        return () => [...meta.keywords!];
    }
    return () => [meta.title, meta.desc].filter((s): s is string => Boolean(s));
};

/** 组合块内逐行注册；由 `GroupBuilder.block` 回调使用 */
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
        const value = meta.value ?? configSelectValue(id, meta.options);
        this.lines.push({
            left: {kind: "desc", text: meta.desc},
            right: {kind: "select", id, options: meta.options, value},
        });
        return this;
    }

    switch(path: string, meta: BlockSwitchMeta) {
        const id = resolveId(this.namespace, path);
        this.lines.push({
            left: {kind: "desc", text: meta.desc},
            right: {kind: "switch", id, value: configBooleanValue(id)},
        });
        return this;
    }

    number(path: string, meta: BlockNumberMeta) {
        const id = resolveId(this.namespace, path);
        this.lines.push({
            left: {kind: "desc", text: meta.desc},
            right: {kind: "number", id, value: configNumberValue(id), min: meta.min, max: meta.max},
        });
        return this;
    }

    textBlock(path: string, meta: BlockTextBlockMeta) {
        const id = resolveId(this.namespace, path);
        const value = meta.value ?? configStringValue(id);
        this.lines.push({
            left: {kind: "textBlock", id, mode: meta.mode, value},
        });
        return this;
    }
}

export class GroupBuilder<TId extends string> {
    constructor(
        private readonly tab: ConfigTabOptions<TId>,
        readonly groupKey: string,
    ) {}

    /**
     * 注册标准控件：由 `rowParts` 参与 mount 渲染，并接入 save 路由与设置搜索。
     */
    private registerControl(
        path: string,
        rowParts: RowPart[],
        meta: ControlMetaBase,
    ) {
        const id = resolveId(this.tab.namespace, path);
        registerItem({
            id,
            tabId: this.tab.id,
            groupKey: this.groupKey,
            kind: "full",
            rowParts,
            searchTexts: defaultSearchTexts({title: meta.title, desc: meta.desc, keywords: meta.keywords}),
            read: meta.read ?? ((el) => {
                const part = rowParts.find((p): p is ControlPart => "id" in p && p.id === id);
                return part ? readControlPart(part, el) : undefined;
            }),
            save: meta.save ?? this.tab.defaultSave?.bind(null, id),
            afterMount: meta.afterMount,
        } as RegisterSettingItem);
        return this;
    }

    switch(path: string, meta: SwitchMeta) {
        const id = resolveId(this.tab.namespace, path);
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            ...(meta.desc ? [{kind: "desc" as const, text: meta.desc}] : []),
            {kind: "switch", id, value: meta.value ?? configBooleanValue(id)},
        ], meta);
    }

    number(path: string, meta: NumberMeta) {
        const id = resolveId(this.tab.namespace, path);
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc ?? ""},
            {kind: "number", id, value: configNumberValue(id), min: meta.min, max: meta.max, step: meta.step, unit: meta.unit},
        ], meta);
    }

    range(path: string, meta: RangeMeta) {
        const id = resolveId(this.tab.namespace, path);
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc ?? ""},
            {kind: "range", id, value: configNumberValue(id, meta.min), min: meta.min, max: meta.max, step: meta.step},
        ], meta);
    }

    select(path: string, meta: SelectMeta) {
        const id = resolveId(this.tab.namespace, path);
        const value = meta.value ?? configSelectValue(id, meta.options);
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc ?? ""},
            {kind: "select", id, options: meta.options, value},
        ], meta);
    }

    text(path: string, meta: TextMeta) {
        const id = resolveId(this.tab.namespace, path);
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc},
            {kind: "text", id, value: configStringValue(id)},
        ], meta);
    }

    textBlock(path: string, meta: TextBlockMeta) {
        const id = resolveId(this.tab.namespace, path);
        const value = meta.value ?? configStringValue(id);
        const afterMount = meta.mode === "input-password"
            ? async (root: HTMLElement) => {
                bindPasswordIconaToggle(root, id);
                await meta.afterMount?.(root);
            }
            : meta.afterMount;
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc},
            {kind: "textBlock", id, mode: meta.mode, value},
        ], {...meta, afterMount});
    }

    textPair(meta: TextPairMeta) {
        const leftId = resolveId(this.tab.namespace, meta.leftPath);
        const rightId = resolveId(this.tab.namespace, meta.rightPath);
        const searchTexts = meta.keywords ?? [meta.title, meta.desc];
        const leftValue = configStringValue(leftId);
        const rightValue = configStringValue(rightId);
        const key = meta.key ?? `textPair_${meta.leftPath}_${meta.rightPath}`;
        this.composite({
            key,
            keywords: searchTexts,
            html: () => genTextPairHtml(meta.title, meta.desc, leftId, leftValue, rightId, rightValue),
            controls: [
                {id: leftId, controlPart: {kind: "text", id: leftId, value: leftValue}},
                {id: rightId, controlPart: {kind: "text", id: rightId, value: rightValue}},
            ],
        });
        return this;
    }

    block(meta: BlockMeta, configure: (b: BlockBuilder) => void) {
        const builder = new BlockBuilder(this.tab.namespace);
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
        const items: SwitchQueryItem[] = [];
        const controls: CompositeControlMeta[] = [];
        for (const item of meta.items) {
            const id = resolveId(this.tab.namespace, item.id);
            items.push({...item, id});
            controls.push(
                item.kind === "switch"
                    ? {id, controlPart: {kind: "switch", id}}
                    : {id, controlPart: {kind: "number", id, min: item.min, max: item.max}},
            );
        }
        this.composite({
            key: meta.key,
            keywords: searchTexts,
            html: () => genSwitchQueryHtml(meta.title, items, meta.footer),
            controls,
        });
        return this;
    }

    /**
     * 纯展示 / 自行绑定事件的块。
     */
    slot(meta: SlotMeta) {
        const id = `${this.tab.namespace}.__slot.${meta.key}`;
        registerItem({
            id,
            tabId: this.tab.id,
            groupKey: this.groupKey,
            kind: "render",
            html: meta.html,
            searchTexts: () => [...meta.keywords],
            afterMount: meta.afterMount,
        } as RegisterSettingItem);
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
            const controlId = resolveId(this.tab.namespace, control.id);
            const controlPart = {...control.controlPart, id: controlId};
            registerItem({
                id: controlId,
                tabId: this.tab.id,
                groupKey: this.groupKey,
                kind: "binding",
                controlPart,
                read: control.read ?? ((el) => readControlPart(controlPart, el)),
                save: control.save ?? this.tab.defaultSave?.bind(null, controlId),
            } as RegisterSettingItem);
        }
        return this;
    }
}
export class TabBuilder<TId extends string = string> {
    constructor(private readonly tab: ConfigTabOptions<TId>) {}

    group(groupKey: string, groupTitle: string) {
        registerGroup(this.tab.id, groupKey, groupTitle);
        return new GroupBuilder(this.tab, groupKey);
    }
}
