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
import {genConfigItemMainHtml, genConfigItemName, genSettingTabHtmlFromSections} from "./ui/render";
import {
    type SettingSection,
    selectRow,
    buttonRow,
    customRow,
    findSettingRowByControlId,
} from "./ui/settingRows";
import {filterSettingSections} from "./ui/search";
import {readDomValue} from "./ui/formValue";
import {mountSettingSaveHandlers} from "./ui/save";

export const appSettings = {
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildAppSections(), searchQuery);
        root.innerHTML = genSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
    },

    set(el: HTMLElement, controlId: string) {
        if (!controlId.startsWith("system.")) {
            return;
        }
        // 访问授权页中的 system.* 行在 buildAccessSections 中注册；读值不依赖 row 类型（均为 switch / select）
        const row = findSettingRowByControlId(buildAppSections(), controlId);
        const value = readDomValue(el, row);
        if (value === undefined) {
            return;
        }
        appSettings.send(controlId, value);
    },

    send(controlId: string, value: unknown) {
        switch (controlId) {
            case "system.autoLaunch2": {
                const autoLaunchMode = value as Config.ISystem["autoLaunch2"];
                fetchPost("/api/system/setAutoLaunch", {autoLaunch: autoLaunchMode}, () => {
                    window.siyuan.config.system.autoLaunch2 = autoLaunchMode;
                    /// #if !BROWSER
                    ipcRenderer.send(Constants.SIYUAN_AUTO_LAUNCH, {
                        openAtLogin: 0 !== autoLaunchMode,
                        openAsHidden: 2 === autoLaunchMode,
                    });
                    /// #endif
                });
                break;
            }
            case "system.lockScreenMode": {
                const lockScreenMode = (Boolean(value) ? 1 : 0) as Config.ISystem["lockScreenMode"];
                fetchPost("/api/system/setFollowSystemLockScreen", {lockScreenMode}, () => {
                    window.siyuan.config.system.lockScreenMode = lockScreenMode;
                });
                break;
            }
            case "system.networkServe": {
                const networkServe = Boolean(value) as Config.ISystem["networkServe"];
                fetchPost("/api/system/setNetworkServe", {networkServe}, () => {
                    exportLayout({
                        errorExit: true,
                        cb: exitSiYuan,
                    });
                });
                break;
            }
            case "system.networkServeTLS": {
                const networkServeTLS = Boolean(value) as Config.ISystem["networkServeTLS"];
                fetchPost("/api/system/setNetworkServeTLS", {networkServeTLS}, () => {
                    exportLayout({
                        errorExit: true,
                        cb: exitSiYuan,
                    });
                });
                break;
            }
            default:
                break;
        }
    },
};

export function buildAppSections(): SettingSection[] {
    return [
        {
            title: window.siyuan.languages.configGroupGeneral,
            items: [
                ...(isBrowser() || window.siyuan.config.system.isMicrosoftStore || "std" !== window.siyuan.config.system.container || "linux" === window.siyuan.config.system.os ? [] : [
                    selectRow({
                        id: "system.autoLaunch2",
                        title: window.siyuan.languages.autoLaunch,
                        desc: window.siyuan.languages.autoLaunchTip,
                        options: [
                            { value: 0, label: window.siyuan.languages.autoLaunchMode0 },
                            { value: 1, label: window.siyuan.languages.autoLaunchMode1 },
                            ...(!isMac() ? [{ value: 2, label: window.siyuan.languages.autoLaunchMode2 }] : []),
                        ],
                        value: window.siyuan.config.system.autoLaunch2,
                    }),
                ]),
                customRow({
                    keywords: [
                        window.siyuan.languages.networkProxy,
                        window.siyuan.languages.about17,
                        window.siyuan.languages.directConnection,
                        "SOCKS5",
                        "HTTPS",
                        "HTTP",
                        "user:pass@IP",
                        "Port",
                        window.siyuan.languages.confirm,
                    ],
                    html: () => {
                        const proxy = window.siyuan.config.system.networkProxy;
                        return `<div class="b3-label config-item">
    ${genConfigItemName(window.siyuan.languages.networkProxy)}
    <div class="b3-label__text">
        ${window.siyuan.languages.about17}
    </div>
    <div class="b3-label__text fn__flex config-wrap">
        <select id="networkProxyScheme" class="b3-select">
            <option value="" ${proxy.scheme === "" ? "selected" : ""}>${window.siyuan.languages.directConnection}</option>
            <option value="socks5" ${proxy.scheme === "socks5" ? "selected" : ""}>SOCKS5</option>
            <option value="https" ${proxy.scheme === "https" ? "selected" : ""}>HTTPS</option>
            <option value="http" ${proxy.scheme === "http" ? "selected" : ""}>HTTP</option>
        </select>
        <span class="fn__space"></span>
        <input id="networkProxyHost" placeholder="user:pass@IP" class="b3-text-field fn__block" value="${Lute.EscapeHTMLStr(proxy.host)}"/>
        <span class="fn__space"></span>
        <input id="networkProxyPort" placeholder="Port" class="b3-text-field fn__block" value="${Lute.EscapeHTMLStr(proxy.port)}" type="number"/>
        <span class="fn__space"></span>
        <button id="networkProxyConfirm" class="b3-button fn__size200 b3-button--outline">${window.siyuan.languages.confirm}</button>
    </div>
</div>`;
                    },
                    bind: (root) => {
                        root.querySelector("#networkProxyConfirm")?.addEventListener("click", () => {
                            const scheme = (root.querySelector("#networkProxyScheme") as HTMLSelectElement)?.value as Config.TSystemNetworkProxyScheme;
                            const host = (root.querySelector("#networkProxyHost") as HTMLInputElement)?.value;
                            const port = (root.querySelector("#networkProxyPort") as HTMLInputElement)?.value;
                            fetchPost("/api/system/setNetworkProxy", {scheme, host, port}, async () => {
                                Object.assign(window.siyuan.config.system.networkProxy, {scheme, host, port});
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
                    },
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupData,
            items: [
                buttonRow({
                    id: "exportData",
                    title: `${window.siyuan.languages.export} Data`,
                    desc: window.siyuan.languages.exportDataTip,
                    label: window.siyuan.languages.export,
                    icon: "iconUpload",
                    bind: (root) => {
                        root.querySelector("#exportData")?.addEventListener("click", async () => {
                            /// #if BROWSER
                            fetchPost("/api/export/exportData", {}, (response) => {
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
                            }, (response) => {
                                afterExport(path.join(result.filePaths[0], response.data.name), msgId);
                            });
                            /// #endif
                        });
                    },
                }),
                customRow({
                    keywords: [window.siyuan.languages.import, window.siyuan.languages.importDataTip],
                    html: () => `<div class="fn__flex b3-label config-item config-wrap">
    ${genConfigItemMainHtml(`${window.siyuan.languages.import} Data`, window.siyuan.languages.importDataTip)}
    <span class="fn__space"></span>
    ${genImportUploadButtonHtml("importData", window.siyuan.languages.import)}
</div>`,
                    bind: (root) => {
                        root.querySelector("#importData")?.addEventListener("change", (event: Event) => {
                            const target = event.target as HTMLInputElement;
                            const formData = new FormData();
                            formData.append("file", target.files[0]);
                            fetchPost("/api/import/importData", formData);
                        });
                    },
                }),
                buttonRow({
                    id: "exportConf",
                    title: window.siyuan.languages.exportConf,
                    desc: window.siyuan.languages.exportConfTip,
                    label: window.siyuan.languages.export,
                    icon: "iconUpload",
                    bind: (root) => {
                        root.querySelector("#exportConf")?.addEventListener("click", () => {
                            fetchPost("/api/system/exportConf", {}, (response) => {
                                saveExportFile(response.data.zip);
                            });
                        });
                    },
                }),
                customRow({
                    keywords: [window.siyuan.languages.importConf, window.siyuan.languages.importConfTip],
                    html: () => `<div class="fn__flex b3-label config-item config-wrap">
    ${genConfigItemMainHtml(window.siyuan.languages.importConf, window.siyuan.languages.importConfTip)}
    <span class="fn__space"></span>
    ${genImportUploadButtonHtml("importConf", window.siyuan.languages.import)}
</div>`,
                    bind: (root) => {
                        root.querySelector("#importConf")?.addEventListener("change", (event: Event) => {
                            const target = event.target as HTMLInputElement;
                            const formData = new FormData();
                            formData.append("file", target.files[0]);
                            fetchPost("/api/system/importConf", formData, (response) => {
                                if (response.code !== 0) {
                                    showMessage(response.msg);
                                    return;
                                }
                                showMessage(window.siyuan.languages.imported);
                                exportLayout({
                                    errorExit: true,
                                    cb: exitSiYuan,
                                });
                            });
                        });
                    },
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupMaintenance,
            items: [
                buttonRow({
                    id: "vacuumDataIndex",
                    title: window.siyuan.languages.vacuumDataIndex,
                    desc: window.siyuan.languages.vacuumDataIndexTip,
                    label: window.siyuan.languages.vacuumDataIndex,
                    icon: "iconRefresh",
                    bind: (root) => {
                        root.querySelector("#vacuumDataIndex")?.addEventListener("click", () => {
                            fetchPost("/api/system/vacuumDataIndex", {});
                        });
                    },
                }),
                buttonRow({
                    id: "rebuildDataIndex",
                    title: window.siyuan.languages.rebuildDataIndex,
                    desc: window.siyuan.languages.rebuildDataIndexTip,
                    label: window.siyuan.languages.rebuildDataIndex,
                    icon: "iconRefresh",
                    bind: (root) => {
                        root.querySelector("#rebuildDataIndex")?.addEventListener("click", () => {
                            fetchPost("/api/system/rebuildDataIndex", {});
                        });
                    },
                }),
                buttonRow({
                    id: "clearTempFiles",
                    title: window.siyuan.languages.clearTempFiles,
                    desc: window.siyuan.languages.clearTempFilesTip,
                    label: window.siyuan.languages.purge,
                    icon: "iconTrashcan",
                    bind: (root) => {
                        root.querySelector("#clearTempFiles")?.addEventListener("click", () => {
                            fetchPost("/api/system/clearTempFiles", {});
                        });
                    },
                }),
                buttonRow({
                    id: "exportLog",
                    title: window.siyuan.languages.systemLog,
                    desc: window.siyuan.languages.systemLogTip,
                    label: window.siyuan.languages.export,
                    icon: "iconUpload",
                    bind: (root) => {
                        root.querySelector("#exportLog")?.addEventListener("click", () => {
                            fetchPost("/api/system/exportLog", {}, (response) => {
                                saveExportFile(response.data.zip);
                            });
                        });
                    },
                }),
            ],
        },
    ];
}

const genImportUploadButtonHtml = (inputId: string, label: string): string =>
    `<button class="b3-button b3-button--outline fn__flex-center fn__size200" style="position: relative">
    <input id="${inputId}" class="b3-form__upload" type="file">
    <svg><use xlink:href="#iconDownload"></use></svg>
    ${label}
</button>`;
