import {Constants} from "../constants";
import {isBrowser} from "../util/functions";
import {fetchPost} from "../util/fetch";
import {setAccessAuthCode} from "./util/about";
import {exportLayout} from "../layout/util";
import {exitSiYuan, processSync} from "../dialog/processSystem";
import {isInMobileApp, isIPad, isMac, openByMobile, saveExportFile, writeText} from "../protyle/util/compatibility";
import {showMessage} from "../dialog/message";
import {Dialog} from "../dialog";
import {confirmDialog} from "../dialog/confirmDialog";
import {setKey} from "../sync/syncGuide";
import {useShell} from "../util/pathName";
import {hasClosestByClassName} from "../protyle/util/hasClosest";

/** 仅负责「关于」 tab 的 HTML 与事件；访问授权见 access，数据仓库与同步见 sync，通用与应用见 appConfig */
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
        const indexRetentionDaysElement = root.querySelector("#indexRetentionDays") as HTMLInputElement;
        indexRetentionDaysElement?.addEventListener("change", () => {
            fetchPost("/api/repo/setRepoIndexRetentionDays", {days: parseInt(indexRetentionDaysElement.value)}, () => {
                window.siyuan.config.repo.indexRetentionDays = parseInt(indexRetentionDaysElement.value);
            });
        });
        const retentionIndexesDailyElement = root.querySelector("#retentionIndexesDaily") as HTMLInputElement;
        retentionIndexesDailyElement?.addEventListener("change", () => {
            fetchPost("/api/repo/setRetentionIndexesDaily", {indexes: parseInt(retentionIndexesDailyElement.value)}, () => {
                window.siyuan.config.repo.retentionIndexesDaily = parseInt(retentionIndexesDailyElement.value);
            });
        });
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
