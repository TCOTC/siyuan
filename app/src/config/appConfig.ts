/// #if !BROWSER
import {ipcRenderer} from "electron";
import {afterExport} from "../protyle/export/util";
import * as path from "path";
/// #endif
import {Constants} from "../constants";
import {fetchPost} from "../util/fetch";
import {exportLayout} from "../layout/util";
import {exitSiYuan} from "../dialog/processSystem";
import {showMessage} from "../dialog/message";
import {isBrowser} from "../util/functions";
import {isMac, saveExportFile} from "../protyle/util/compatibility";

export const appConfig = {
    element: undefined as Element,
    genHTML: () => {
        return `<b class="config-group__title">${window.siyuan.languages.configGroupGeneral}</b>
<div class="config-group">
<div class="fn__flex b3-label config__item${isBrowser() || window.siyuan.config.system.isMicrosoftStore || "std" !== window.siyuan.config.system.container || "linux" === window.siyuan.config.system.os ? " fn__none" : ""}">
    <div class="fn__flex-1">
        ${window.siyuan.languages.autoLaunch}
        <div class="b3-label__text">${window.siyuan.languages.autoLaunchTip}</div>
    </div>
    <span class="fn__space"></span>
    <select class="b3-select fn__flex-center fn__size200" id="autoLaunch">
      <option value="0" ${window.siyuan.config.system.autoLaunch2 === 0 ? "selected" : ""}>${window.siyuan.languages.autoLaunchMode0}</option>
      <option value="1" ${window.siyuan.config.system.autoLaunch2 === 1 ? "selected" : ""}>${window.siyuan.languages.autoLaunchMode1}</option>
      ${isMac() ? "" : `<option value="2" ${window.siyuan.config.system.autoLaunch2 === 2 ? "selected" : ""}>${window.siyuan.languages.autoLaunchMode2}</option>`}
    </select>
</div>
<div class="b3-label">
    ${window.siyuan.languages.networkProxy}
    <div class="b3-label__text">
        ${window.siyuan.languages.about17}
    </div>
    <div class="b3-label__text fn__flex config__item">
        <select id="aboutScheme" class="b3-select">
            <option value="" ${window.siyuan.config.system.networkProxy.scheme === "" ? "selected" : ""}>${window.siyuan.languages.directConnection}</option>
            <option value="socks5" ${window.siyuan.config.system.networkProxy.scheme === "socks5" ? "selected" : ""}>SOCKS5</option>
            <option value="https" ${window.siyuan.config.system.networkProxy.scheme === "https" ? "selected" : ""}>HTTPS</option>
            <option value="http" ${window.siyuan.config.system.networkProxy.scheme === "http" ? "selected" : ""}>HTTP</option>
        </select>
        <span class="fn__space"></span>
        <input id="aboutHost" placeholder="user:pass@IP" class="b3-text-field fn__block" value="${window.siyuan.config.system.networkProxy.host}"/>
        <span class="fn__space"></span>
        <input id="aboutPort" placeholder="Port" class="b3-text-field fn__block" value="${window.siyuan.config.system.networkProxy.port}" type="number"/>
        <span class="fn__space"></span>
        <button id="aboutConfirm" class="b3-button fn__size200 b3-button--outline">${window.siyuan.languages.confirm}</button>
    </div>
</div>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupData}</b>
<div class="config-group">
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1 fn__flex-center">
        ${window.siyuan.languages.export} Data
        <div class="b3-label__text">${window.siyuan.languages.exportDataTip}</div>
    </div>
    <span class="fn__space"></span>
    <button class="b3-button b3-button--outline fn__flex-center fn__size200" id="exportData">
        <svg><use xlink:href="#iconUpload"></use></svg>${window.siyuan.languages.export}
    </button>
</div>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1 fn__flex-center">
        ${window.siyuan.languages.import} Data
        <div class="b3-label__text">${window.siyuan.languages.importDataTip}</div>
    </div>
    <span class="fn__space"></span>
    <button class="b3-button b3-button--outline fn__flex-center fn__size200" style="position: relative">
        <input id="importData" class="b3-form__upload" type="file">
        <svg><use xlink:href="#iconDownload"></use></svg>${window.siyuan.languages.import}
    </button>
</div>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1 fn__flex-center">
        ${window.siyuan.languages.exportConf}
        <div class="b3-label__text">${window.siyuan.languages.exportConfTip}</div>
    </div>
    <span class="fn__space"></span>
    <button class="b3-button b3-button--outline fn__flex-center fn__size200" id="exportConf">
        <svg><use xlink:href="#iconUpload"></use></svg>${window.siyuan.languages.export}
    </button>
</div>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1 fn__flex-center">
        ${window.siyuan.languages.importConf}
        <div class="b3-label__text">${window.siyuan.languages.importConfTip}</div>
    </div>
    <span class="fn__space"></span>
    <button class="b3-button b3-button--outline fn__flex-center fn__size200" style="position: relative">
        <input id="importConf" class="b3-form__upload" type="file">
        <svg><use xlink:href="#iconDownload"></use></svg>${window.siyuan.languages.import}
    </button>
</div>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupMaintenance}</b>
<div class="config-group">
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.vacuumDataIndex}
        <div class="b3-label__text">${window.siyuan.languages.vacuumDataIndexTip}</div>
    </div>
    <div class="fn__space"></div>
    <button id="vacuumDataIndex" class="b3-button b3-button--outline fn__size200 fn__flex-center">
        <svg><use xlink:href="#iconRefresh"></use></svg>${window.siyuan.languages.vacuumDataIndex}
    </button>
</div>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.rebuildDataIndex}
        <div class="b3-label__text">${window.siyuan.languages.rebuildDataIndexTip}</div>
    </div>
    <div class="fn__space"></div>
    <button id="rebuildDataIndex" class="b3-button b3-button--outline fn__size200 fn__flex-center">
        <svg><use xlink:href="#iconRefresh"></use></svg>${window.siyuan.languages.rebuildDataIndex}
    </button>
</div>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.clearTempFiles}
        <div class="b3-label__text">${window.siyuan.languages.clearTempFilesTip}</div>
    </div>
    <div class="fn__space"></div>
    <button id="clearTempFiles" class="b3-button b3-button--outline fn__size200 fn__flex-center">
        <svg><use xlink:href="#iconTrashcan"></use></svg>${window.siyuan.languages.purge}
    </button>
</div>
<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.systemLog}
        <div class="b3-label__text">${window.siyuan.languages.systemLogTip}</div>
    </div>
    <div class="fn__space"></div>
    <button id="exportLog" class="b3-button b3-button--outline fn__size200 fn__flex-center">
        <svg><use xlink:href="#iconUpload"></use></svg>${window.siyuan.languages.export}
    </button>
</div>
</div>`;
    },
    bindEvent: () => {
        const root = appConfig.element as Element;
        root.querySelector("#vacuumDataIndex")?.addEventListener("click", () => {
            fetchPost("/api/system/vacuumDataIndex", {}, () => {
            });
        });
        root.querySelector("#rebuildDataIndex")?.addEventListener("click", () => {
            fetchPost("/api/system/rebuildDataIndex", {}, () => {
            });
        });
        root.querySelector("#clearTempFiles")?.addEventListener("click", () => {
            fetchPost("/api/system/clearTempFiles", {}, () => {
            });
        });
        root.querySelector("#exportLog")?.addEventListener("click", () => {
            fetchPost("/api/system/exportLog", {}, (response) => {
                saveExportFile(response.data.zip);
            });
        });
        /// #if !BROWSER
        const autoLaunchElement = root.querySelector("#autoLaunch") as HTMLInputElement;
        autoLaunchElement?.addEventListener("change", () => {
            const autoLaunchMode = parseInt(autoLaunchElement.value);
            fetchPost("/api/system/setAutoLaunch", {autoLaunch: autoLaunchMode}, () => {
                window.siyuan.config.system.autoLaunch2 = autoLaunchMode;
                ipcRenderer.send(Constants.SIYUAN_AUTO_LAUNCH, {
                    openAtLogin: 0 !== autoLaunchMode,
                    openAsHidden: 2 === autoLaunchMode
                });
            });
        });
        /// #endif
        root.querySelector("#aboutConfirm")?.addEventListener("click", () => {
            const scheme = (root.querySelector("#aboutScheme") as HTMLInputElement).value as Config.TSystemNetworkProxyScheme;
            const host = (root.querySelector("#aboutHost") as HTMLInputElement).value;
            const port = (root.querySelector("#aboutPort") as HTMLInputElement).value;
            fetchPost("/api/system/setNetworkProxy", {scheme, host, port}, async () => {
                window.siyuan.config.system.networkProxy.scheme = scheme;
                window.siyuan.config.system.networkProxy.host = host;
                window.siyuan.config.system.networkProxy.port = port;
                /// #if !BROWSER
                ipcRenderer.invoke(Constants.SIYUAN_GET, {
                    cmd: "setProxy",
                    proxyURL: `${window.siyuan.config.system.networkProxy.scheme}://${window.siyuan.config.system.networkProxy.host}:${window.siyuan.config.system.networkProxy.port}`,
                }).then(() => {
                    exportLayout({
                        errorExit: false,
                        cb() {
                            window.location.reload();
                        },
                    });
                });
                /// #endif
            });
        });
        root.querySelector("#importData")?.addEventListener("change", (event: InputEvent & { target: HTMLInputElement }) => {
            const formData = new FormData();
            formData.append("file", event.target.files[0]);
            fetchPost("/api/import/importData", formData);
        });
        root.querySelector("#importConf")?.addEventListener("change", (event: InputEvent & { target: HTMLInputElement }) => {
            const formData = new FormData();
            formData.append("file", event.target.files[0]);
            fetchPost("/api/system/importConf", formData, response => {
                if (response.code !== 0) {
                    showMessage(response.msg);
                    return;
                }
                showMessage(window.siyuan.languages.imported);
                exportLayout({
                    errorExit: true,
                    cb: exitSiYuan
                });
            });
        });
        root.querySelector("#exportData")?.addEventListener("click", async () => {
            /// #if BROWSER
            fetchPost("/api/export/exportData", {}, response => {
                saveExportFile(response.data.zip);
            });
            /// #else
            const result = await ipcRenderer.invoke(Constants.SIYUAN_GET, {
                cmd: "showOpenDialog",
                title: window.siyuan.languages.export + " " + "Data",
                properties: ["createDirectory", "openDirectory"],
            });
            if (result.canceled || result.filePaths.length === 0) {
                return;
            }
            const msgId = showMessage(window.siyuan.languages.exporting, -1);
            fetchPost("/api/export/exportDataInFolder", {
                folder: result.filePaths[0],
            }, response => {
                afterExport(path.join(result.filePaths[0], response.data.name), msgId);
            });
            /// #endif
        });
        root.querySelector("#exportConf")?.addEventListener("click", async () => {
            fetchPost("/api/system/exportConf", {}, response => {
                saveExportFile(response.data.zip);
            });
        });
    },
};
