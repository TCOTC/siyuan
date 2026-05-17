import {confirmDialog} from "../dialog/confirmDialog";
import {genNotebookOption} from "../menus/onGetnotebookconf";
import {fetchPost} from "../util/fetch";
import {
    customRow,
    findSettingRowByControlId,
    notebookSavePathRow,
    numberRow,
    switchRow,
    type SettingBindApi,
    type SettingSection,
} from "./ui/settingRows";
import {filterSettingSections} from "./ui/search";
import {renderSettingTabHtmlFromSections} from "./ui/render";
import {readDomValue} from "./ui/formValue";
import {mergeRecordByDottedPath} from "./ui/dotPath";
import {mountSettingSaveHandlers} from "./ui/save";

export const file = {
    /**
     * 挂载文档设置
     * @param root 容器
     * @param searchQuery 搜索关键词
     */
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildFileSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
    },

    /** 从 DOM 读出 `controlId` 对应值 → `send`；无有效值时不请求 */
    set(root: HTMLElement, controlId: string, sections: SettingSection[]) {
        if (!controlId.startsWith("fileTree.")) {
            return;
        }
        const el = root.querySelector<HTMLElement>(`[id="${CSS.escape(controlId)}"]`);
        if (!el) {
            return;
        }
        const row = findSettingRowByControlId(sections, controlId);
        const value = readDomValue(el, row);
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
                switchRow({
                    id: "fileTree.alwaysSelectOpenedFile",
                    title: window.siyuan.languages.selectOpen,
                    desc: window.siyuan.languages.fileTree2,
                }),
                switchRow({
                    id: "fileTree.openFilesUseCurrentTab",
                    title: window.siyuan.languages.fileTree7,
                    desc: window.siyuan.languages.fileTree8,
                }),
                switchRow({
                    id: "fileTree.noSplitScreenWhenOpenTab",
                    title: window.siyuan.languages.noSplitScreenWhenOpenTab,
                    desc: window.siyuan.languages.noSplitScreenWhenOpenTabTip,
                }),
                numberRow({
                    id: "fileTree.maxOpenTabCount",
                    title: window.siyuan.languages.tabLimit,
                    desc: window.siyuan.languages.tabLimit1,
                    min: 1,
                    max: 32,
                }),
                switchRow({
                    id: "fileTree.closeTabsOnStart",
                    title: window.siyuan.languages.fileTree9,
                    desc: window.siyuan.languages.fileTree10,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupNewDocument,
            items: [
                switchRow({
                    id: "fileTree.createDocAtTop",
                    title: window.siyuan.languages.fileTree24,
                    desc: window.siyuan.languages.fileTree25,
                }),
                notebookSavePathRow({
                    title: window.siyuan.languages.fileTree12,
                    desc: window.siyuan.languages.fileTree13,
                    selectId: "fileTree.docCreateSaveBox",
                    pathId: "fileTree.docCreateSavePath",
                    getOptionsHtml: () => genNotebookOption(window.siyuan.config.fileTree.docCreateSaveBox),
                    getPathValue: () => window.siyuan.config.fileTree.docCreateSavePath,
                }),
                notebookSavePathRow({
                    title: window.siyuan.languages.fileTree5,
                    desc: window.siyuan.languages.fileTree6,
                    selectId: "fileTree.refCreateSaveBox",
                    pathId: "fileTree.refCreateSavePath",
                    getOptionsHtml: () => genNotebookOption(window.siyuan.config.fileTree.refCreateSaveBox),
                    getPathValue: () => window.siyuan.config.fileTree.refCreateSavePath,
                }),
                ...(isMobileKernelContainer() ? [] : [
                    notebookSavePathRow({
                        title: window.siyuan.languages.fileTree26,
                        desc: window.siyuan.languages.fileTree27,
                        selectId: "fileTree.shorthandSaveBox",
                        pathId: "fileTree.shorthandSavePath",
                        getOptionsHtml: () =>
                            genNotebookOption(window.siyuan.config.fileTree.shorthandSaveBox, undefined, true),
                        getPathValue: () => window.siyuan.config.fileTree.shorthandSavePath,
                    })
                ]),
            ],
        },
        {
            title: window.siyuan.languages.configGroupFileManagement,
            items: [
                customRow({
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
                }),
                numberRow({
                    id: "fileTree.maxListCount",
                    title: window.siyuan.languages.fileTree16,
                    desc: window.siyuan.languages.fileTree17,
                    min: 1,
                    max: 10240,
                }),
                numberRow({
                    id: "fileTree.largeFileWarningSize",
                    title: window.siyuan.languages.fileTree22,
                    desc: window.siyuan.languages.fileTree23,
                    min: 2,
                    max: 10240,
                    unit: "MB",
                }),
                switchRow({
                    id: "fileTree.allowCreateDeeper",
                    title: window.siyuan.languages.fileTree18,
                    desc: window.siyuan.languages.fileTree19,
                }),
                switchRow({
                    id: "fileTree.useSingleLineSave",
                    title: window.siyuan.languages.fileTree20,
                    desc: window.siyuan.languages.fileTree21,
                }),
                switchRow({
                    id: "fileTree.removeDocWithoutConfirm",
                    title: window.siyuan.languages.fileTree3,
                    desc: window.siyuan.languages.fileTree4,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupOthers,
            items: [
                numberRow({
                    id: "fileTree.recentDocsMaxListCount",
                    title: window.siyuan.languages.recentDocsMaxListCount,
                    desc: window.siyuan.languages.recentDocsMaxListCountTip,
                    min: 32,
                    max: 256,
                }),
            ],
        },
    ];
}
