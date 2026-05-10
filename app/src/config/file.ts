import {fetchPost} from "../util/fetch";
import {confirmDialog} from "../dialog/confirmDialog";
import {genNotebookOption} from "../menus/onGetnotebookconf";

const isMobileKernelContainer = () =>
    ["android", "ios", "harmony"].includes(window.siyuan.config.system.container);

export const file = {
    element: undefined as Element,
    genHTML: () => {
        return `<b class="config-group__title">${window.siyuan.languages.configGroupTabs}</b>
<div class="config-group">
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.selectOpen}
        <div class="b3-label__text">${window.siyuan.languages.fileTree2}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="alwaysSelectOpenedFile" type="checkbox"${window.siyuan.config.fileTree.alwaysSelectOpenedFile ? " checked" : ""}/>
</label>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.fileTree7}
        <div class="b3-label__text">${window.siyuan.languages.fileTree8}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="openFilesUseCurrentTab" type="checkbox"${window.siyuan.config.fileTree.openFilesUseCurrentTab ? " checked" : ""}/>
</label>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.noSplitScreenWhenOpenTab}
        <div class="b3-label__text">${window.siyuan.languages.noSplitScreenWhenOpenTabTip}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="noSplitScreenWhenOpenTab" type="checkbox"${window.siyuan.config.fileTree.noSplitScreenWhenOpenTab ? " checked" : ""}/>
</label>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.tabLimit}
        <div class="b3-label__text">${window.siyuan.languages.tabLimit1}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size200" id="maxOpenTabCount" type="number" min="1" max="32" value="${window.siyuan.config.fileTree.maxOpenTabCount}">
</div>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.fileTree9}
        <div class="b3-label__text">${window.siyuan.languages.fileTree10}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="closeTabsOnStart" type="checkbox"${window.siyuan.config.fileTree.closeTabsOnStart ? " checked" : ""}/>
</label>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupNewDocument}</b>
<div class="config-group">
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.fileTree24}
        <div class="b3-label__text">${window.siyuan.languages.fileTree25}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="createDocAtTop" type="checkbox"${window.siyuan.config.fileTree.createDocAtTop ? " checked" : ""}/>
</label>
<div class="b3-label config__item">
    ${window.siyuan.languages.fileTree12}
    <div class="b3-label__text">${window.siyuan.languages.fileTree13}</div>
    <span class="fn__hr"></span>
    <div class="fn__flex">
        <select style="min-width: 200px" class="b3-select" id="docCreateSaveBox">${genNotebookOption(window.siyuan.config.fileTree.docCreateSaveBox)}</select>
        <div class="fn__space"></div>
        <input class="b3-text-field fn__flex-1" id="docCreateSavePath" value="">
    </div>
</div>
<div class="b3-label config__item">
    ${window.siyuan.languages.fileTree5}
    <div class="b3-label__text">${window.siyuan.languages.fileTree6}</div>
    <span class="fn__hr"></span>
    <div class="fn__flex">
        <select style="min-width: 200px" class="b3-select" id="refCreateSaveBox">${genNotebookOption(window.siyuan.config.fileTree.refCreateSaveBox)}</select>
        <div class="fn__space"></div>
        <input class="b3-text-field fn__flex-1" id="refCreateSavePath" value="${window.siyuan.config.fileTree.refCreateSavePath}">
    </div>
</div>
${isMobileKernelContainer() ? `<div class="b3-label config__item">
    ${window.siyuan.languages.fileTree26}
    <div class="b3-label__text">${window.siyuan.languages.fileTree27}</div>
    <span class="fn__hr"></span>
    <div class="fn__flex">
        <select style="min-width: 200px" class="b3-select" id="shorthandSaveBox">${genNotebookOption(window.siyuan.config.fileTree.shorthandSaveBox, undefined, true)}</select>
        <div class="fn__space"></div>
        <input class="b3-text-field fn__flex-1" id="shorthandSavePath" value="${window.siyuan.config.fileTree.shorthandSavePath}">
    </div>
</div>` : ""}
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupFileManagement}</b>
<div class="config-group">
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.generateHistory}
        <div class="b3-label__text">${window.siyuan.languages.generateHistoryInterval}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size200" id="generateHistoryInterval" type="number" min="0" max="120" value="${window.siyuan.config.editor.generateHistoryInterval}"/>
</div>
<div class="b3-label">
    <div>
        ${window.siyuan.languages.historyRetentionDaysTip}
    </div>
    <div class="fn__hr"></div>
    <div class="fn__flex config__item">
        <div class="fn__flex-center fn__flex-1 ft__on-surface">${window.siyuan.languages.clearHistory}</div>
        <span class="fn__space"></span>
        <button id="clearHistory" class="b3-button b3-button--outline fn__size200 fn__flex-center">
            <svg><use xlink:href="#iconTrashcan"></use></svg>${window.siyuan.languages.purge}
        </button>
    </div>
    <div class="fn__hr"></div>
    <div class="fn__flex config__item">
        <div class="fn__flex-center fn__flex-1 ft__on-surface">${window.siyuan.languages.historyRetentionDays}</div>
        <span class="fn__space"></span>
        <input class="b3-text-field fn__flex-center fn__size200" id="historyRetentionDays" type="number" min="1" max="3650" value="${window.siyuan.config.editor.historyRetentionDays}"/>
    </div>
</div>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.fileTree16}
        <div class="b3-label__text">${window.siyuan.languages.fileTree17}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size200" id="maxListCount" type="number" min="1" max="10240" value="${window.siyuan.config.fileTree.maxListCount}">
</div>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.fileTree22}
        <div class="b3-label__text">${window.siyuan.languages.fileTree23}</div>
    </div>
    <span class="fn__space"></span>
    <div class="fn__size200 fn__flex-center fn__flex">
        <input class="b3-text-field fn__flex-1" id="largeFileWarningSize" type="number" min="2" max="10240" value="${window.siyuan.config.fileTree.largeFileWarningSize}">
        <span class="fn__space"></span>
        <span class="ft__on-surface fn__flex-center">MB</span>
    </div>
</div>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.fileTree18}
        <div class="b3-label__text">${window.siyuan.languages.fileTree19}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="allowCreateDeeper" type="checkbox"${window.siyuan.config.fileTree.allowCreateDeeper ? " checked" : ""}/>
</label>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.fileTree20}
        <div class="b3-label__text">${window.siyuan.languages.fileTree21}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="useSingleLineSave" type="checkbox"${window.siyuan.config.fileTree.useSingleLineSave ? " checked" : ""}/>
</label>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.fileTree3}
        <div class="b3-label__text">${window.siyuan.languages.fileTree4}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="removeDocWithoutConfirm" type="checkbox"${window.siyuan.config.fileTree.removeDocWithoutConfirm ? " checked" : ""}/>
</label>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupOthers}</b>
<div class="config-group">
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.recentDocsMaxListCount}
        <div class="b3-label__text">${window.siyuan.languages.recentDocsMaxListCountTip}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size200" id="recentDocsMaxListCount" type="number" min="32" max="256" value="${window.siyuan.config.fileTree.recentDocsMaxListCount}">
</div>
</div>`;
    },
    _send() {
        // 限制页签最大打开数量为 `32` https://github.com/siyuan-note/siyuan/issues/6303
        let inputMaxOpenTabCount = parseInt((file.element.querySelector("#maxOpenTabCount") as HTMLInputElement).value);
        if (32 < inputMaxOpenTabCount) {
            inputMaxOpenTabCount = 32;
            (file.element.querySelector("#maxOpenTabCount") as HTMLInputElement).value = "32";
        }
        if (1 > inputMaxOpenTabCount) {
            inputMaxOpenTabCount = 1;
            (file.element.querySelector("#maxOpenTabCount") as HTMLInputElement).value = "1";
        }

        fetchPost("/api/setting/setFiletree", {
            ...window.siyuan.config.fileTree,
            alwaysSelectOpenedFile: (file.element.querySelector("#alwaysSelectOpenedFile") as HTMLInputElement).checked,
            refCreateSavePath: (file.element.querySelector("#refCreateSavePath") as HTMLInputElement).value,
            refCreateSaveBox: (file.element.querySelector("#refCreateSaveBox") as HTMLInputElement).value,
            ...(isMobileKernelContainer() ? {
                shorthandSavePath: (file.element.querySelector("#shorthandSavePath") as HTMLInputElement).value,
                shorthandSaveBox: (file.element.querySelector("#shorthandSaveBox") as HTMLInputElement).value,
            } : {}),
            docCreateSavePath: (file.element.querySelector("#docCreateSavePath") as HTMLInputElement).value,
            docCreateSaveBox: (file.element.querySelector("#docCreateSaveBox") as HTMLInputElement).value,
            openFilesUseCurrentTab: (file.element.querySelector("#openFilesUseCurrentTab") as HTMLInputElement).checked,
            closeTabsOnStart: (file.element.querySelector("#closeTabsOnStart") as HTMLInputElement).checked,
            noSplitScreenWhenOpenTab: (file.element.querySelector("#noSplitScreenWhenOpenTab") as HTMLInputElement).checked,
            allowCreateDeeper: (file.element.querySelector("#allowCreateDeeper") as HTMLInputElement).checked,
            removeDocWithoutConfirm: (file.element.querySelector("#removeDocWithoutConfirm") as HTMLInputElement).checked,
            useSingleLineSave: (file.element.querySelector("#useSingleLineSave") as HTMLInputElement).checked,
            createDocAtTop: (file.element.querySelector("#createDocAtTop") as HTMLInputElement).checked,
            largeFileWarningSize: parseInt((file.element.querySelector("#largeFileWarningSize") as HTMLInputElement).value),
            maxListCount: parseInt((file.element.querySelector("#maxListCount") as HTMLInputElement).value),
            maxOpenTabCount: inputMaxOpenTabCount,
            recentDocsMaxListCount: parseInt((file.element.querySelector("#recentDocsMaxListCount") as HTMLInputElement).value),
        }, response => {
            window.siyuan.config.fileTree = response.data;
        });

        fetchPost("/api/setting/setEditor", {
            ...window.siyuan.config.editor,
            generateHistoryInterval: parseInt((file.element.querySelector("#generateHistoryInterval") as HTMLInputElement).value),
            historyRetentionDays: parseInt((file.element.querySelector("#historyRetentionDays") as HTMLInputElement).value),
        }, response => {
            window.siyuan.config.editor = response.data;
        });
    },
    bindEvent: () => {
        (file.element.querySelector("#docCreateSavePath") as HTMLInputElement).value = window.siyuan.config.fileTree.docCreateSavePath;
        (file.element.querySelector("#refCreateSavePath") as HTMLInputElement).value = window.siyuan.config.fileTree.refCreateSavePath;
        if (isMobileKernelContainer()) {
            (file.element.querySelector("#shorthandSavePath") as HTMLInputElement).value =
                window.siyuan.config.fileTree.shorthandSavePath;
        }
        file.element.querySelector("#clearHistory").addEventListener("click", () => {
            confirmDialog(window.siyuan.languages.clearHistory, window.siyuan.languages.confirmClearHistory, () => {
                fetchPost("/api/history/clearWorkspaceHistory", {});
            });
        });
        file.element.querySelectorAll("input, select").forEach((item) => {
            item.addEventListener("change", () => {
                file._send();
            });
        });
    }
};
