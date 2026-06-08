import type {TabBuilder} from "../registry/tabBuilder";
import {fetchPost} from "../../util/fetch";
import {Dialog} from "../../dialog";
import {Constants} from "../../constants";
import {isBrowser, isMobile} from "../../util/functions";
import {showMessage} from "../../dialog/message";
/// #if !BROWSER
import {shell} from "electron";
/// #endif
import {isInMobileApp, saveExportFile} from "../../protyle/util/compatibility";
import {genConfigItemMainHtml} from "../ui/render";
import {renderPublishAuthAccounts, savePublish, sendAccessSetting, updatePublishConfig} from "./accessRuntime";
import {sendAppSetting} from "./appRuntime";

export const registerAccessAuthGroup = (p: TabBuilder) => {
    const hideOnWeb = isBrowser() && !isInMobileApp();
    if (hideOnWeb) {
        return;
    }
    const s = p.group("authentication", window.siyuan.languages.authentication);

    if (!window.siyuan.config.readonly) {
        s.button({
            id: "authCode",
            title: window.siyuan.languages.about5,
            desc: window.siyuan.languages.about6,
            label: window.siyuan.languages.config,
            icon: "iconLock",
            afterMount: mountAuthCodeButton,
        });
    }
    if (window.siyuan.config.accessAuthCode) {
        s.switch("system.lockScreenMode", {
            title: window.siyuan.languages.about7,
            desc: window.siyuan.languages.about8,
            save: (value) => sendAppSetting("system.lockScreenMode", value),
        });
    }
    s.text("api.token", {
        title: window.siyuan.languages.about13,
        desc: window.siyuan.languages.about14.replace("${token}", window.siyuan.config.api.token),
        save: (value) => sendAccessSetting("api.token", value),
        afterMount: bindApiTokenInput,
    });
};

const mountAuthCodeButton = (root: HTMLElement) => {
    root.querySelector("#authCode")?.addEventListener("click", () => {
        const dialog = new Dialog({
            title: window.siyuan.languages.about5,
            content: `<div class="b3-dialog__content">
    <input class="b3-text-field fn__block" placeholder="${window.siyuan.languages.about5}" value="${window.siyuan.config.accessAuthCode}">
    <div class="b3-label__text">${window.siyuan.languages.about6}</div>
</div>
<div class="b3-dialog__action">
    <button class="b3-button b3-button--cancel">${window.siyuan.languages.cancel}</button><div class="fn__space"></div>
    <button class="b3-button b3-button--text">${window.siyuan.languages.confirm}</button>
</div>`,
            width: isMobile() ? "92vw" : "520px",
        });
        const inputElement = dialog.element.querySelector("input") as HTMLInputElement;
        const btnsElement = dialog.element.querySelectorAll(".b3-button");
        dialog.element.setAttribute("data-key", Constants.DIALOG_ACCESSAUTHCODE);
        dialog.bindInput(inputElement, () => {
            (btnsElement[1] as HTMLButtonElement).click();
        });
        inputElement.select();
        btnsElement[0].addEventListener("click", () => {
            dialog.destroy();
        });
        btnsElement[1].addEventListener("click", () => {
            fetchPost("/api/system/setAccessAuthCode", {accessAuthCode: inputElement.value});
        });
    });
};

const bindApiTokenInput = (root: HTMLElement) => {
    const tokenElement = root.querySelector<HTMLInputElement>(`#${CSS.escape("api.token")}`);
    let tokenFocused = false;
    tokenElement?.addEventListener("focus", () => {
        tokenFocused = true;
    });
    tokenElement?.addEventListener("blur", () => {
        tokenFocused = false;
    });
    tokenElement?.addEventListener("mousedown", (event) => {
        if (!tokenFocused) {
            event.preventDefault();
            tokenElement.select();
        }
    });
};

export const registerAccessServerGroup = (p: TabBuilder) => {
    const hideOnWeb = isBrowser() && !isInMobileApp();
    if (hideOnWeb) {
        return;
    }
    const s = p.group("server", window.siyuan.languages.configGroupServer);

    s.switch("system.networkServe", {
        title: window.siyuan.languages.about11,
        desc: window.siyuan.languages.about12,
        save: (value) => sendAppSetting("system.networkServe", value),
    });
    if (window.siyuan.config.system.networkServe) {
        s.switch("system.networkServeTLS", {
            title: window.siyuan.languages.networkServeTLS,
            desc: `${window.siyuan.languages.networkServeTLSTip}<div class="fn__hr--small"></div>${window.siyuan.languages.networkServeTLSTip2}`,
            save: (value) => sendAppSetting("system.networkServeTLS", value),
        });
    }
    if (window.siyuan.config.system.networkServe && window.siyuan.config.system.networkServeTLS) {
        s.button({
            id: "exportCACert",
            title: window.siyuan.languages.exportCACert,
            desc: window.siyuan.languages.exportCACertTip,
            label: window.siyuan.languages.export,
            icon: "iconUpload",
            afterMount: (root) => {
                root.querySelector("#exportCACert")?.addEventListener("click", () => {
                    fetchPost("/api/system/exportTLSCACert", {}, (response) => {
                        saveExportFile(response.data.path);
                    });
                });
            },
        });
        s.button({
            id: "exportCABundle",
            title: window.siyuan.languages.exportCABundle,
            desc: window.siyuan.languages.exportCABundleTip,
            label: window.siyuan.languages.export,
            icon: "iconUpload",
            afterMount: (root) => {
                root.querySelector("#exportCABundle")?.addEventListener("click", () => {
                    fetchPost("/api/system/exportTLSCABundle", {}, (response) => {
                        saveExportFile(response.data.path);
                    });
                });
            },
        });
        s.button({
            id: "importCABundle",
            title: window.siyuan.languages.importCABundle,
            desc: window.siyuan.languages.importCABundleTip,
            label: window.siyuan.languages.import,
            icon: "iconDownload",
            afterMount: (root) => {
                root.querySelector("#importCABundle")?.addEventListener("click", () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".zip";
                    input.onchange = () => {
                        if (input.files && input.files[0]) {
                            const formData = new FormData();
                            formData.append("file", input.files[0]);
                            fetch("/api/system/importTLSCABundle", {
                                method: "POST",
                                body: formData,
                            }).then(res => res.json()).then((response) => {
                                if (response.code === 0) {
                                    showMessage(window.siyuan.languages.importCABundleSuccess);
                                } else {
                                    showMessage(response.msg, 6000, "error");
                                }
                            });
                        }
                    };
                    input.click();
                });
            },
        });
    }
    s.block({
        key: "localServer",
        keywords: [
            window.siyuan.languages.about2,
            window.siyuan.languages.about3,
            window.siyuan.languages.about4,
            window.siyuan.languages.about18,
        ],
        afterMount: (root) => {
            root.querySelector("#openLocalServer")?.addEventListener("click", () => {
                const url = `http://127.0.0.1:${location.port}`;
                /// #if !BROWSER
                shell.openExternal(url);
                /// #else
                window.open(url);
                /// #endif
            });
        },
    }, (b) => {
        b.title(window.siyuan.languages.about2);
        b.button({
            id: "openLocalServer",
            label: window.siyuan.languages.about4,
            icon: "iconLink",
        });
        b.desc(window.siyuan.languages.about3.replace("${port}", location.port));
        b.desc((() => {
            const parts: string[] = [];
            for (const serverAddr of window.siyuan.config.serverAddrs) {
                if (!serverAddr.trim()) {
                    break;
                }
                parts.push(`<code class="fn__code">${serverAddr}</code>`);
            }
            return parts.join(" ");
        })());
        b.desc(window.siyuan.languages.about18);
    });
};

export const registerAccessPublishGroup = (p: TabBuilder) => {
    const s = p.group("publish", window.siyuan.languages.configGroupPublish);

    s.switch("publish.enable", {
        title: window.siyuan.languages.publishService,
        desc: window.siyuan.languages.publishServiceTip,
        save: (value) => sendAccessSetting("publish.enable", value),
    });
    s.number("publish.port", {
        title: window.siyuan.languages.publishServicePort,
        desc: window.siyuan.languages.publishServicePortTip,
        min: 0,
        max: 65535,
        save: (value) => sendAccessSetting("publish.port", value),
    });
    s.slot({
        key: "publishAddresses",
        keywords: [
            window.siyuan.languages.publishServiceAddresses,
            window.siyuan.languages.publishServiceAddressesTip,
            window.siyuan.languages.publishServiceNotStarted,
        ],
        html: () => `<div class="b3-label config-item">
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml(window.siyuan.languages.publishServiceAddresses, window.siyuan.languages.publishServiceAddressesTip)}
        <div class="fn__space"></div>
    </div>
    <div id="publishAddresses" class="b3-label__text"></div>
</div>`,
        afterMount: () => {
            fetchPost("/api/setting/getPublish", {}, (response: IWebSocketData) => {
                updatePublishConfig(true, response);
            });
        },
    });
    s.switch("publish.auth.enable", {
        title: window.siyuan.languages.publishServiceAuth,
        desc: window.siyuan.languages.publishServiceAuthTip,
        save: (value) => sendAccessSetting("publish.auth.enable", value),
    });
    s.button({
        id: "publishAuthAccountAdd",
        title: window.siyuan.languages.publishServiceAuthAccounts,
        desc: window.siyuan.languages.publishServiceAuthAccountsTip,
        label: window.siyuan.languages.publishServiceAuthAccountAdd,
        icon: "iconAdd",
        afterMount: (root) => {
            root.querySelector("#publishAuthAccountAdd")?.addEventListener("click", () => {
                window.siyuan.config.publish.auth.accounts.push({
                    username: "",
                    password: "",
                    memo: "",
                });
                renderPublishAuthAccounts();
            });
        },
    });
    s.slot({
        key: "publishAuthAccounts",
        keywords: [
            window.siyuan.languages.userName,
            window.siyuan.languages.password,
            window.siyuan.languages.memo,
            window.siyuan.languages.delete,
        ],
        html: () => `<div class="b3-label config-item"><div class="fn__flex-1" id="publishAuthAccounts"></div></div>`,
        afterMount: mountPublishAuthAccounts,
    });
};

const mountPublishAuthAccounts = (root: HTMLElement) => {
    const publishAuthAccounts = root.querySelector("#publishAuthAccounts");
    publishAuthAccounts?.addEventListener("change", (event) => {
        const input = event.target as HTMLInputElement;
        if (input.tagName !== "INPUT" || !input.dataset.name) {
            return;
        }
        const li = input.closest("li");
        if (li) {
            const index = parseInt(li.dataset.index);
            const name = input.dataset.name as keyof Config.IPublishAuthAccount;
            if (name in window.siyuan.config.publish.auth.accounts[index]) {
                window.siyuan.config.publish.auth.accounts[index][name] = input.value;
                savePublish(false);
            }
        }
    });
    publishAuthAccounts?.addEventListener("click", (event) => {
        const target = event.target as Element;
        const li = target.closest('[data-action="remove"]')?.closest("li");
        if (li) {
            const index = parseInt(li.dataset.index);
            window.siyuan.config.publish.auth.accounts.splice(index, 1);
            savePublish(true);
            return;
        }
        const togglePassword = target.closest('.b3-form__icona-icon[data-action="togglePassword"]');
        if (togglePassword) {
            const isEye = togglePassword.firstElementChild.getAttribute("xlink:href") === "#iconEye";
            togglePassword.firstElementChild.setAttribute("xlink:href", isEye ? "#iconEyeoff" : "#iconEye");
            togglePassword.previousElementSibling.setAttribute("type", isEye ? "text" : "password");
        }
    });
};

export const registerAccessTab = (p: TabBuilder) => {
    registerAccessAuthGroup(p);
    registerAccessServerGroup(p);
    registerAccessPublishGroup(p);
};
