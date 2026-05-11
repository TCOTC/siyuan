import {confirmDialog} from "../dialog/confirmDialog";
import {genNotebookOption} from "../menus/onGetnotebookconf";
import {fetchPost} from "../util/fetch";
import type {SettingBindApi, SettingRow, SettingSection} from "./ui/types";
import {filterSettingSections} from "./ui/search";
import {renderSettingTabHtmlFromSections} from "./ui/render";
import {readDomValueFromEl} from "./ui/formValue";
import {mergeRecordByDottedPath} from "./ui/dotPath";
import {mountScheduleSettingSave} from "./ui/save";

export const file = {
    /**
     * 挂载文档设置
     * @param root 容器
     * @param searchQuery 搜索关键词
     */
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildFileSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);
        await mountScheduleSettingSave(root, sections);
    },

    /** 从 DOM 读出 `controlId` 对应值 → `send`；无有效值时不请求 */
    set(root: HTMLElement, controlId: string) {
        if (!controlId.startsWith("fileTree.")) {
            return;
        }
        const rel = controlId.slice("fileTree.".length);
        const el = root.querySelector<HTMLElement>(`[id="${CSS.escape(controlId)}"]`);
        if (!el) {
            return;
        }
        let value: unknown;
        if (el instanceof HTMLSelectElement && /SaveBox$/.test(rel)) {
            value = el.value;
        } else {
            value = readDomValueFromEl(el);
        }
        if (value !== undefined) {
            file.send(controlId, value);
        }
    },

    /**
     * 将 `value` 按点分路径合并进当前 `window.siyuan.config.fileTree` 后 POST；成功后 `apply`。
     * `controlId` 与控件 `id` 一致，须为 `fileTree.` 前缀。
     */
    send(controlId: string, value: unknown) {
        if (!controlId.startsWith("fileTree.")) {
            return;
        }
        const rel = controlId.slice("fileTree.".length);
        if (!rel) {
            return;
        }
        const prev = window.siyuan.config.fileTree;
        const payload = mergeRecordByDottedPath(
            prev as unknown as Record<string, unknown>,
            rel,
            value
        ) as unknown as Config.IFileTree;
        fetchPost("/api/setting/setFiletree", payload, (response) => {
            file.apply(response.data);
        });
    },

    /** 将服务端返回的 `IFileTree` 写回全局配置 */
    apply(fileTreeData: Config.IFileTree) {
        window.siyuan.config.fileTree = fileTreeData;
    },
};


const isMobileKernelContainer = () =>
    ["android", "ios", "harmony"].includes(window.siyuan.config.system.container);

/** 每次调用时重新构造。全量列表供 `filterSettingSections(..., searchQuery)` 使用。 */
export function buildFileSections(): SettingSection[] {
    return [
        {
            title: window.siyuan.languages.configGroupTabs,
            items: [
                {
                    type: "switch",
                    id: "fileTree.alwaysSelectOpenedFile",
                    title: window.siyuan.languages.selectOpen,
                    desc: window.siyuan.languages.fileTree2,
                },
                {
                    type: "switch",
                    id: "fileTree.openFilesUseCurrentTab",
                    title: window.siyuan.languages.fileTree7,
                    desc: window.siyuan.languages.fileTree8,
                },
                {
                    type: "switch",
                    id: "fileTree.noSplitScreenWhenOpenTab",
                    title: window.siyuan.languages.noSplitScreenWhenOpenTab,
                    desc: window.siyuan.languages.noSplitScreenWhenOpenTabTip,
                },
                {
                    type: "number",
                    id: "fileTree.maxOpenTabCount",
                    min: 1,
                    max: 32,
                    title: window.siyuan.languages.tabLimit,
                    desc: window.siyuan.languages.tabLimit1,
                },
                {
                    type: "switch",
                    id: "fileTree.closeTabsOnStart",
                    title: window.siyuan.languages.fileTree9,
                    desc: window.siyuan.languages.fileTree10,
                },
            ],
        },
        {
            title: window.siyuan.languages.configGroupNewDocument,
            items: [
                {
                    type: "switch",
                    id: "fileTree.createDocAtTop",
                    title: window.siyuan.languages.fileTree24,
                    desc: window.siyuan.languages.fileTree25,
                },
                {
                    type: "custom",
                    keywords: [window.siyuan.languages.fileTree12, window.siyuan.languages.fileTree13],
                    html: () => `<div class="b3-label config__item">
    ${window.siyuan.languages.fileTree12}
    <div class="b3-label__text">${window.siyuan.languages.fileTree13}</div>
    <span class="fn__hr"></span>
    <div class="fn__flex">
        <select style="min-width: 200px" class="b3-select" id="fileTree.docCreateSaveBox">${genNotebookOption(window.siyuan.config.fileTree.docCreateSaveBox)}</select>
        <div class="fn__space"></div>
        <input class="b3-text-field fn__flex-1" id="fileTree.docCreateSavePath" value="">
    </div>
</div>`,
                    bind: async (api: SettingBindApi) => {
                        const el = api.root.querySelector<HTMLInputElement>(
                            `[id="${CSS.escape("fileTree.docCreateSavePath")}"]`
                        );
                        if (el) {
                            el.value = window.siyuan.config.fileTree.docCreateSavePath;
                        }
                    },
                },
                {
                    type: "custom",
                    keywords: [window.siyuan.languages.fileTree5, window.siyuan.languages.fileTree6],
                    html: () => `<div class="b3-label config__item">
    ${window.siyuan.languages.fileTree5}
    <div class="b3-label__text">${window.siyuan.languages.fileTree6}</div>
    <span class="fn__hr"></span>
    <div class="fn__flex">
        <select style="min-width: 200px" class="b3-select" id="fileTree.refCreateSaveBox">${genNotebookOption(window.siyuan.config.fileTree.refCreateSaveBox)}</select>
        <div class="fn__space"></div>
        <input class="b3-text-field fn__flex-1" id="fileTree.refCreateSavePath" value="${window.siyuan.config.fileTree.refCreateSavePath}">
    </div>
</div>`,
                    bind: async (api: SettingBindApi) => {
                        const el = api.root.querySelector<HTMLInputElement>(
                            `[id="${CSS.escape("fileTree.refCreateSavePath")}"]`
                        );
                        if (el) {
                            el.value = window.siyuan.config.fileTree.refCreateSavePath;
                        }
                    },
                },
                ...(isMobileKernelContainer()
                    ? ([
                        {
                            type: "custom" as const,
                            keywords: [
                                window.siyuan.languages.fileTree26,
                                window.siyuan.languages.fileTree27,
                            ],
                            html: () => `<div class="b3-label config__item">
    ${window.siyuan.languages.fileTree26}
    <div class="b3-label__text">${window.siyuan.languages.fileTree27}</div>
    <span class="fn__hr"></span>
    <div class="fn__flex">
        <select style="min-width: 200px" class="b3-select" id="fileTree.shorthandSaveBox">${genNotebookOption(window.siyuan.config.fileTree.shorthandSaveBox, undefined, true)}</select>
        <div class="fn__space"></div>
        <input class="b3-text-field fn__flex-1" id="fileTree.shorthandSavePath" value="${window.siyuan.config.fileTree.shorthandSavePath}">
    </div>
</div>`,
                            bind: async (api: SettingBindApi) => {
                                const el = api.root.querySelector<HTMLInputElement>(
                                    `[id="${CSS.escape("fileTree.shorthandSavePath")}"]`
                                );
                                if (el) {
                                    el.value = window.siyuan.config.fileTree.shorthandSavePath;
                                }
                            },
                        },
                    ] as SettingRow[])
                    : []),
            ],
        },
        {
            title: window.siyuan.languages.configGroupFileManagement,
            items: [
                {
                    type: "custom",
                    keywords: [
                        window.siyuan.languages.generateHistory,
                        window.siyuan.languages.generateHistoryInterval,
                        window.siyuan.languages.historyRetentionDaysTip,
                        window.siyuan.languages.clearHistory,
                        window.siyuan.languages.purge,
                        window.siyuan.languages.historyRetentionDays,
                        window.siyuan.languages.confirmClearHistory,
                    ],
                    html: () => `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.generateHistory}
        <div class="b3-label__text">${window.siyuan.languages.generateHistoryInterval}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size200" id="editor.generateHistoryInterval" type="number" min="0" max="120" value="${window.siyuan.config.editor.generateHistoryInterval}"/>
</div>
<div class="b3-label">
    <div>
        ${window.siyuan.languages.historyRetentionDaysTip}
    </div>
    <div class="fn__hr"></div>
    <div class="fn__flex config__item">
        <div class="fn__flex-center fn__flex-1 ft__on-surface">${window.siyuan.languages.clearHistory}</div>
        <span class="fn__space"></span>
        <button type="button" id="clearHistory" class="b3-button b3-button--outline fn__size200 fn__flex-center">
            <svg><use xlink:href="#iconTrashcan"></use></svg>${window.siyuan.languages.purge}
        </button>
    </div>
    <div class="fn__hr"></div>
    <div class="fn__flex config__item">
        <div class="fn__flex-center fn__flex-1 ft__on-surface">${window.siyuan.languages.historyRetentionDays}</div>
        <span class="fn__space"></span>
        <input class="b3-text-field fn__flex-center fn__size200" id="editor.historyRetentionDays" type="number" min="1" max="3650" value="${window.siyuan.config.editor.historyRetentionDays}"/>
    </div>
</div>`,
                    bind: async (api: SettingBindApi) => {
                        const btn = api.root.querySelector("#clearHistory");
                        btn?.addEventListener("click", () => {
                            confirmDialog(
                                window.siyuan.languages.clearHistory,
                                window.siyuan.languages.confirmClearHistory,
                                () => {
                                    fetchPost("/api/history/clearWorkspaceHistory", {});
                                }
                            );
                        });
                    },
                },
                {
                    type: "number",
                    id: "fileTree.maxListCount",
                    min: 1,
                    max: 10240,
                    title: window.siyuan.languages.fileTree16,
                    desc: window.siyuan.languages.fileTree17,
                },
                {
                    type: "custom",
                    keywords: [window.siyuan.languages.fileTree22, window.siyuan.languages.fileTree23],
                    html: () => `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.fileTree22}
        <div class="b3-label__text">${window.siyuan.languages.fileTree23}</div>
    </div>
    <span class="fn__space"></span>
    <div class="fn__size200 fn__flex-center fn__flex">
        <input class="b3-text-field fn__flex-1" id="fileTree.largeFileWarningSize" type="number" min="2" max="10240" value="${window.siyuan.config.fileTree.largeFileWarningSize}">
        <span class="fn__space"></span>
        <span class="ft__on-surface fn__flex-center">MB</span>
    </div>
</div>`,
                },
                {
                    type: "switch",
                    id: "fileTree.allowCreateDeeper",
                    title: window.siyuan.languages.fileTree18,
                    desc: window.siyuan.languages.fileTree19,
                },
                {
                    type: "switch",
                    id: "fileTree.useSingleLineSave",
                    title: window.siyuan.languages.fileTree20,
                    desc: window.siyuan.languages.fileTree21,
                },
                {
                    type: "switch",
                    id: "fileTree.removeDocWithoutConfirm",
                    title: window.siyuan.languages.fileTree3,
                    desc: window.siyuan.languages.fileTree4,
                },
            ],
        },
        {
            title: window.siyuan.languages.configGroupOthers,
            items: [
                {
                    type: "number",
                    id: "fileTree.recentDocsMaxListCount",
                    min: 32,
                    max: 256,
                    title: window.siyuan.languages.recentDocsMaxListCount,
                    desc: window.siyuan.languages.recentDocsMaxListCountTip,
                },
            ],
        },
    ];
}
