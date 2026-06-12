import type {App} from "../../index";
import type {RowPart, StackLine, SwitchQueryItem} from "../render/parts";
import {genButtonRowHtml, genStackHtml, genSwitchQueryHtml, genTextPairHtml} from "../render/render";
import {
    controlBoolean,
    controlNumber,
    controlRange,
    controlSelect,
    controlString,
    controlTextBlock,
    type SettingControl,
} from "./control";
import {registerSettingGroup} from "./group";
import {registerSettingItem, type RegisterSettingItem} from "./item";
import {scanPanelSettingTabSearch, scanSettingTabSearch} from "../search/match";
import {applySettingTabSearchVisibility, mountSettingTab} from "./mount";

type SaveFn = (value: unknown) => void | Promise<void>;

/** 侧栏 / 菜单等壳层字段（`SettingBuilder.tab` / `panel` 入参均平铺） */
export interface SettingTabShell<TId extends string = string> {
    id: TId;
    icon: string;
    title: () => string;
    hidden?: () => boolean;
}

interface ItemsSettingTabOptions<TId extends string = string> extends SettingTabShell<TId> {
    namespace: string;
    /** 控件未指定 save 时，按控件 id 提交配置变更 */
    defaultSave?: (controlId: string, value: unknown) => void;
    /** 条目 mount 完成后的 SettingTab 级初始化（如记录根节点、拉取动态数据） */
    afterMount?: (root: HTMLElement, app?: App) => void | Promise<void>;
}

interface PanelSettingTabOptions<TId extends string = string> extends SettingTabShell<TId> {
    searchStrings: () => string[];
    mount: (root: HTMLElement, keywords?: string, app?: App) => void | Promise<void>;
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
    readConfig?: () => boolean;
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
    readConfig?: () => number | string;
};
type TextMeta = ControlMetaBase & {
    desc: string;
};
type TextBlockMeta = TextMeta & {
    mode: "input-text" | "input-password" | "textarea";
    /** 省略时按控件 id 从 config 读取 */
    readConfig?: () => string;
};
type SlotMeta = {
    key: string;
    keywords: string[];
    html: () => string;
    afterMount?: (root: HTMLElement) => void | Promise<void>;
};
type CompositeControlMeta = {
    control: SettingControl;
    read?: (el: HTMLElement) => unknown;
    save?: SaveFn;
};
type CompositeMeta = SlotMeta & {
    controls: CompositeControlMeta[];
};
type SwitchQueryInputItem =
    | {kind: "switch"; id: string; label: string; icon?: string}
    | {kind: "number"; id: string; label: string; min?: number; max?: number};
type SwitchQueryMeta = {
    key: string;
    title: string;
    footer?: string;
    items: SwitchQueryInputItem[];
};
type TextPairMeta = {
    key?: string;
    title: string;
    desc: string;
    leftPath: string;
    rightPath: string;
    keywords?: string[];
};
type StackMeta = {
    key: string;
    keywords?: string[];
    afterMount?: (root: HTMLElement) => void | Promise<void>;
};
type StackButtonMeta = {
    id: string;
    label: string;
    icon: string;
};
type StackSelectMeta = {
    desc: string;
    options: {
        value: number | string;
        label?: string;
    }[];
    readConfig?: () => number | string;
};
type StackNumberMeta = {
    desc: string;
    min?: number;
    max?: number;
};
type StackSwitchMeta = {
    desc: string;
};
type StackTextBlockMeta = {
    mode: "input-text" | "input-password" | "textarea";
    readConfig?: () => string;
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
            controls.push({control: line.left});
        }
        const right = line.right;
        if (!right || right.kind === "button") {
            continue;
        }
        controls.push({control: right});
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

/** stack 组合行内逐行注册；由 `SettingGroupBuilder.stack` 回调使用 */
class StackLineBuilder {
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
    button(meta: StackButtonMeta) {
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

    select(path: string, meta: StackSelectMeta) {
        const id = resolveId(this.namespace, path);
        const control = controlSelect(id, {options: meta.options, read: meta.readConfig});
        this.lines.push({
            left: {kind: "desc", text: meta.desc},
            right: control,
        });
        return this;
    }

    switch(path: string, meta: StackSwitchMeta) {
        const id = resolveId(this.namespace, path);
        const control = controlBoolean(id);
        this.lines.push({
            left: {kind: "desc", text: meta.desc},
            right: control,
        });
        return this;
    }

    number(path: string, meta: StackNumberMeta) {
        const id = resolveId(this.namespace, path);
        const control = controlNumber(id, {min: meta.min, max: meta.max});
        this.lines.push({
            left: {kind: "desc", text: meta.desc},
            right: control,
        });
        return this;
    }

    textBlock(path: string, meta: StackTextBlockMeta) {
        const id = resolveId(this.namespace, path);
        const control = controlTextBlock(id, {mode: meta.mode, read: meta.readConfig});
        this.lines.push({left: control});
        return this;
    }
}

class SettingGroupBuilder<TId extends string> {
    constructor(
        private readonly tab: ItemsSettingTabOptions<TId>,
        readonly groupKey: string,
    ) {}

    /**
     * 注册标准控件：由 `rowParts` 参与 mount 渲染，并接入 save 路由与设置搜索。
     */
    private registerControl(
        path: string,
        rowParts: RowPart[],
        control: SettingControl,
        meta: ControlMetaBase,
    ) {
        const id = resolveId(this.tab.namespace, path);
        const afterMount = control.afterMount || meta.afterMount
            ? async (root: HTMLElement) => {
                await control.afterMount?.(root);
                await meta.afterMount?.(root);
            }
            : undefined;
        registerSettingItem({
            id,
            tabId: this.tab.id,
            groupKey: this.groupKey,
            kind: "full",
            rowParts,
            control,
            searchTexts: defaultSearchTexts({title: meta.title, desc: meta.desc, keywords: meta.keywords}),
            read: meta.read ?? ((el) => control.readDom(el)),
            save: meta.save ?? this.tab.defaultSave?.bind(null, id),
            afterMount,
        } as RegisterSettingItem);
        return this;
    }

    switch(path: string, meta: SwitchMeta) {
        const id = resolveId(this.tab.namespace, path);
        const control = controlBoolean(id, {read: meta.readConfig});
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            ...(meta.desc ? [{kind: "desc" as const, text: meta.desc}] : []),
            control,
        ], control, meta);
    }

    number(path: string, meta: NumberMeta) {
        const id = resolveId(this.tab.namespace, path);
        const control = controlNumber(id, {
            min: meta.min,
            max: meta.max,
            step: meta.step,
            unit: meta.unit,
        });
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc ?? ""},
            control,
        ], control, meta);
    }

    range(path: string, meta: RangeMeta) {
        const id = resolveId(this.tab.namespace, path);
        const control = controlRange(id, {min: meta.min, max: meta.max, step: meta.step});
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc ?? ""},
            control,
        ], control, meta);
    }

    select(path: string, meta: SelectMeta) {
        const id = resolveId(this.tab.namespace, path);
        const control = controlSelect(id, {options: meta.options, read: meta.readConfig});
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc ?? ""},
            control,
        ], control, meta);
    }

    text(path: string, meta: TextMeta) {
        const id = resolveId(this.tab.namespace, path);
        const control = controlString(id);
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc},
            control,
        ], control, meta);
    }

    textBlock(path: string, meta: TextBlockMeta) {
        const id = resolveId(this.tab.namespace, path);
        const control = controlTextBlock(id, {mode: meta.mode, read: meta.readConfig});
        return this.registerControl(path, [
            {kind: "title", text: meta.title},
            {kind: "desc", text: meta.desc},
            control,
        ], control, meta);
    }

    textPair(meta: TextPairMeta) {
        const leftId = resolveId(this.tab.namespace, meta.leftPath);
        const rightId = resolveId(this.tab.namespace, meta.rightPath);
        const leftControl = controlString(leftId);
        const rightControl = controlString(rightId);
        const searchTexts = meta.keywords ?? [meta.title, meta.desc];
        const key = meta.key ?? `textPair_${meta.leftPath}_${meta.rightPath}`;
        this.composite({
            key,
            keywords: searchTexts,
            html: () => genTextPairHtml(meta.title, meta.desc, leftControl, rightControl),
            controls: [
                {control: leftControl},
                {control: rightControl},
            ],
        });
        return this;
    }

    stack(meta: StackMeta, configure: (b: StackLineBuilder) => void) {
        const builder = new StackLineBuilder(this.tab.namespace);
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
            if (item.kind === "switch") {
                const control = controlBoolean(id);
                items.push({...control, label: item.label, icon: item.icon});
                controls.push({control});
            } else {
                const control = controlNumber(id, {min: item.min, max: item.max});
                items.push({...control, label: item.label});
                controls.push({control});
            }
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
        registerSettingItem({
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
        for (const entry of meta.controls) {
            registerSettingItem({
                id: entry.control.id,
                tabId: this.tab.id,
                groupKey: this.groupKey,
                kind: "binding",
                control: entry.control,
                read: entry.read ?? ((el) => entry.control.readDom(el)),
                save: entry.save ?? this.tab.defaultSave?.bind(null, entry.control.id),
            } as RegisterSettingItem);
        }
        return this;
    }
}

export class SettingTabBuilder<TId extends string = string> {
    constructor(private readonly tab: ItemsSettingTabOptions<TId>) {}

    group(groupKey: string, groupTitle: string) {
        registerSettingGroup(this.tab.id, groupKey, groupTitle);
        return new SettingGroupBuilder(this.tab, groupKey);
    }
}

/** `scanSearch` 返回值：侧栏过滤用 `matches`，条目型 SettingTab 另含可见条目 ID / 分组键 */
export interface SettingTabSearchResult {
    matches: boolean;
    visibleItemIds?: Set<string>;
    visibleGroupKeys?: Set<string>;
}

/** mount 时的搜索上下文（`keywords` 由壳层持有，与扫描结果在调用处拼装） */
export interface SettingTabMountContext {
    keywords: string;
    visibleItemIds?: Set<string>;
    visibleGroupKeys?: Set<string>;
}

export type SettingTab = SettingTabShell & {
    mount: (
        root: HTMLElement,
        search?: Partial<SettingTabMountContext>,
        app?: App,
    ) => Promise<void>;
    scanSearch: (keywords: string) => SettingTabSearchResult;
};

export class SettingBuilder {
    tab<TId extends string>(
        options: ItemsSettingTabOptions<TId>,
        register: (tab: SettingTabBuilder<TId>) => void,
    ): SettingTab {
        const {afterMount, ...shell} = options;
        // 延迟注册至首次 mount / scanSearch：import 时 languages 未就绪，且搜索可能先于 mount
        let registered = false;
        const ensureRegistered = () => {
            if (registered) {
                return;
            }
            registered = true;
            register(new SettingTabBuilder(options));
        };
        return {
            ...shell,
            mount: async (root, {visibleItemIds, visibleGroupKeys} = {}, app) => {
                ensureRegistered();
                const wasMounted = root.innerHTML !== "";
                if (!wasMounted) {
                    await mountSettingTab(options.id, root);
                    await afterMount?.(root, app);
                }
                if (visibleItemIds && visibleGroupKeys) {
                    applySettingTabSearchVisibility(root, visibleItemIds, visibleGroupKeys);
                }
            },
            scanSearch: (keywords) => {
                ensureRegistered();
                return scanSettingTabSearch(options.id, options.title(), keywords);
            },
        };
    }

    panel<TId extends string>(
        options: PanelSettingTabOptions<TId>,
    ): SettingTab {
        const {searchStrings, mount, ...shell} = options;
        return {
            ...shell,
            mount: async (root, {keywords} = {}, app) => mount(root, keywords, app),
            scanSearch: (keywords) => scanPanelSettingTabSearch(options.title(), searchStrings(), keywords),
        };
    }
}
