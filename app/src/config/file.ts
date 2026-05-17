import {confirmDialog} from "../dialog/confirmDialog";
import {genNotebookOption} from "../menus/onGetnotebookconf";
import {fetchPost} from "../util/fetch";
import {
    findSettingRowByControlId,
    notebookSavePathRow,
    numberRow,
    stackRow,
    switchRow,
    type SettingSection,
} from "./ui/settingRows";
import {filterSettingSections} from "./ui/search";
import {renderSettingTabHtmlFromSections} from "./ui/render";
import {readDomValue} from "./ui/formValue";
import {mergeRecordByDottedPath} from "./ui/dotPath";
import {mountSettingSaveHandlers} from "./ui/save";

export const file = {
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildFileSections(), searchQuery);
        root.innerHTML = renderSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
    },

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
                numberRow({
                    id: "editor.generateHistoryInterval",
                    title: window.siyuan.languages.generateHistory,
                    desc: window.siyuan.languages.generateHistoryInterval,
                    min: 0,
                    max: 120,
                }),
                stackRow({
                    lines: [
                        {
                            left: {kind: "title", text: window.siyuan.languages.historyRetentionDaysTip},
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.clearHistory},
                            right: {
                                kind: "button",
                                id: "clearHistory",
                                label: window.siyuan.languages.purge,
                                icon: "iconTrashcan",
                                bind: async (api) => {
                                    api.root.querySelector("#clearHistory")?.addEventListener("click", () => {
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
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.historyRetentionDays},
                            right: {
                                kind: "number",
                                id: "editor.historyRetentionDays",
                                value: window.siyuan.config.editor.historyRetentionDays,
                                min: 1,
                                max: 3650,
                            },
                        },
                    ],
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
