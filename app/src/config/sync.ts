import {showMessage} from "../dialog/message";
import {Constants} from "../constants";
import {fetchPost, fetchSyncPost} from "../util/fetch";
import {confirmDialog} from "../dialog/confirmDialog";
import {hasClosestByClassName} from "../protyle/util/hasClosest";
import {getEventName, isInIOS} from "../protyle/util/compatibility";
import {processSync} from "../dialog/processSystem";
import {isPaidUser, needSubscribe} from "../util/needSubscribe";
import {bindSyncCloudListEvent, getSyncCloudList, setKey, syncGuide} from "../sync/syncGuide";
import {hideElements} from "../protyle/ui/hideElements";
import {getCloudURL, getIndexURL} from "./util/about";
import {iOSPurchase} from "../util/iOSPurchase";
import {isInMobileApp, openByMobile, writeText} from "../protyle/util/compatibility";
import {login} from "./mobileCloudAuth";
import {Dialog} from "../dialog";


const genSVGBG = () => {
    let html = "";
    const svgs: string[] = [];
    document.querySelectorAll("body > svg > defs > symbol").forEach((item) => {
        svgs.push(item.id);
    });
    Array.from({length: 45}, () => {
        const index = Math.floor(Math.random() * svgs.length);
        html += `<svg><use xlink:href="#${svgs[index]}"></use></svg>`;
        svgs.splice(index, 1);
    });
    return `<div class="fn__flex config-account__svg">${html}</div>`;
};

/** 仅更新账号分组 DOM，避免替换整个「云端」标签页容器导致同步等区块被清空 */
const setAccountGroupInnerHTML = (root: Element, html: string) => {
    const group = root.querySelector("#configAccountGroup");
    if (group) {
        group.innerHTML = html;
    } else {
        root.innerHTML = html;
    }
};


const renderProvider = (provider: number) => {
    if (provider === 0) {
        if (needSubscribe("")) {
            return `<div class="b3-label b3-label--inner">${window.siyuan.config.system.container === "ios" ? window.siyuan.languages._kernel[122] : window.siyuan.languages._kernel[29].replaceAll("${accountServer}", getCloudURL(""))}</div>
<div class="b3-label b3-label--inner">
    ${window.siyuan.languages.cloudIntro1}
    <div class="b3-label__text">
        <ul class="fn__list">
            <li>${window.siyuan.languages.cloudIntro2}</li>
            <li>${window.siyuan.languages.cloudIntro3}</li>
            <li>${window.siyuan.languages.cloudIntro4}</li>
            <li>${window.siyuan.languages.cloudIntro5}</li>
            <li>${window.siyuan.languages.cloudIntro6}</li>
            <li>${window.siyuan.languages.cloudIntro7}</li>
            <li>${window.siyuan.languages.cloudIntro8}</li>
        </ul>
    </div>
</div>
<div class="b3-label b3-label--inner">
    ${window.siyuan.languages.cloudIntro9}
    <div class="b3-label__text">
        <ul style="padding-left: 2em">
            <li>${window.siyuan.languages.cloudIntro10}</li>
            <li>${window.siyuan.languages.cloudIntro11}</li>
        </ul>
    </div>
</div>`;
        }
        return `<div class="b3-label b3-label--inner">
    ${window.siyuan.languages.syncOfficialProviderIntro}
</div>`;
    }
    if (!isPaidUser()) {
        return `<div>
    ${window.siyuan.languages["_kernel"][214].replaceAll("${accountServer}", getCloudURL(""))}
</div>
<div class="ft__error${provider == 4 ? "" : " fn__none"}">
    <div class="fn__hr--b"></div>
    ${window.siyuan.languages.mobileNotSupport}
</div>`;
    }
    if (provider === 2) {
        return `<div class="b3-label b3-label--inner">
    ${window.siyuan.languages.syncThirdPartyProviderS3Intro}
    <div class="fn__hr"></div>
    <em>${window.siyuan.languages.proFeature}</em>
    <div class="fn__hr"></div>
    ${window.siyuan.languages.syncThirdPartyProviderTip}
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Endpoint</div>
    <div class="fn__space"></div>
    <input id="endpoint" class="b3-text-field fn__block">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Access Key</div>
    <div class="fn__space"></div>
    <input id="accessKey" class="b3-text-field fn__block">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Secret Key</div>
    <div class="fn__space"></div>
    <div class="b3-form__icona fn__block">
        <input id="secretKey" type="password" class="b3-text-field b3-form__icona-input">
        <svg class="b3-form__icona-icon" data-action="togglePassword"><use xlink:href="#iconEye"></use></svg>
    </div>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Bucket</div>
    <div class="fn__space"></div>
    <input id="bucket" class="b3-text-field fn__block">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Region ID</div>
    <div class="fn__space"></div>
    <input id="region" class="b3-text-field fn__block">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Timeout (s)</div>
    <div class="fn__space"></div>
    <input id="timeout" class="b3-text-field fn__block" type="number" min="7" max="300">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Addressing</div>
    <div class="fn__space"></div>
    <select class="b3-select fn__block" id="pathStyle">
        <option value="true">Path-style</option>
        <option value="false">Virtual-hosted-style</option>
    </select>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">TLS Verify</div>
    <div class="fn__space"></div>
    <select class="b3-select fn__block" id="s3SkipTlsVerify">
        <option value="false">Verify</option>
        <option value="true">Skip</option>
    </select>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Concurrent Reqs</div>
    <div class="fn__space"></div>
    <input id="s3ConcurrentReqs" class="b3-text-field fn__block" type="number" min="1" max="16">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-1"></div>
    <button class="b3-button b3-button--outline fn__size200" data-action="purgeData">
        <svg><use xlink:href="#iconTrashcan"></use></svg>${window.siyuan.languages.cloudStoragePurge}
    </button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--outline fn__size200" style="position: relative">
        <input id="importData" class="b3-form__upload" type="file" data-type="s3">
        <svg><use xlink:href="#iconDownload"></use></svg>${window.siyuan.languages.import}
    </button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--outline fn__size200" data-action="exportData" data-type="s3">
        <svg><use xlink:href="#iconUpload"></use></svg>${window.siyuan.languages.export}
    </button>
</div>`;
    } else if (provider === 3) {
        return `<div class="b3-label b3-label--inner">
    ${window.siyuan.languages.syncThirdPartyProviderWebDAVIntro}
    <div class="fn__hr"></div>
    <em>${window.siyuan.languages.proFeature}</em>
    <div class="fn__hr"></div>
    ${window.siyuan.languages.syncThirdPartyProviderTip}
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Endpoint</div>
    <div class="fn__space"></div>
    <input id="endpoint" class="b3-text-field fn__block">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Username</div>
    <div class="fn__space"></div>
    <input id="username" class="b3-text-field fn__block">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Password</div>
    <div class="fn__space"></div>
    <div class="b3-form__icona fn__block">
        <input id="password" type="password" class="b3-text-field b3-form__icona-input">
        <svg class="b3-form__icona-icon" data-action="togglePassword"><use xlink:href="#iconEye"></use></svg>
    </div>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Timeout (s)</div>
    <div class="fn__space"></div>
    <input id="timeout" class="b3-text-field fn__block" type="number" min="7" max="300">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">TLS Verify</div>
    <div class="fn__space"></div>
    <select class="b3-select fn__block" id="webdavSkipTlsVerify">
        <option value="false">Verify</option>
        <option value="true">Skip</option>
    </select>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Concurrent Reqs</div>
    <div class="fn__space"></div>
    <input id="webdavConcurrentReqs" class="b3-text-field fn__block" type="number" min="1" max="16">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-1"></div>
    <button class="b3-button b3-button--outline fn__size200" data-action="purgeData">
        <svg><use xlink:href="#iconTrashcan"></use></svg>${window.siyuan.languages.cloudStoragePurge}
    </button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--outline fn__size200" style="position: relative">
        <input id="importData" class="b3-form__upload" type="file" data-type="webdav">
        <svg><use xlink:href="#iconDownload"></use></svg>${window.siyuan.languages.import}
    </button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--outline fn__size200" data-action="exportData" data-type="webdav">
        <svg><use xlink:href="#iconUpload"></use></svg>${window.siyuan.languages.export}
    </button>
</div>`;
    } else if (provider === 4) {
        return `<div class="b3-label b3-label--inner">
    <div class="ft__error">
        ${window.siyuan.languages.mobileNotSupport}
    </div>
    <div class="fn__hr"></div>
    ${window.siyuan.languages.syncThirdPartyProviderLocalIntro}
    <div class="fn__hr"></div>
    <em>${window.siyuan.languages.proFeature}</em>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Endpoint</div>
    <div class="fn__space"></div>
    <input id="endpoint" class="b3-text-field fn__block">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Timeout (s)</div>
    <div class="fn__space"></div>
    <input id="timeout" class="b3-text-field fn__block" type="number" min="7" max="300">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Concurrent Reqs</div>
    <div class="fn__space"></div>
    <input id="localConcurrentReqs" class="b3-text-field fn__block" type="number" min="1" max="1024">
</div>`;
    }
    return "";
};

const fillSyncProviderPanelValues = (panel: Element) => {
    if (!isPaidUser()) {
        return;
    }
    const provider = window.siyuan.config.sync.provider;
    if (provider === 2) {
        const s3 = window.siyuan.config.sync.s3;
        (panel.querySelector("#endpoint") as HTMLInputElement).value = String(s3.endpoint);
        (panel.querySelector("#accessKey") as HTMLInputElement).value = String(s3.accessKey);
        (panel.querySelector("#secretKey") as HTMLInputElement).value = String(s3.secretKey);
        (panel.querySelector("#bucket") as HTMLInputElement).value = String(s3.bucket);
        (panel.querySelector("#region") as HTMLInputElement).value = String(s3.region);
        (panel.querySelector("#timeout") as HTMLInputElement).value = String(s3.timeout);
        (panel.querySelector("#pathStyle") as HTMLSelectElement).value = s3.pathStyle ? "true" : "false";
        (panel.querySelector("#s3SkipTlsVerify") as HTMLSelectElement).value = s3.skipTlsVerify ? "true" : "false";
        (panel.querySelector("#s3ConcurrentReqs") as HTMLInputElement).value = String(s3.concurrentReqs);
    } else if (provider === 3) {
        const webdav = window.siyuan.config.sync.webdav;
        (panel.querySelector("#endpoint") as HTMLInputElement).value = String(webdav.endpoint);
        (panel.querySelector("#username") as HTMLInputElement).value = String(webdav.username);
        (panel.querySelector("#password") as HTMLInputElement).value = String(webdav.password);
        (panel.querySelector("#timeout") as HTMLInputElement).value = String(webdav.timeout);
        (panel.querySelector("#webdavSkipTlsVerify") as HTMLSelectElement).value = webdav.skipTlsVerify ? "true" : "false";
        (panel.querySelector("#webdavConcurrentReqs") as HTMLInputElement).value = String(webdav.concurrentReqs);
    } else if (provider === 4) {
        const local = window.siyuan.config.sync.local;
        (panel.querySelector("#endpoint") as HTMLInputElement).value = String(local.endpoint);
        (panel.querySelector("#timeout") as HTMLInputElement).value = String(local.timeout);
        (panel.querySelector("#localConcurrentReqs") as HTMLInputElement).value = String(local.concurrentReqs);
    }
};

const getReposDataLoadingHTML = () => `<div class="fn__flex">
    <div class="fn__flex-1">
        ${window.siyuan.languages.cloudStorage}
    </div>
    <div class="fn__flex-1">
        ${window.siyuan.languages.trafficStat}
    </div>
</div>
<div style="min-height: 183px; display: flex; justify-content: center;" id="reposLoading">
    <img src="/stage/loading-pure.svg">
</div>`;

const bindProviderEvent = () => {
    const importElement = sync.element.querySelector("#importData") as HTMLInputElement;
    if (importElement) {
        importElement.addEventListener("change", () => {
            const formData = new FormData();
            formData.append("file", importElement.files[0]);
            const isS3 = importElement.getAttribute("data-type") === "s3";
            fetchPost(isS3 ? "/api/sync/importSyncProviderS3" : "/api/sync/importSyncProviderWebDAV", formData, (response) => {
                if (isS3) {
                    window.siyuan.config.sync.s3 = response.data.s3;
                } else {
                    window.siyuan.config.sync.webdav = response.data.webdav;
                }
                sync.element.querySelector("#syncProviderPanel").innerHTML = renderProvider(window.siyuan.config.sync.provider);
                bindProviderEvent();
                showMessage(window.siyuan.languages.imported);
                importElement.value = "";
            });
        });
    }

    const reposDataElement = sync.element.querySelector("#reposData");
    if (window.siyuan.config.sync.provider === 0) {
        if (needSubscribe("")) {
            let nextElement = reposDataElement;
            while (nextElement) {
                nextElement.classList.add("fn__none");
                nextElement = nextElement.nextElementSibling;
            }
            return;
        }
        reposDataElement.innerHTML = getReposDataLoadingHTML();
        fetchPost("/api/cloud/getCloudSpace", {}, (response) => {
            if (response.code === 1) {
                reposDataElement.innerHTML = response.msg;
                return;
            }
            reposDataElement.innerHTML = `<div class="fn__flex">
    <div class="fn__flex-1">
        ${window.siyuan.languages.cloudStorage}
        <div class="fn__hr"></div>
        <ul class="b3-list" style="margin-left: 12px">
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.sync}<span class="b3-list-item__meta">${response.data.sync ? response.data.sync.hSize : "0B"}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.backup}<span class="b3-list-item__meta">${response.data.backup ? response.data.backup.hSize : "0B"}</span></li>
            <li class="b3-list-item" style="cursor: auto;"><a href="${getCloudURL("settings/file?type=3")}" target="_blank">${window.siyuan.languages.cdn}</a><span class="b3-list-item__meta">${response.data.hAssetSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.total}<span class="b3-list-item__meta">${response.data.hSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.sizeLimit}<span class="b3-list-item__meta">${response.data.hTotalSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;"><a href="${getCloudURL("settings/point")}" target="_blank">${window.siyuan.languages.pointExchangeSize}</a><span class="b3-list-item__meta">${response.data.hExchangeSize}</span></li>
        </ul>
    </div>
    <div class="fn__flex-1">
        ${window.siyuan.languages.trafficStat}
        <div class="fn__hr"></div>
        <ul class="b3-list" style="margin-left: 12px">
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.upload}<span class="fn__space"></span><span class="ft__on-surface">${response.data.hTrafficUploadSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.download}<span class="fn__space"></span><span class="ft__on-surface">${response.data.hTrafficDownloadSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">API GET<span class="fn__space"></span><span class="ft__on-surface">${response.data.hTrafficAPIGet}</span></li>
            <li class="b3-list-item" style="cursor: auto;">API PUT<span class="fn__space"></span><span class="ft__on-surface">${response.data.hTrafficAPIPut}</span></li>
        </ul>
    </div>
</div>`;
        });
        reposDataElement.classList.remove("fn__none");
        return;
    }

    let nextElement = reposDataElement.nextElementSibling;
    while (nextElement) {
        if (isPaidUser()) {
            nextElement.classList.remove("fn__none");
        } else {
            nextElement.classList.add("fn__none");
        }
        nextElement = nextElement.nextElementSibling;
    }
    reposDataElement.classList.add("fn__none");
    const providerPanelElement = sync.element.querySelector("#syncProviderPanel");
    fillSyncProviderPanelValues(providerPanelElement);
    providerPanelElement.querySelectorAll(".b3-text-field, .b3-select").forEach(item => {
        item.addEventListener("blur", () => {
            if (window.siyuan.config.sync.provider === 2) {
                const s3TimeoutInput = providerPanelElement.querySelector("#timeout") as HTMLInputElement;
                let timeout = parseInt(s3TimeoutInput.value, 10);
                if (7 > timeout) {
                    if (1 > timeout) {
                        timeout = 30;
                    } else {
                        timeout = 7;
                    }
                }
                if (300 < timeout) {
                    timeout = 300;
                }
                let concurrentReqs = parseInt((providerPanelElement.querySelector("#s3ConcurrentReqs") as HTMLInputElement).value, 10);
                if (1 > concurrentReqs) {
                    concurrentReqs = 1;
                }
                if (16 < concurrentReqs) {
                    concurrentReqs = 16;
                }
                s3TimeoutInput.value = timeout.toString();
                const s3 = {
                    endpoint: (providerPanelElement.querySelector("#endpoint") as HTMLInputElement).value,
                    accessKey: (providerPanelElement.querySelector("#accessKey") as HTMLInputElement).value.trim(),
                    secretKey: (providerPanelElement.querySelector("#secretKey") as HTMLInputElement).value.trim(),
                    bucket: (providerPanelElement.querySelector("#bucket") as HTMLInputElement).value.trim(),
                    pathStyle: (providerPanelElement.querySelector("#pathStyle") as HTMLSelectElement).value === "true",
                    region: (providerPanelElement.querySelector("#region") as HTMLInputElement).value.trim(),
                    skipTlsVerify: (providerPanelElement.querySelector("#s3SkipTlsVerify") as HTMLSelectElement).value === "true",
                    timeout: timeout,
                    concurrentReqs: concurrentReqs,
                };
                // 使用 fetchSyncPost：内核返回 code < 0 时 fetchPost 不会调用回调，此处需始终回写界面与已保存配置一致
                fetchSyncPost("/api/sync/setSyncProviderS3", {s3})
                    .then((response) => {
                        if (response.code === 0 && response.data?.s3) {
                            window.siyuan.config.sync.s3 = response.data.s3;
                        }
                    })
                    .finally(() => {
                        fillSyncProviderPanelValues(providerPanelElement);
                    })
                    .catch(() => {});
            } else if (window.siyuan.config.sync.provider === 3) {
                const webdavTimeoutInput = providerPanelElement.querySelector("#timeout") as HTMLInputElement;
                let timeout = parseInt(webdavTimeoutInput.value, 10);
                if (7 > timeout) {
                    timeout = 7;
                }
                if (300 < timeout) {
                    timeout = 300;
                }
                let concurrentReqs = parseInt((providerPanelElement.querySelector("#webdavConcurrentReqs") as HTMLInputElement).value, 10);
                if (1 > concurrentReqs) {
                    concurrentReqs = 1;
                }
                if (16 < concurrentReqs) {
                    concurrentReqs = 16;
                }
                webdavTimeoutInput.value = timeout.toString();
                const webdav = {
                    endpoint: (providerPanelElement.querySelector("#endpoint") as HTMLInputElement).value,
                    username: (providerPanelElement.querySelector("#username") as HTMLInputElement).value.trim(),
                    password: (providerPanelElement.querySelector("#password") as HTMLInputElement).value.trim(),
                    skipTlsVerify: (providerPanelElement.querySelector("#webdavSkipTlsVerify") as HTMLSelectElement).value === "true",
                    timeout: timeout,
                    concurrentReqs: concurrentReqs,
                };
                fetchSyncPost("/api/sync/setSyncProviderWebDAV", {webdav})
                    .then((response) => {
                        if (response.code === 0 && response.data?.webdav) {
                            window.siyuan.config.sync.webdav = response.data.webdav;
                        }
                    })
                    .finally(() => {
                        fillSyncProviderPanelValues(providerPanelElement);
                    })
                    .catch(() => {});
            } else if (window.siyuan.config.sync.provider === 4) {
                const localTimeoutInput = providerPanelElement.querySelector("#timeout") as HTMLInputElement;
                let timeout = parseInt(localTimeoutInput.value, 10);
                if (7 > timeout) {
                    timeout = 7;
                }
                if (300 < timeout) {
                    timeout = 300;
                }
                let concurrentReqs = parseInt((providerPanelElement.querySelector("#localConcurrentReqs") as HTMLInputElement).value, 10);
                if (1 > concurrentReqs) {
                    concurrentReqs = 1;
                }
                if (1024 < concurrentReqs) {
                    concurrentReqs = 1024;
                }
                localTimeoutInput.value = timeout.toString();
                const local = {
                    endpoint: (providerPanelElement.querySelector("#endpoint") as HTMLInputElement).value,
                    timeout: timeout,
                    concurrentReqs: concurrentReqs,
                };
                fetchSyncPost("/api/sync/setSyncProviderLocal", {local})
                    .then((response) => {
                        if (response.code === 0 && response.data?.local) {
                            window.siyuan.config.sync.local = response.data.local;
                        }
                    })
                    .finally(() => {
                        fillSyncProviderPanelValues(providerPanelElement);
                    })
                    .catch(() => {});
            }
        });
    });
};

export const sync = {
    element: undefined as Element,
    genHTML: () => {
        return `<b class="config-group__title">${window.siyuan.languages.configGroupAccount}</b><div id="configAccountGroup" class="config-group config-group--account">${sync.genAccountHTML()}</div><b class="config-group__title">${window.siyuan.languages.configGroupSync}</b><div class="config-group">${sync.genReposHTML()}</div><b class="config-group__title">${window.siyuan.languages.configGroupLocalDataRepo}</b><div class="config-group">${sync.genLocalDataRepoHTML()}</div>`;
    },
    genAccountHTML: (onlyPayHTML = false) => {
        const isIOS = isInIOS();
        let payHTML;
        if (isIOS) {
            // 已付费
            if (window.siyuan.user?.userSiYuanOneTimePayStatus === 1) {
                payHTML = `<button class="b3-button" data-action="iOSPay" data-type="subscribe">
    <svg><use xlink:href="#iconVIP"></use></svg>${window.siyuan.languages.account4}
</button>`;
            } else {
                payHTML = `<button class="b3-button" data-action="iOSPay" data-type="subscribe">
    <svg><use xlink:href="#iconVIP"></use></svg>${window.siyuan.languages.account10}
</button>
<span class="fn__space"></span>
<button class="b3-button b3-button--success" data-action="iOSPay" data-type="function">
    <svg><use xlink:href="#iconVIP"></use></svg>${window.siyuan.languages.onepay}
</button>`;
            }
        } else {
            payHTML = `<a class="b3-button" href="${getIndexURL("pricing.html")}" target="_blank">
    <svg><use xlink:href="#iconVIP"></use></svg>${window.siyuan.languages[window.siyuan.user?.userSiYuanOneTimePayStatus === 1 ? "account4" : "account1"]}
</a>`;
        }
        payHTML = `${payHTML}
<span class="fn__space"></span>
<span class="b3-chip b3-chip--hover${(window.siyuan.user && window.siyuan.user.userSiYuanSubscriptionStatus === 2) ? " fn__none" : ""}" id="trialSub">
    <svg class="ft__secondary"><use xlink:href="#iconVIP"></use></svg>
    ${window.siyuan.languages.freeSub}
</span>`;
        if (onlyPayHTML) {
            return `<div class="fn__flex-1 fn__hr--b"></div>
${genSVGBG()}
<div class="fn__flex-1 fn__hr--b"></div>    
${payHTML}
<div class="fn__flex-1 fn__hr--b"></div>
${genSVGBG()}
<div class="fn__flex-1 fn__hr--b"></div>`;
        }
        if (window.siyuan.user) {
            let userTitlesHTML = "";
            if (window.siyuan.user.userTitles.length > 0) {
                userTitlesHTML = '<div class="b3-chips">';
                window.siyuan.user.userTitles.forEach((item) => {
                    userTitlesHTML += `<div class="b3-chip b3-chip--middle">${item.icon} ${item.name}</div>`;
                });
                userTitlesHTML += "</div>";
            }
            let subscriptionHTML = "";
            let paymentStatusChipHTML = "";
            let paymentActionHTML = "";
            let activeSubscriptionHTML = isIOS ? "" : `<div class="b3-form__icon fn__block">
   <svg class="ft__secondary b3-form__icon-icon"><use xlink:href="#iconVIP"></use></svg>
   <input class="b3-text-field fn__block b3-form__icon-input" style="padding-right: 44px;" placeholder="${window.siyuan.languages.activationCodePlaceholder}">
   <button id="activationCode" class="b3-button b3-button--text" style="position: absolute;right: 0;top: 0;">${window.siyuan.languages.confirm}</button>
</div>`;
            if (window.siyuan.user.userSiYuanProExpireTime === -1) {
                // 终身会员
                activeSubscriptionHTML = "";
                paymentStatusChipHTML = `<span class="b3-chip b3-chip--middle">${Constants.SIYUAN_IMAGE_VIP}${window.siyuan.languages.account12}</span>`;
            } else if (window.siyuan.user.userSiYuanProExpireTime > 0) {
                // 订阅中
                const renewHTML = `<div class="ft__on-surface ft__smaller">
    ${window.siyuan.languages.account6} 
    ${Math.max(0, Math.floor((window.siyuan.user.userSiYuanProExpireTime - new Date().getTime()) / 1000 / 60 / 60 / 24))} 
    ${window.siyuan.languages.day} 
    ${isIOS ? `<a href="javascript:void(0)" data-action="iOSPay" data-type="subscribe">${window.siyuan.languages.clickMeToRenew}</a>` : `<a href="${getCloudURL("subscribe/siyuan")}" target="_blank">${window.siyuan.languages.clickMeToRenew}</a>`}
</div>`;
                paymentStatusChipHTML = `<span class="b3-chip b3-chip--middle"><svg><use xlink:href="#iconVIP"></use></svg>${window.siyuan.user.userSiYuanSubscriptionPlan === 2 ? window.siyuan.languages.account3 : window.siyuan.languages.account8}</span>`;
                if (window.siyuan.user.userSiYuanSubscriptionPlan === 2) {
                    // 订阅试用
                    subscriptionHTML += renewHTML;
                } else {
                    // 年费
                    subscriptionHTML += renewHTML;
                }
                if (window.siyuan.user.userSiYuanOneTimePayStatus === 0) {
                    paymentActionHTML += isIOS ? `<button class="b3-button b3-button--success" data-action="iOSPay" data-type="function">
    <svg><use xlink:href="#iconVIP"></use></svg>${window.siyuan.languages.onepay}
</button>` : `<a class="b3-button b3-button--success" href="${getIndexURL("pricing.html")}" target="_blank">
    <svg><use xlink:href="#iconVIP"></use></svg>${window.siyuan.languages.onepay}
</a>`;
                } else {
                    paymentStatusChipHTML += `<span class="fn__space"></span><span class="b3-chip b3-chip--middle"><svg><use xlink:href="#iconVIP"></use></svg>${window.siyuan.languages.account7}</span>`;
                }
            } else {
                if (window.siyuan.user.userSiYuanOneTimePayStatus === 1) {
                    paymentStatusChipHTML = `<span class="b3-chip b3-chip--middle"><svg><use xlink:href="#iconVIP"></use></svg>${window.siyuan.languages.account7}</span>`;
                    paymentActionHTML = payHTML;
                } else {
                    paymentActionHTML = payHTML;
                }
            }
            return `<div class="config-account__list">
<div class="fn__flex b3-label config__item config-account__row config-account__row--profile">
    <a href="${getCloudURL("settings/avatar")}" class="config-account__profile-avatar" style="background-image: url(${window.siyuan.user.userAvatarURL})" target="_blank"></a>
    <span class="fn__space"></span>
    <div class="fn__flex-1 config-account__profile">
        <a target="_blank" class="fn__a config-account__profile-name" href="${getCloudURL("member/" + window.siyuan.user.userName)}">${window.siyuan.user.userName}</a>
        <div class="b3-label__text">
            <span>${0 === window.siyuan.config.cloudRegion ? "ld246.com" : "liuyun.io"}</span>
            <span class="fn__space"></span>
            <span>${window.siyuan.user.userNickname || ""}</span>
        </div>
    </div>
    <span class="fn__space"></span>
    <div class="fn__flex config-account__row-actions">
        <button class="b3-button b3-button--outline" id="refresh" aria-label="${window.siyuan.languages.refreshUserInfo}">
    <svg><use xlink:href="#iconRefresh"></use></svg>${window.siyuan.languages.refreshUserInfo}
</button>
        <span class="fn__space"></span>
        <button type="button" class="b3-button b3-button--text${window.siyuan.config.system.container === "ios" ? "" : " fn__none"}" id="deactivateUser">${window.siyuan.languages.deactivateUser}</button>
        <span class="fn__space${window.siyuan.config.system.container === "ios" ? "" : " fn__none"}"></span>
        <a class="b3-button b3-button--text${isIOS ? " fn__none" : ""}" href="${getCloudURL("settings")}" target="_blank">${window.siyuan.languages.manage}</a>
        <span class="fn__space${isIOS ? " fn__none" : ""}"></span>
        <button class="b3-button b3-button--cancel" id="logout">${window.siyuan.languages.logout}</button>
    </div>
</div>
<div class="fn__flex b3-label config__item config-account__row config-account__row--pay">
    <div class="fn__flex-1 config-account__pay-content">
        <div class="fn__flex config-account__pay-header">
            <span class="config-account__pay-label">${window.siyuan.languages.paymentStatus}</span>
            <span class="fn__flex ${(paymentStatusChipHTML || paymentActionHTML) ? "" : "fn__none "}config-account__pay-status">${paymentStatusChipHTML}${paymentActionHTML}</span>
        </div>
        ${subscriptionHTML}
        <div class="b3-label__text${activeSubscriptionHTML ? "" : " fn__none"}">${activeSubscriptionHTML}</div>
    </div>
</div>
<label class="fn__flex b3-label config__item">
    <div class="fn__flex-1 config-account__pay-content">
        <div class="fn__flex config-account__pay-header">
            <span>${window.siyuan.languages.accountDisplayTitle}</span>
            <span class="fn__space"></span>
            <span class="fn__flex config-account__pay-status${window.siyuan.user.userTitles.length > 0 ? "" : " fn__none"}">${userTitlesHTML}</span>
        </div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="displayTitle" type="checkbox"${window.siyuan.config.account.displayTitle ? " checked" : ""}/>
</label>
<label class="fn__flex b3-label config__item">
    <div class="fn__flex-1">${window.siyuan.languages.accountDisplayVIP}</div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="displayVIP" type="checkbox"${window.siyuan.config.account.displayVIP ? " checked" : ""}/>
</label>
</div>`;
        }
        return `<div class="config-account__list">
<div class="fn__flex b3-label config__item config-account__row config-account__row--profile config-account__row--guest">
    <div class="fn__flex-1 config-account__profile--guest">
        <div class="b3-label__text">${window.siyuan.languages.accountTip}</div>
    </div>
    <span class="fn__space"></span>
    <div class="fn__flex config-account__row-actions">
        <a class="b3-button b3-button--outline${window.siyuan.config.system.container === "ios" ? " fn__none" : ""}" href="${getCloudURL("register")}" target="_blank">${window.siyuan.languages.register}</a>
        <span class="fn__space${window.siyuan.config.system.container === "ios" ? " fn__none" : ""}"></span>
        ${isInMobileApp()
        ? `<button type="button" class="b3-button" id="mobileNativeLogin">${window.siyuan.languages.login}</button>`
        : `<a class="b3-button" href="${getCloudURL("login")}" target="_blank">${window.siyuan.languages.login}</a>`}
    </div>
</div>
<div class="fn__flex b3-label config__item config-account__row config-account__row--pay">
    <div class="fn__flex-1 config-account__pay-content">
        <div class="fn__flex config-account__pay-header">
            <span class="config-account__pay-label">${window.siyuan.languages.paymentStatus}</span>
            <span class="fn__flex config-account__pay-status">${payHTML}</span>
        </div>
    </div>
</div>
<label class="fn__flex b3-label config__item">
    <div class="fn__flex-1 config-account__pay-content">
        <div class="fn__flex config-account__pay-header">
            <span>${window.siyuan.languages.accountDisplayTitle}</span>
            <span class="fn__space"></span>
            <span class="fn__flex config-account__pay-status fn__none"></span>
        </div>
    </div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="displayTitle" type="checkbox"${window.siyuan.config.account.displayTitle ? " checked" : ""}/>
</label>
<label class="fn__flex b3-label config__item">
    <div class="fn__flex-1">${window.siyuan.languages.accountDisplayVIP}</div>
    <span class="fn__space"></span>
    <input class="b3-switch fn__flex-center" id="displayVIP" type="checkbox"${window.siyuan.config.account.displayVIP ? " checked" : ""}/>
</label>
</div>`;
    },
    bindAccountEvent: (element: Element) => {
        element.querySelectorAll('[data-action="iOSPay"]').forEach(item => {
            item.addEventListener("click", () => {
                iOSPurchase(item.getAttribute("data-type"));
            });
        });
        const trialSubElement = element.querySelector("#trialSub");
        if (trialSubElement) {
            trialSubElement.addEventListener("click", () => {
                fetchPost("/api/account/startFreeTrial", {}, () => {
                    element.querySelector("#refresh").dispatchEvent(new Event("click"));
                });
            });
        }
        const refreshElement = element.querySelector("#refresh") as HTMLButtonElement;
        refreshElement?.addEventListener("click", () => {
            const svgElement = refreshElement.firstElementChild as SVGElement;
            if (svgElement?.classList.contains("fn__rotate")) {
                return;
            }
            svgElement?.classList.add("fn__rotate");
            fetchPost("/api/setting/getCloudUser", {
                token: window.siyuan.user?.userToken || "",
            }, response => {
                window.siyuan.user = response.data;
                setAccountGroupInnerHTML(element, sync.genAccountHTML());
                sync.bindAccountEvent(element);
                showMessage(window.siyuan.languages.refreshUser, 3000);
                sync.onSetaccount();
                processSync();
            });
        });
        element.querySelectorAll("#displayTitle, #displayVIP").forEach(item => {
            item.addEventListener("change", () => {
                fetchPost("/api/setting/setAccount", {
                    displayTitle: (element.querySelector("#displayTitle") as HTMLInputElement).checked,
                    displayVIP: (element.querySelector("#displayVIP") as HTMLInputElement).checked,
                }, (response) => {
                    window.siyuan.config.account.displayTitle = response.data.displayTitle;
                    window.siyuan.config.account.displayVIP = response.data.displayVIP;
                    sync.onSetaccount();
                });
            });
        });
        element.querySelector("#mobileNativeLogin")?.addEventListener("click", () => {
            login();
        });
        if (!window.siyuan.user) {
            return;
        }
        element.querySelector("#logout")?.addEventListener("click", () => {
            fetchPost("/api/setting/logoutCloudUser", {}, () => {
                fetchPost("/api/setting/getCloudUser", {}, response => {
                    window.siyuan.user = response.data;
                    setAccountGroupInnerHTML(element, sync.genAccountHTML());
                    sync.bindAccountEvent(element);
                    sync.onSetaccount();
                    processSync();
                });
            });
        });
        element.querySelector("#deactivateUser")?.addEventListener(getEventName(), () => {
            confirmDialog("⚠️ " + window.siyuan.languages.deactivateUser, window.siyuan.languages.deactivateUserTip, () => {
                fetchPost("/api/account/deactivate", {}, () => {
                    window.siyuan.user = null;
                    setAccountGroupInnerHTML(element, sync.genAccountHTML());
                    sync.bindAccountEvent(element);
                    sync.onSetaccount();
                    processSync();
                });
            });
        });
        const activationCodeElement = element.querySelector("#activationCode");
        activationCodeElement?.addEventListener("click", () => {
            const activationCodeInput = (activationCodeElement.previousElementSibling as HTMLInputElement);
            fetchPost("/api/account/checkActivationcode", {data: activationCodeInput.value}, (response) => {
                if (0 !== response.code) {
                    activationCodeInput.value = "";
                }
                confirmDialog(window.siyuan.languages.activationCode, response.msg, () => {
                    if (response.code === 0) {
                        fetchPost("/api/account/useActivationcode", {data: (activationCodeElement.previousElementSibling as HTMLInputElement).value}, () => {
                            refreshElement?.dispatchEvent(new CustomEvent("click"));
                        });
                    }
                });
            });
        });
    },
    _afterLogin(userResponse: IWebSocketData, element: Element) {
        window.siyuan.user = userResponse.data;
        processSync();
        setAccountGroupInnerHTML(element, sync.genAccountHTML());
        sync.bindAccountEvent(element);
        sync.onSetaccount();
        if (element.getAttribute("data-action") === "go-repos") {
            if (needSubscribe("") && 0 === window.siyuan.config.sync.provider) {
                const dialogElement = hasClosestByClassName(element, "b3-dialog--open");
                if (dialogElement) {
                    dialogElement.querySelector('.config__side [data-name="repos"]').dispatchEvent(new CustomEvent("click"));
                    element.removeAttribute("data-action");
                }
            } else {
                hideElements(["dialog"]);
                syncGuide();
            }
        }
    },
    onSetaccount() {
        if (window.siyuan.config.system.container === "ios") {
            return;
        }
        let html = "";
        if (window.siyuan.config.account.displayVIP) {
            if (window.siyuan.user) {
                if (window.siyuan.user.userSiYuanProExpireTime === -1) { // 终身会员
                    html = `<div class="toolbar__item ariaLabel" aria-label="${window.siyuan.languages.account12}">${Constants.SIYUAN_IMAGE_VIP}</div>`;
                } else if (window.siyuan.user.userSiYuanProExpireTime > 0) { // 订阅中
                    if (window.siyuan.user.userSiYuanSubscriptionPlan === 2) { // 试用订阅
                        html = `<div class="toolbar__item ariaLabel" aria-label="${window.siyuan.languages.account3}"><svg><use xlink:href="#iconVIP"></use></svg></div>`;
                    } else { // 正常订阅
                        html = `<div class="toolbar__item ariaLabel" aria-label="${window.siyuan.languages.account10}"><svg class="ft__secondary"><use xlink:href="#iconVIP"></use></svg></div>`;
                    }
                } else if (window.siyuan.user.userSiYuanSubscriptionStatus === -1) { // 未订阅
                    html = `<div class="toolbar__item ariaLabel" aria-label="${window.siyuan.languages.freeSub}"><svg class="ft__error"><use xlink:href="#iconVIP"></use></svg></div>`;
                }
                if (window.siyuan.user.userSiYuanOneTimePayStatus === 1) { // 一次性付费功能特性
                    html += `<div class="toolbar__item ariaLabel" aria-label="${window.siyuan.languages.onepay}"><svg class="ft__success"><use xlink:href="#iconVIP"></use></svg></div>`;
                }
            } else { // 未登录
                html = `<div class="toolbar__item ariaLabel" aria-label="${window.siyuan.languages.freeSub}"><svg class="ft__error"><use xlink:href="#iconVIP"></use></svg></div>`;
            }
        }
        if (window.siyuan.config.account.displayTitle && window.siyuan.user) {
            window.siyuan.user.userTitles.forEach(item => {
                html += `<div class="toolbar__item ariaLabel" aria-label="${item.name}：${item.desc}">${item.icon}</div>`;
            });
        }
        document.getElementById("toolbarVIP").innerHTML = html;
    },
    genReposHTML: () => {
        return `<div><div class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        ${window.siyuan.languages.syncProvider}
        <div class="b3-label__text">${window.siyuan.languages.syncProviderTip}</div>
    </div>
    <span class="fn__space"></span>
    <select id="syncProvider" class="b3-select fn__flex-center fn__size200">
        <option value="0" ${window.siyuan.config.sync.provider === 0 ? "selected" : ""}>SiYuan</option>
        <option value="2" ${window.siyuan.config.sync.provider === 2 ? "selected" : ""}>S3</option>
        <option value="3" ${window.siyuan.config.sync.provider === 3 ? "selected" : ""}>WebDAV</option>
        <option class="${!["std", "docker"].includes(window.siyuan.config.system.container) ? "fn__none" : ""}" value="4" ${window.siyuan.config.sync.provider === 4 ? "selected" : ""}>${window.siyuan.languages.localFileSystem}</option>
    </select>
</div>
<div id="syncProviderPanel" class="b3-label">
    ${renderProvider(window.siyuan.config.sync.provider)}
</div>
<div id="reposData" class="b3-label">
    ${getReposDataLoadingHTML()}
</div>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.openSyncTip1}
        <div class="b3-label__text">${window.siyuan.languages.openSyncTip2}</div>
    </div>
    <span class="fn__space"></span>
    <input type="checkbox" id="reposCloudSyncSwitch"${window.siyuan.config.sync.enabled ? " checked='checked'" : ""} class="b3-switch fn__flex-center">
</label>
<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        ${window.siyuan.languages.generateConflictDoc}
        <div class="b3-label__text">${window.siyuan.languages.generateConflictDocTip}</div>
    </div>
    <span class="fn__space"></span>
    <input type="checkbox" id="generateConflictDoc"${window.siyuan.config.sync.generateConflictDoc ? " checked='checked'" : ""} class="b3-switch fn__flex-center">
</label>
<div class="b3-label">
    <div class="fn__flex config__item">
        <div class="fn__flex-1">
            ${window.siyuan.languages.syncMode}
            <div class="b3-label__text">${window.siyuan.languages.syncModeTip}</div>
        </div>
        <span class="fn__space"></span>
        <select id="syncMode" class="b3-select fn__flex-center fn__size200">
            <option value="1" ${window.siyuan.config.sync.mode === 1 ? "selected" : ""}>${window.siyuan.languages.syncMode1}</option>
            <option value="2" ${window.siyuan.config.sync.mode === 2 ? "selected" : ""}>${window.siyuan.languages.syncMode2}</option>
            <option value="3" ${window.siyuan.config.sync.mode === 3 ? "selected" : ""}>${window.siyuan.languages.syncMode3}</option>
        </select>
    </div>
    <div class="fn__flex b3-label${(window.siyuan.config.sync.mode !== 1) ? " fn__none" : ""}">
        <div class="fn__flex-1">
            ${window.siyuan.languages.syncInterval}
            <div class="b3-label__text">${window.siyuan.languages.syncIntervalTip}</div>
        </div>
        <span class="fn__space"></span>
        <input type="number" min="30" max="43200" id="syncInterval" class="b3-text-field fn__flex-center" value="${window.siyuan.config.sync.interval}" >
        <span class="fn__space"></span>        
        <span class="fn__flex-center ft__on-surface">${window.siyuan.languages.second}</span> 
    </div>
    <label class="fn__flex b3-label${(window.siyuan.config.sync.mode !== 1 || window.siyuan.config.system.container === "docker" || window.siyuan.config.sync.provider !== 0) ? " fn__none" : ""}">
        <div class="fn__flex-1">
            ${window.siyuan.languages.syncPerception}
            <div class="b3-label__text">${window.siyuan.languages.syncPerceptionTip}</div>
        </div>
        <span class="fn__space"></span>
        <input type="checkbox" id="syncPerception"${window.siyuan.config.sync.perception ? " checked='checked'" : ""} class="b3-switch fn__flex-center">
    </label>
</div>
<div class="b3-label">
    <div class="fn__flex config__item">
        <div class="fn__flex-1">
            ${window.siyuan.languages.cloudSyncDir}
            <div class="b3-label__text">${window.siyuan.languages.cloudSyncDirTip}</div>
        </div>
        <div class="fn__space"></div>
        <button class="b3-button b3-button--outline fn__flex-center fn__size200" data-action="config">
            <svg><use xlink:href="#iconSettings"></use></svg>${window.siyuan.languages.config}
        </button>
    </div>
    <div id="reposCloudSyncList" class="fn__none b3-label"><img style="margin: 0 auto;display: block;width: 64px;height: 100%" src="/stage/loading-pure.svg"></div>
</div>
<div class="b3-label fn__flex">
    <div class="fn__flex-center">${window.siyuan.languages.cloudBackup}</div>
    <div class="b3-list-item__meta fn__flex-center">${window.siyuan.languages.cloudBackupTip}</div>
</div></div>`;
    },
    bindReposEvent: () => {
        bindProviderEvent();
        const switchElement = sync.element.querySelector("#reposCloudSyncSwitch") as HTMLInputElement;
        switchElement.addEventListener("change", () => {
            if (switchElement.checked && window.siyuan.config.sync.cloudName === "") {
                switchElement.checked = false;
                showMessage(window.siyuan.languages._kernel[123]);
                return;
            }
            fetchPost("/api/sync/setSyncEnable", {enabled: switchElement.checked}, () => {
                window.siyuan.config.sync.enabled = switchElement.checked;
                processSync();
            });
        });
        const syncIntervalElement = sync.element.querySelector("#syncInterval") as HTMLInputElement;
        syncIntervalElement.addEventListener("change", () => {
            let interval = parseInt(syncIntervalElement.value);
            if (30 > interval) {
                interval = 30;
            }
            if (43200 < interval) {
                interval = 43200;
            }
            syncIntervalElement.value = interval.toString();
            fetchPost("/api/sync/setSyncInterval", {interval: interval}, () => {
                window.siyuan.config.sync.interval = interval;
                processSync();
            });
        });
        const syncPerceptionElement = sync.element.querySelector("#syncPerception") as HTMLInputElement;
        syncPerceptionElement.addEventListener("change", () => {
            fetchPost("/api/sync/setSyncPerception", {enabled: syncPerceptionElement.checked}, () => {
                window.siyuan.config.sync.perception = syncPerceptionElement.checked;
                processSync();
            });
        });
        const switchConflictElement = sync.element.querySelector("#generateConflictDoc") as HTMLInputElement;
        switchConflictElement.addEventListener("change", () => {
            fetchPost("/api/sync/setSyncGenerateConflictDoc", {enabled: switchConflictElement.checked}, () => {
                window.siyuan.config.sync.generateConflictDoc = switchConflictElement.checked;
            });
        });
        const syncModeElement = sync.element.querySelector("#syncMode") as HTMLSelectElement;
        syncModeElement.addEventListener("change", () => {
            fetchPost("/api/sync/setSyncMode", {mode: parseInt(syncModeElement.value, 10)}, () => {
                if (syncModeElement.value === "1" && window.siyuan.config.sync.provider === 0 && window.siyuan.config.system.container !== "docker") {
                    syncPerceptionElement.parentElement.classList.remove("fn__none");
                } else {
                    syncPerceptionElement.parentElement.classList.add("fn__none");
                }
                if (syncModeElement.value === "1") {
                    syncIntervalElement.parentElement.classList.remove("fn__none");
                } else {
                    syncIntervalElement.parentElement.classList.add("fn__none");
                }
                window.siyuan.config.sync.mode = parseInt(syncModeElement.value, 10);
            });
        });
        const syncConfigElement = sync.element.querySelector("#reposCloudSyncList");
        const syncProviderElement = sync.element.querySelector("#syncProvider") as HTMLSelectElement;
        syncProviderElement.addEventListener("change", () => {
            fetchPost("/api/sync/setSyncProvider", {provider: parseInt(syncProviderElement.value, 10)}, (response) => {
                if (response.code === 1) {
                    showMessage(response.msg);
                    syncProviderElement.value = "0";
                    window.siyuan.config.sync.provider = 0;
                } else {
                    window.siyuan.config.sync.provider = parseInt(syncProviderElement.value, 10);
                }
                sync.element.querySelector("#syncProviderPanel").innerHTML = renderProvider(window.siyuan.config.sync.provider);
                bindProviderEvent();
                syncConfigElement.innerHTML = "";
                syncConfigElement.classList.add("fn__none");
                if (window.siyuan.config.sync.mode !== 1 || window.siyuan.config.system.container === "docker" || window.siyuan.config.sync.provider !== 0) {
                    syncPerceptionElement.parentElement.classList.add("fn__none");
                } else {
                    syncPerceptionElement.parentElement.classList.remove("fn__none");
                }
                if (window.siyuan.config.sync.mode !== 1) {
                    syncIntervalElement.parentElement.classList.add("fn__none");
                } else {
                    syncIntervalElement.parentElement.classList.remove("fn__none");
                }
            });
        });
        bindSyncCloudListEvent(syncConfigElement);
        sync.element.firstElementChild.addEventListener("click", (event) => {
            let target = event.target as HTMLElement;
            while (target && target !== sync.element) {
                const action = target.getAttribute("data-action");
                if (action === "config") {
                    if (syncConfigElement.classList.contains("fn__none")) {
                        getSyncCloudList(syncConfigElement, true);
                        syncConfigElement.classList.remove("fn__none");
                    } else {
                        syncConfigElement.classList.add("fn__none");
                    }
                    break;
                } else if (action === "togglePassword") {
                    const isEye = target.firstElementChild.getAttribute("xlink:href") === "#iconEye";
                    target.firstElementChild.setAttribute("xlink:href", isEye ? "#iconEyeoff" : "#iconEye");
                    target.previousElementSibling.setAttribute("type", isEye ? "text" : "password");
                    break;
                } else if (action === "exportData") {
                    fetchPost(target.getAttribute("data-type") === "s3" ? "/api/sync/exportSyncProviderS3" : "/api/sync/exportSyncProviderWebDAV", {}, response => {
                        openByMobile(response.data.zip);
                    });
                    break;
                } else if (action === "purgeData") {
                    confirmDialog("♻️ " + window.siyuan.languages.cloudStoragePurge, `<div class="b3-typography">${window.siyuan.languages.cloudStoragePurgeConfirm}</div>`, () => {
                        fetchPost("/api/repo/purgeCloudRepo");
                    });
                    break;
                }
                target = target.parentElement;
            }
        });
    },
genLocalDataRepoHTML: () => {
        return '<div class="b3-label fn__flex config__item"><div class="fn__flex-1 fn__flex-center">' +
            window.siyuan.languages.dataRepoKey +
            '<div class="b3-label__text">' + window.siyuan.languages.dataRepoKeyTip1 + "</div>" +
            '<div class="b3-label__text"><span class="ft__error">' + window.siyuan.languages.dataRepoKeyTip2 + "</span></div>" +
            '</div><div class="fn__space"></div>' +
            '<div class="fn__size200 config__item-line fn__flex-center' + (window.siyuan.config.repo.key ? " fn__none" : "") + '">' +
            '<button class="b3-button b3-button--outline fn__block" id="importKey"><svg><use xlink:href="#iconDownload"></use></svg>' + window.siyuan.languages.importKey + "</button>" +
            '<div class="fn__hr"></div>' +
            '<button class="b3-button b3-button--outline fn__block" id="initKey"><svg><use xlink:href="#iconLock"></use></svg>' + window.siyuan.languages.genKey + "</button>" +
            '<div class="fn__hr"></div>' +
            '<button class="b3-button b3-button--outline fn__block" id="initKeyByPW"><svg><use xlink:href="#iconHand"></use></svg>' + window.siyuan.languages.genKeyByPW + "</button>" +
            "</div>" +
            '<div class="fn__size200 config__item-line fn__flex-center' + (window.siyuan.config.repo.key ? "" : " fn__none") + '">' +
            '<button class="b3-button b3-button--outline fn__block" id="copyKey"><svg><use xlink:href="#iconCopy"></use></svg>' + window.siyuan.languages.copyKey + "</button>" +
            '<div class="fn__hr"></div>' +
            '<button class="b3-button b3-button--outline fn__block" id="resetRepo"><svg><use xlink:href="#iconUndo"></use></svg>' + window.siyuan.languages.resetRepo + "</button>" +
            "</div></div>" +
            '<div class="b3-label"><div>' + window.siyuan.languages.dataRepoPurge + '</div><div class="fn__hr"></div>' +
            '<div class="fn__flex config__item"><div class="fn__flex-center fn__flex-1 ft__on-surface">' + window.siyuan.languages.dataRepoPurgeTip + '</div><span class="fn__space"></span>' +
            '<button id="purgeRepo" class="b3-button b3-button--outline fn__size200 fn__flex-center"><svg><use xlink:href="#iconTrashcan"></use></svg>' + window.siyuan.languages.purge + "</button></div>" +
            '<div class="fn__hr"></div>' +
            '<div class="fn__flex config__item"><div class="fn__flex-center fn__flex-1 ft__on-surface">' + window.siyuan.languages.dataRepoAutoPurgeIndexRetentionDays + '</div><span class="fn__space"></span>' +
            '<input class="b3-text-field fn__flex-center fn__size200" min="1" type="number" id="indexRetentionDays" value="' + window.siyuan.config.repo.indexRetentionDays + '"></div>' +
            '<div class="fn__hr"></div>' +
            '<div class="fn__flex config__item"><div class="fn__flex-center fn__flex-1 ft__on-surface">' + window.siyuan.languages.dataRepoAutoPurgeRetentionIndexesDaily + '</div><span class="fn__space"></span>' +
            '<input class="b3-text-field fn__flex-center fn__size200" min="1" type="number" id="retentionIndexesDaily" value="' + window.siyuan.config.repo.retentionIndexesDaily + '"></div>' +
            "</div>";
    },
    bindEvent: () => {
        const root = sync.element as Element;
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
        const importKeyElement = root.querySelector("#importKey");
        importKeyElement?.addEventListener("click", () => {
            const passwordDialog = new Dialog({
                title: "🔑 " + window.siyuan.languages.key,
                content: `<div class="b3-dialog__content">
    <textarea spellcheck="false" style="resize: vertical;" class="b3-text-field fn__block" placeholder="${window.siyuan.languages.keyPlaceholder}"></textarea>
</div>
<div class="b3-dialog__action">
    <button class="b3-button b3-button--cancel">${window.siyuan.languages.cancel}</button><div class="fn__space"></div>
    <button class="b3-button b3-button--text">${window.siyuan.languages.confirm}</button>
</div>`,
                width: "520px",
            });
            passwordDialog.element.setAttribute("data-key", Constants.DIALOG_PASSWORD);
            const textAreaElement = passwordDialog.element.querySelector("textarea");
            textAreaElement.focus();
            const btnsElement = passwordDialog.element.querySelectorAll(".b3-button");
            btnsElement[0].addEventListener("click", () => {
                passwordDialog.destroy();
            });
            btnsElement[1].addEventListener("click", () => {
                fetchPost("/api/repo/importRepoKey", {key: textAreaElement.value}, (response) => {
                    window.siyuan.config.repo.key = response.data.key;
                    importKeyElement.parentElement.classList.add("fn__none");
                    importKeyElement.parentElement.nextElementSibling.classList.remove("fn__none");
                    passwordDialog.destroy();
                });
            });
        });
        root.querySelector("#initKey")?.addEventListener("click", () => {
            confirmDialog("🔑 " + window.siyuan.languages.genKey, window.siyuan.languages.initRepoKeyTip, () => {
                fetchPost("/api/repo/initRepoKey", {}, (response) => {
                    window.siyuan.config.repo.key = response.data.key;
                    importKeyElement.parentElement.classList.add("fn__none");
                    importKeyElement.parentElement.nextElementSibling.classList.remove("fn__none");
                });
            });
        });
        root.querySelector("#initKeyByPW")?.addEventListener("click", () => {
            setKey(false, () => {
                importKeyElement.parentElement.classList.add("fn__none");
                importKeyElement.parentElement.nextElementSibling.classList.remove("fn__none");
            });
        });
        root.querySelector("#copyKey")?.addEventListener("click", () => {
            showMessage(window.siyuan.languages.copied);
            writeText(window.siyuan.config.repo.key);
        });
        root.querySelector("#resetRepo")?.addEventListener("click", () => {
            confirmDialog("⚠️ " + window.siyuan.languages.resetRepo, window.siyuan.languages.resetRepoTip, () => {
                fetchPost("/api/repo/resetRepo", {}, () => {
                    window.siyuan.config.repo.key = "";
                    window.siyuan.config.sync.enabled = false;
                    processSync();
                    importKeyElement.parentElement.classList.remove("fn__none");
                    importKeyElement.parentElement.nextElementSibling.classList.add("fn__none");
                });
            });
        });
        root.querySelector("#purgeRepo")?.addEventListener("click", () => {
            confirmDialog("♻️ " + window.siyuan.languages.dataRepoPurge, window.siyuan.languages.dataRepoPurgeConfirm, () => {
                fetchPost("/api/repo/purgeRepo");
            });
        });
        sync.bindAccountEvent(root);
        sync.bindReposEvent();
    },
};
