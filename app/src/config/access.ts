import {fetchPost} from "../util/fetch";
import {Dialog} from "../dialog";
import {Constants} from "../constants";
import {hasClosestByTag} from "../protyle/util/hasClosest";
import {hasClosestByClassName} from "../protyle/util/hasClosest";
import {isMobile} from "../util/functions";
import {openByMobile} from "../protyle/util/compatibility";
import {showMessage} from "../dialog/message";
/// #if !BROWSER
import {shell} from "electron";
import {useShell} from "../util/pathName";
/// #endif
import {exportLayout} from "../layout/util";
import {exitSiYuan} from "../dialog/processSystem";
import {isBrowser} from "../util/functions";
import {isInMobileApp, isIPad} from "../protyle/util/compatibility";
export const access = {
    element: undefined as Element,
    genHTML: () => {
        return `<b class="config-group__title">${window.siyuan.languages.configGroupAuthentication}</b>
<div class="config-group">
    <div class="b3-label config__item${(window.siyuan.config.readonly || (isBrowser() && !isInMobileApp() && !isIPad())) ? " fn__none" : ""}">
        <div class="fn__flex">
            <div class="fn__flex-1">
                ${window.siyuan.languages.about5}
                <div class="b3-label__text">${window.siyuan.languages.about6}</div>
            </div>
            <div class="fn__space"></div>
            <button class="fn__flex-center b3-button b3-button--outline fn__size200" id="authCode">
                <svg><use xlink:href="#iconLock"></use></svg>${window.siyuan.languages.config}
            </button>
        </div>
        <label class="b3-label fn__flex${!window.siyuan.config.accessAuthCode || isBrowser() ? " fn__none" : ""}">
            <div class="fn__flex-1">
                ${window.siyuan.languages.about7}
                <div class="b3-label__text">${window.siyuan.languages.about8}</div>
            </div>
            <div class="fn__space"></div>
            <input class="b3-switch fn__flex-center" id="lockScreenMode" type="checkbox"${window.siyuan.config.system.lockScreenMode === 1 ? " checked" : ""}>
        </label>
    </div>
    <div class="fn__flex config__item b3-label${(isBrowser() && !isInMobileApp()) ? " fn__none" : ""}">
        <div class="fn__flex-1">
            ${window.siyuan.languages.about13}
            <div class="b3-label__text" id="tokenTip">${window.siyuan.languages.about14.replace("${token}", window.siyuan.config.api.token)}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-text-field fn__flex-center fn__size200" id="token" value="${window.siyuan.config.api.token}">
    </div>
</div>
<b class="config-group__title">${window.siyuan.languages.configGroupServer}</b>
<div class="config-group">
    <div class="b3-label${(isBrowser() && !isInMobileApp() && !isIPad()) ? " fn__none" : ""}">
        <label class="fn__flex config__item">
            <div class="fn__flex-1">
                ${window.siyuan.languages.about11}
                <div class="b3-label__text">${window.siyuan.languages.about12}</div>
            </div>
            <div class="fn__space"></div>
            <input class="b3-switch fn__flex-center" id="networkServe" type="checkbox"${window.siyuan.config.system.networkServe ? " checked" : ""}>
        </label>
        <label class="b3-label fn__flex${window.siyuan.config.system.networkServe ? "" : " fn__none"}">
            <div class="fn__flex-1">
                ${window.siyuan.languages.networkServeTLS}
                <div class="b3-label__text">${window.siyuan.languages.networkServeTLSTip}</div>
                <div class="b3-label__text">${window.siyuan.languages.networkServeTLSTip2}</div>
            </div>
            <div class="fn__space"></div>
            <input class="b3-switch fn__flex-center" id="networkServeTLS" type="checkbox"${window.siyuan.config.system.networkServeTLS ? " checked" : ""}${!window.siyuan.config.system.networkServe ? " disabled" : ""}>
        </label>
        <div class="fn__flex b3-label config__item${(window.siyuan.config.system.networkServeTLS && window.siyuan.config.system.networkServe) ? "" : " fn__none"}">
            <div class="fn__flex-1">
                ${window.siyuan.languages.exportCACert}
                <div class="b3-label__text">${window.siyuan.languages.exportCACertTip}</div>
            </div>
            <div class="fn__space"></div>
            <button class="b3-button b3-button--outline fn__size200 fn__flex-center" id="exportCACert">
                <svg><use xlink:href="#iconUpload"></use></svg>${window.siyuan.languages.export}
            </button>
        </div>
        <div class="fn__flex b3-label config__item${(window.siyuan.config.system.networkServeTLS && window.siyuan.config.system.networkServe) ? "" : " fn__none"}">
            <div class="fn__flex-1">
                ${window.siyuan.languages.exportCABundle}
                <div class="b3-label__text">${window.siyuan.languages.exportCABundleTip}</div>
            </div>
            <div class="fn__space"></div>
            <button class="b3-button b3-button--outline fn__size200 fn__flex-center" id="exportCABundle">
                <svg><use xlink:href="#iconUpload"></use></svg>${window.siyuan.languages.export}
            </button>
        </div>
        <div class="fn__flex b3-label config__item${(window.siyuan.config.system.networkServeTLS && window.siyuan.config.system.networkServe) ? "" : " fn__none"}">
            <div class="fn__flex-1">
                ${window.siyuan.languages.importCABundle}
                <div class="b3-label__text">${window.siyuan.languages.importCABundleTip}</div>
            </div>
            <div class="fn__space"></div>
            <button class="b3-button b3-button--outline fn__size200 fn__flex-center" id="importCABundle">
                <svg><use xlink:href="#iconDownload"></use></svg>${window.siyuan.languages.import}
            </button>
        </div>
    </div>
    <div class="b3-label config__item${(isBrowser() && !isInMobileApp()) ? " fn__none" : " fn__flex"}">
        <div class="fn__flex-1">
            ${window.siyuan.languages.about2}
            <div class="b3-label__text">${window.siyuan.languages.about3.replace("${port}", location.port)}</div>
            ${(() => {
            const serverAddrs: string[] = [];
            for (const serverAddr of window.siyuan.config.serverAddrs) {
                if (!serverAddr.trim()) {
                    break;
                }

                serverAddrs.push(`<code class="fn__code">${serverAddr}</code>`);
            }
            return `<div class="b3-label__text">${serverAddrs.join(" ")}</div>`;
        })()}
            <div class="b3-label__text">${window.siyuan.languages.about18}</div>
        </div>
        <div class="fn__space"></div>
        <button data-type="open" data-url="${"http://127.0.0.1:" + location.port}" class="b3-button b3-button--outline fn__size200 fn__flex-center">
            <svg><use xlink:href="#iconLink"></use></svg>${window.siyuan.languages.about4}
        </button>
    </div>
</div>`
            + `<b class="config-group__title">${window.siyuan.languages.configGroupPublish}</b><div class="config-group">${access.genPublishHTML()}</div>`;
    },
    genPublishHTML: () => {
        const mobile = isMobile();
        return `
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.publishService}
        <div class="b3-label__text">${window.siyuan.languages.publishServiceTip}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="publishEnable" type="checkbox"${window.siyuan.config.publish.enable ? " checked" : ""}/>
</label>
<div class="b3-label">
    ${(() => {
            if (mobile) {
                return `
${window.siyuan.languages.publishServicePort}
<span class="fn__hr"></span>
<input class="b3-text-field fn__block" id="publishPort" type="number" min="0" max="65535" value="${window.siyuan.config.publish.port}">
<div class="b3-label__text">${window.siyuan.languages.publishServicePortTip}</div>`;
            } else {
                return `
<div class="fn__flex">
    <div class="fn__flex-1">
        ${window.siyuan.languages.publishServicePort}
        <div class="b3-label__text">${window.siyuan.languages.publishServicePortTip}</div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__flex-center fn__size200" id="publishPort" type="number" min="0" max="65535" value="${window.siyuan.config.publish.port}">
</div>`;
            }
        })()}
</div>
<div class="b3-label">
    <div class="fn__flex">
        <div class="fn__flex-1">
            ${window.siyuan.languages.publishServiceAddresses}
            <div class="b3-label__text">${window.siyuan.languages.publishServiceAddressesTip}</div>
        </div>
        <div class="fn__space"></div>
    </div>
    <div class="fn__hr"></div>
    <div id="publishAddresses">
    </div>
</div>
<div class="b3-label">
    <label class="fn__flex">
        <div class="fn__flex-1">
            ${window.siyuan.languages.publishServiceAuth}
            <div class="b3-label__text">${window.siyuan.languages.publishServiceAuthTip}</div>
        </div>
        <span class="fn__space"></span>
        <input class="b3-switch fn__flex-center" id="publishAuthEnable" type="checkbox"${window.siyuan.config.publish.auth.enable ? " checked" : ""}/>
    </label>
</div>
<div class="b3-label">
    ${(() => {
            if (mobile) {
                return `
${window.siyuan.languages.publishServiceAuthAccounts}
<div class="b3-label__text">${window.siyuan.languages.publishServiceAuthAccountsTip}</div>
<div class="b3-label b3-label--inner fn__flex">
    <span class="fn__flex-1"></span>
    <button class="b3-button b3-button--outline fn__size200 fn__flex-center" id="publishAuthAccountAdd">
        <svg><use xlink:href="#iconAdd"></use></svg>${window.siyuan.languages.publishServiceAuthAccountAdd}
    </button>
</div>`;
            } else {
                return `
<div class="fn__flex">
    <div class="fn__flex-1">
        ${window.siyuan.languages.publishServiceAuthAccounts}
        <div class="b3-label__text">${window.siyuan.languages.publishServiceAuthAccountsTip}</div>
    </div>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--outline fn__size200 fn__flex-center" id="publishAuthAccountAdd">
        <svg><use xlink:href="#iconAdd"></use></svg>${window.siyuan.languages.publishServiceAuthAccountAdd}
    </button>
</div>`;
            }
        })()}
    <div class="fn__flex-1" id="publishAuthAccounts">
    </div>
</div>
`;
    },
    bindEvent: () => {
        const root = access.element as Element;
        const tokenElement = root.querySelector("#token") as HTMLInputElement;
        tokenElement?.addEventListener("click", () => {
            tokenElement.select();
        });
        tokenElement?.addEventListener("change", () => {
            fetchPost("/api/system/setAPIToken", {token: tokenElement.value}, () => {
                window.siyuan.config.api.token = tokenElement.value;
                const tokenTipEl = root.querySelector("#tokenTip");
                if (tokenTipEl) {
                    tokenTipEl.innerHTML = window.siyuan.languages.about14.replace("${token}", window.siyuan.config.api.token);
                }
            });
        });
        root.querySelectorAll('[data-type="open"]').forEach(item => {
            item.addEventListener("click", () => {
                const url = item.getAttribute("data-url");
                if (!url) {
                    return;
                }
                /// #if !BROWSER
                if (url.startsWith("http")) {
                    shell.openExternal(url);
                } else {
                    useShell("openPath", url);
                }
                /// #else
                window.open(url);
                /// #endif
            });
        });
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
        const networkServeElement = root.querySelector("#networkServe") as HTMLInputElement;
        const networkServeTLSElement = root.querySelector("#networkServeTLS") as HTMLInputElement;
        const networkServeContainElement = networkServeElement
            ? hasClosestByClassName(networkServeElement, "b3-label") as HTMLElement
            : null;
        if (networkServeElement && networkServeTLSElement && networkServeContainElement) {
            networkServeElement.addEventListener("change", () => {
                networkServeTLSElement.disabled = !networkServeElement.checked;
                if (!networkServeElement.checked) {
                    networkServeTLSElement.checked = false;
                }
                Array.from(networkServeContainElement.children).forEach((item: HTMLElement, index) => {
                    if (index === 1) {
                        if (networkServeElement.checked) {
                            item.classList.remove("fn__none");
                        } else {
                            item.classList.add("fn__none");
                        }
                    } else if (index > 1) {
                        if (networkServeTLSElement.checked) {
                            item.classList.remove("fn__none");
                        } else {
                            item.classList.add("fn__none");
                        }
                    }
                });
                fetchPost("/api/system/setNetworkServe", {networkServe: networkServeElement.checked}, () => {
                    exportLayout({
                        errorExit: true,
                        cb: exitSiYuan
                    });
                });
            });
            networkServeTLSElement.addEventListener("change", () => {
                Array.from(networkServeContainElement.children).forEach((item: HTMLElement, index) => {
                    if (index > 1) {
                        if (networkServeTLSElement.checked) {
                            item.classList.remove("fn__none");
                        } else {
                            item.classList.add("fn__none");
                        }
                    }
                });
                fetchPost("/api/system/setNetworkServeTLS", {networkServeTLS: networkServeTLSElement.checked}, () => {
                    exportLayout({
                        errorExit: true,
                        cb: exitSiYuan
                    });
                });
            });
        }
        root.querySelector("#exportCACert")?.addEventListener("click", () => {
            fetchPost("/api/system/exportTLSCACert", {}, (response) => {
                openByMobile(response.data.path);
            });
        });
        root.querySelector("#exportCABundle")?.addEventListener("click", () => {
            fetchPost("/api/system/exportTLSCABundle", {}, (response) => {
                openByMobile(response.data.path);
            });
        });
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
        const lockScreenModeElement = root.querySelector("#lockScreenMode") as HTMLInputElement;
        lockScreenModeElement?.addEventListener("change", () => {
            fetchPost("/api/system/setFollowSystemLockScreen", {lockScreenMode: lockScreenModeElement.checked ? 1 : 0}, () => {
                window.siyuan.config.system.lockScreenMode = lockScreenModeElement.checked ? 1 : 0;
            });
        });
        access.bindPublishEvent(root);
    },
    bindPublishEvent: (root: Element) => {
        const publishAuthAccountAdd = root.querySelector<HTMLButtonElement>("#publishAuthAccountAdd");

        publishAuthAccountAdd.addEventListener("click", () => {
            window.siyuan.config.publish.auth.accounts.push({
                username: "",
                password: "",
                memo: "",
            });
            access._renderPublishAuthAccounts(root);
        });

        root.querySelectorAll("input").forEach(item => {
            item.addEventListener("change", () => {
                access._savePublish(root);
            });
        });

        access._refreshPublish(root);
    },
    _refreshPublish: (root: Element) => {
        fetchPost("/api/setting/getPublish", {}, (response: IWebSocketData) => {
            access.updatePublishConfig(root, true, response);
        });
    },
    _savePublish: (root: Element, reloadAccounts = true) => {
        const publishEnable = root.querySelector<HTMLInputElement>("#publishEnable");
        const publishPort = root.querySelector<HTMLInputElement>("#publishPort");
        const publishAuthEnable = root.querySelector<HTMLInputElement>("#publishAuthEnable");

        fetchPost("/api/setting/setPublish", {
            enable: publishEnable.checked,
            port: publishPort.valueAsNumber,
            auth: {
                enable: publishAuthEnable.checked,
                accounts: window.siyuan.config.publish.auth.accounts,
            },
        }, (response: IWebSocketData) => {
            access.updatePublishConfig(root, reloadAccounts, response);
        });
    },
    updatePublishConfig: (
        root: Element,
        reloadAccounts: boolean,
        response: IWebSocketData,
    ) => {
        if (response.code === 0) {
            window.siyuan.config.publish = response.data.publish;
            if (reloadAccounts) {
                access._renderPublishAuthAccounts(root);
            }
            access._renderPublishAddressList(root, response.data.port);
        } else {
            access._renderPublishAddressList(root, 0);
        }
    },
    _renderPublishAuthAccounts: (
        root: Element,
        accounts: Config.IPublishAuthAccount[] = window.siyuan.config.publish.auth.accounts,
    ) => {
        const mobile = isMobile();
        const publishAuthAccounts = root.querySelector<HTMLDivElement>("#publishAuthAccounts");
        publishAuthAccounts.innerHTML = `<div class="fn__hr"></div><ul class="fn__flex-1">${
            accounts
                .map((account, index) => `
<li class="b3-label b3-label--inner fn__flex" data-index="${index}">
    <input class="b3-text-field fn__block" data-name="username" value="${account.username}" placeholder="${window.siyuan.languages.userName}">
    <span class="fn__space"></span>
    <div class="b3-form__icona fn__block">
        <input class="b3-text-field fn__block b3-form__icona-input" type="password" data-name="password" value="${account.password}" placeholder="${window.siyuan.languages.password}">
        <svg class="b3-form__icona-icon" data-action="togglePassword"><use xlink:href="#iconEye"></use></svg>
    </div>
    <span class="fn__space"></span>
    <input class="b3-text-field fn__block" data-name="memo" value="${account.memo}" placeholder="${window.siyuan.languages.memo}">
    <span class="fn__space"></span>
    ${(() => {
                    if (mobile) {
                        return `
<button class="b3-button b3-button--outline fn__block" data-action="remove">
    <svg><use xlink:href="#iconTrashcan"></use></svg>${window.siyuan.languages.delete}
</button>`;
                    } else {
                        return `
<span data-action="remove" class="block__icon block__icon--show">
    <svg><use xlink:href="#iconTrashcan"></use></svg>
</span>`;
                    }
                })()}
</li>
`)
                .join("")
        }</ul>`;

        publishAuthAccounts
            .querySelectorAll("input")
            .forEach(input => {
                input.addEventListener("change", () => {
                    const li = hasClosestByTag(input, "LI");
                    if (li) {
                        const index = parseInt(li.dataset.index);
                        const name = input.dataset.name as keyof Config.IPublishAuthAccount;
                        if (name in window.siyuan.config.publish.auth.accounts[index]) {
                            window.siyuan.config.publish.auth.accounts[index][name] = input.value;
                            access._savePublish(root, false);
                        }
                    }
                });
            });

        publishAuthAccounts
            .querySelectorAll('[data-action="remove"]')
            .forEach(remove => {
                remove.addEventListener("click", () => {
                    const li = hasClosestByTag(remove, "LI");
                    if (li) {
                        const index = parseInt(li.dataset.index);
                        window.siyuan.config.publish.auth.accounts.splice(index, 1);
                        access._savePublish(root);
                    }
                });
            });

        publishAuthAccounts
            .querySelectorAll('.b3-form__icona-icon[data-action="togglePassword"]')
            .forEach(togglePassword => {
                togglePassword.addEventListener("click", () => {
                    const isEye = togglePassword.firstElementChild.getAttribute("xlink:href") === "#iconEye";
                    togglePassword.firstElementChild.setAttribute("xlink:href", isEye ? "#iconEyeoff" : "#iconEye");
                    togglePassword.previousElementSibling.setAttribute("type", isEye ? "text" : "password");
                });
            });
    },
    _renderPublishAddressList: (
        root: Element,
        port: number,
    ) => {
        const publishAddresses = root.querySelector<HTMLDivElement>("#publishAddresses");
        if (port === 0) {
            publishAddresses.innerText = window.siyuan.languages.publishServiceNotStarted;
        } else {
            publishAddresses.innerHTML = `<div class="b3-label__text">${
                window.siyuan.config.serverAddrs
                    .map(serverAddr => {
                        serverAddr = serverAddr.substring(0, serverAddr.lastIndexOf(":"));
                        return `<code class="fn__code">${serverAddr}:${port}</code>`;
                    }).join(" ")
            }</div>`;
        }
    },
};
