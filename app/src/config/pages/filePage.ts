import {confirmDialog} from "../../dialog/confirmDialog";
import {genNotebookOption} from "../../menus/onGetnotebookconf";
import {fetchPost} from "../../util/fetch";
import {editorConfigApi} from "./editorRuntime";
import {fileConfigApi} from "./fileRuntime";
import {registerItem} from "../registry/item";
import type {PageBuilder} from "../registry/pageBuilder";
import {genConfigItemName} from "../ui/render";
import {readDomValue} from "../ui/formValue";

const isMobileKernelContainer = () =>
    ["android", "ios", "harmony"].includes(window.siyuan.config.system.container);

/** slot 内嵌控件的手动注册，等同 `registerEmbeddedControl`（不参与 mount 渲染，仅 save / 搜索） */
const registerHiddenSaveControl = (
    tabId: "file",
    sectionKey: string,
    sectionTitle: string,
    controlId: string,
    searchTexts: string[],
    save: (value: unknown) => void,
) => {
    registerItem({
        id: controlId,
        tabId,
        sectionKey,
        sectionTitle,
        kind: "control",
        parts: [{kind: "text", id: controlId}],
        visible: () => false,
        searchTexts: () => searchTexts,
        read: (el) => readDomValue(el),
        save,
    });
};

const genNotebookSavePathHtml = (
    title: string,
    desc: string,
    selectId: string,
    pathId: string,
    optionsHtml: string,
) => `<div class="b3-label config-item config-item--save-path">
    ${genConfigItemName(title)}
    <div class="b3-label__text">${desc}</div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        <select class="b3-select fn__size200" id="${selectId}">${optionsHtml}</select>
        <div class="fn__space"></div>
        <input class="b3-text-field fn__flex-1" id="${pathId}" value="">
    </div>
</div>`;

export const registerFileTabsSection = (p: PageBuilder) => {
    const s = p.section("tabs", window.siyuan.languages.configGroupTabs);

    s.switch("alwaysSelectOpenedFile", {
        title: window.siyuan.languages.selectOpen,
        desc: window.siyuan.languages.fileTree2,
    });
    s.switch("openFilesUseCurrentTab", {
        title: window.siyuan.languages.fileTree7,
        desc: window.siyuan.languages.fileTree8,
    });
    s.switch("noSplitScreenWhenOpenTab", {
        title: window.siyuan.languages.noSplitScreenWhenOpenTab,
        desc: window.siyuan.languages.noSplitScreenWhenOpenTabTip,
    });
    s.number("maxOpenTabCount", {
        title: window.siyuan.languages.tabLimit,
        desc: window.siyuan.languages.tabLimit1,
        min: 1,
        max: 32,
    });
    s.switch("closeTabsOnStart", {
        title: window.siyuan.languages.fileTree9,
        desc: window.siyuan.languages.fileTree10,
    });
};

export const registerFileNewDocumentSection = (p: PageBuilder) => {
    const s = p.section("newDocument", window.siyuan.languages.configGroupNewDocument);
    const sectionTitle = window.siyuan.languages.configGroupNewDocument;

    s.switch("createDocAtTop", {
        title: window.siyuan.languages.fileTree24,
        desc: window.siyuan.languages.fileTree25,
    });

    const docCreateTitle = window.siyuan.languages.fileTree12;
    const docCreateDesc = window.siyuan.languages.fileTree13;
    s.slot({
        key: "docCreateSavePath",
        keywords: [docCreateTitle, docCreateDesc],
        html: () => genNotebookSavePathHtml(
            docCreateTitle,
            docCreateDesc,
            "fileTree.docCreateSaveBox",
            "fileTree.docCreateSavePath",
            genNotebookOption(window.siyuan.config.fileTree.docCreateSaveBox),
        ),
        afterMount: (root) => {
            const el = root.querySelector<HTMLInputElement>(`#${CSS.escape("fileTree.docCreateSavePath")}`);
            if (el) {
                el.value = window.siyuan.config.fileTree.docCreateSavePath;
            }
        },
    });
    registerHiddenSaveControl("file", "newDocument", sectionTitle, "fileTree.docCreateSaveBox", [docCreateTitle, docCreateDesc], (v) => {
        fileConfigApi.patch("docCreateSaveBox", v);
    });
    registerHiddenSaveControl("file", "newDocument", sectionTitle, "fileTree.docCreateSavePath", [docCreateTitle, docCreateDesc], (v) => {
        fileConfigApi.patch("docCreateSavePath", v);
    });

    const refCreateTitle = window.siyuan.languages.fileTree5;
    const refCreateDesc = window.siyuan.languages.fileTree6;
    s.slot({
        key: "refCreateSavePath",
        keywords: [refCreateTitle, refCreateDesc],
        html: () => genNotebookSavePathHtml(
            refCreateTitle,
            refCreateDesc,
            "fileTree.refCreateSaveBox",
            "fileTree.refCreateSavePath",
            genNotebookOption(window.siyuan.config.fileTree.refCreateSaveBox),
        ),
        afterMount: (root) => {
            const el = root.querySelector<HTMLInputElement>(`#${CSS.escape("fileTree.refCreateSavePath")}`);
            if (el) {
                el.value = window.siyuan.config.fileTree.refCreateSavePath;
            }
        },
    });
    registerHiddenSaveControl("file", "newDocument", sectionTitle, "fileTree.refCreateSaveBox", [refCreateTitle, refCreateDesc], (v) => {
        fileConfigApi.patch("refCreateSaveBox", v);
    });
    registerHiddenSaveControl("file", "newDocument", sectionTitle, "fileTree.refCreateSavePath", [refCreateTitle, refCreateDesc], (v) => {
        fileConfigApi.patch("refCreateSavePath", v);
    });

    if (!isMobileKernelContainer()) {
        const shorthandTitle = window.siyuan.languages.fileTree26;
        const shorthandDesc = window.siyuan.languages.fileTree27;
        s.slot({
            key: "shorthandSavePath",
            keywords: [shorthandTitle, shorthandDesc],
            html: () => genNotebookSavePathHtml(
                shorthandTitle,
                shorthandDesc,
                "fileTree.shorthandSaveBox",
                "fileTree.shorthandSavePath",
                genNotebookOption(window.siyuan.config.fileTree.shorthandSaveBox, undefined, true),
            ),
            afterMount: (root) => {
                const el = root.querySelector<HTMLInputElement>(`#${CSS.escape("fileTree.shorthandSavePath")}`);
                if (el) {
                    el.value = window.siyuan.config.fileTree.shorthandSavePath;
                }
            },
        });
        registerHiddenSaveControl("file", "newDocument", sectionTitle, "fileTree.shorthandSaveBox", [shorthandTitle, shorthandDesc], (v) => {
            fileConfigApi.patch("shorthandSaveBox", v);
        });
        registerHiddenSaveControl("file", "newDocument", sectionTitle, "fileTree.shorthandSavePath", [shorthandTitle, shorthandDesc], (v) => {
            fileConfigApi.patch("shorthandSavePath", v);
        });
    }
};

export const registerFileManagementSection = (p: PageBuilder) => {
    const s = p.section("fileManagement", window.siyuan.languages.configGroupFileManagement);
    const sectionTitle = window.siyuan.languages.configGroupFileManagement;

    s.number("editor.generateHistoryInterval", {
        title: window.siyuan.languages.generateHistory,
        desc: window.siyuan.languages.generateHistoryInterval,
        min: 0,
        max: 120,
        save: (value) => editorConfigApi.patch("generateHistoryInterval", value),
    });

    const historyKeywords = [
        window.siyuan.languages.historyRetentionDaysTip,
        window.siyuan.languages.clearHistory,
        window.siyuan.languages.confirmClearHistory,
        window.siyuan.languages.purge,
        window.siyuan.languages.historyRetentionDays,
    ];
    s.slot({
        key: "historyRetention",
        keywords: historyKeywords,
        html: () => `<div class="b3-label config-item">
    <div class="fn__block">
        <div class="config-name">${window.siyuan.languages.historyRetentionDaysTip}</div>
    </div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        <div class="fn__block">
            <div class="b3-label__text">${window.siyuan.languages.clearHistory}</div>
        </div>
        <span class="fn__space"></span>
        <button class="b3-button b3-button--outline fn__flex-center fn__size200" id="clearHistory">
            <svg><use xlink:href="#iconTrashcan"></use></svg>${window.siyuan.languages.purge}
        </button>
    </div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        <div class="fn__block">
            <div class="b3-label__text">${window.siyuan.languages.historyRetentionDays}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-text-field fn__size200" id="editor.historyRetentionDays" type="number" min="1" max="3650" value="${window.siyuan.config.editor.historyRetentionDays}"/>
    </div>
</div>`,
        afterMount: (root) => {
            const daysEl = root.querySelector<HTMLInputElement>(`#${CSS.escape("editor.historyRetentionDays")}`);
            if (daysEl) {
                daysEl.value = String(window.siyuan.config.editor.historyRetentionDays);
            }
            root.querySelector("#clearHistory")?.addEventListener("click", () => {
                confirmDialog(
                    window.siyuan.languages.clearHistory,
                    window.siyuan.languages.confirmClearHistory,
                    () => {
                        fetchPost("/api/history/clearWorkspaceHistory", {});
                    },
                );
            });
        },
    });
    registerHiddenSaveControl("file", "fileManagement", sectionTitle, "editor.historyRetentionDays", historyKeywords, (v) => {
        editorConfigApi.patch("historyRetentionDays", v);
    });

    s.number("maxListCount", {
        title: window.siyuan.languages.fileTree16,
        desc: window.siyuan.languages.fileTree17,
        min: 1,
        max: 10240,
    });
    s.number("largeFileWarningSize", {
        title: window.siyuan.languages.fileTree22,
        desc: window.siyuan.languages.fileTree23,
        min: 2,
        max: 10240,
        unit: "MB",
    });
    s.switch("allowCreateDeeper", {
        title: window.siyuan.languages.fileTree18,
        desc: window.siyuan.languages.fileTree19,
    });
    s.switch("useSingleLineSave", {
        title: window.siyuan.languages.fileTree20,
        desc: window.siyuan.languages.fileTree21,
    });
    s.switch("removeDocWithoutConfirm", {
        title: window.siyuan.languages.fileTree3,
        desc: window.siyuan.languages.fileTree4,
    });
};

export const registerFileOthersSection = (p: PageBuilder) => {
    const s = p.section("others", window.siyuan.languages.configGroupOthers);

    s.number("recentDocsMaxListCount", {
        title: window.siyuan.languages.recentDocsMaxListCount,
        desc: window.siyuan.languages.recentDocsMaxListCountTip,
        min: 32,
        max: 256,
    });
};
