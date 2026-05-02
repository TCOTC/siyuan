import {Constants} from "../constants";
import {isBrowser} from "../util/functions";
import {fetchPost} from "../util/fetch";

export const about = {
    element: undefined as Element,
    genAboutHTML: () => {
        const checkUpdateHTML = window.siyuan.config.system.isMicrosoftStore ? `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.currentVer} v${Constants.SIYUAN_VERSION}
        <span id="isInsider"></span>
        <div class="b3-label__text">${window.siyuan.languages.isMsStoreVerTip}</div>
    </div>
</div>` : `<div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.currentVer} v${Constants.SIYUAN_VERSION}
        <span id="isInsider"></span>
        <div class="b3-label__text">${window.siyuan.languages.downloadLatestVer}</div>
    </div>
    <div class="fn__space"></div>
    <div class="fn__flex-center fn__size200 config__item-line">
        <button id="checkUpdateBtn" class="b3-button b3-button--outline fn__block">
            <svg><use xlink:href="#iconRefresh"></use></svg>${window.siyuan.languages.checkUpdate}
        </button>
    </div>
</div>`;

        return `<div class="config-group">
${checkUpdateHTML}
<label class="fn__flex b3-label${isBrowser() || window.siyuan.config.system.isMicrosoftStore || window.siyuan.config.system.container !== "std" || "linux" === window.siyuan.config.system.os ? " fn__none" : ""}">
    <div class="fn__flex-1">
        ${window.siyuan.languages.autoDownloadUpdatePkg}
        <div class="b3-label__text">${window.siyuan.languages.autoDownloadUpdatePkgTip}</div>
    </div>
    <div class="fn__space"></div>
    <input class="b3-switch fn__flex-center" id="downloadInstallPkg" type="checkbox"${window.siyuan.config.system.downloadInstallPkg ? " checked" : ""}>
</label>
<div class="b3-label">
    <div class="config-about__logo">
        <img src="/stage/icon.png">
        <span class="fn__space"></span>
        <span>${window.siyuan.languages.siyuanNote}</span>
        <span class="fn__space"></span>
        <span class="ft__on-surface">${window.siyuan.languages.slogan}</span>
        <span class="fn__space"></span>
        <span style="color:var(--b3-theme-surface);font-family:cursive;">会泽百家&nbsp;至公天下</span>
    </div>
    <div class='fn__hr'></div>
    ${window.siyuan.languages.about1} ${"harmony" === window.siyuan.config.system.container ? " • " + window.siyuan.languages.feedback + " 845765@qq.com" : ""}
</div>
</div>`;
    },
    bindEvent: () => {
        const root = about.element as Element;
        const isInsiderElement = root.querySelector("#isInsider");
        if (window.siyuan.config.system.isInsider && isInsiderElement) {
            isInsiderElement.innerHTML = "<span class='ft__secondary'>Insider Preview</span>";
        }
        const updateElement = root.querySelector("#checkUpdateBtn");
        updateElement?.addEventListener("click", () => {
            if (updateElement.firstElementChild.classList.contains("fn__rotate")) {
                return;
            }
            updateElement.innerHTML = `<svg class="fn__rotate"><use xlink:href="#iconRefresh"></use></svg>${window.siyuan.languages.checkUpdate}`;
            fetchPost("/api/system/checkUpdate", {showMsg: true}, () => {
                updateElement.innerHTML = `<svg><use xlink:href="#iconRefresh"></use></svg>${window.siyuan.languages.checkUpdate}`;
            });
        });
        const downloadInstallPkgElement = root.querySelector("#downloadInstallPkg") as HTMLInputElement;
        downloadInstallPkgElement?.addEventListener("change", () => {
            fetchPost("/api/system/setDownloadInstallPkg", {downloadInstallPkg: downloadInstallPkgElement.checked}, () => {
                window.siyuan.config.system.downloadInstallPkg = downloadInstallPkgElement.checked;
            });
        });
    },
};
