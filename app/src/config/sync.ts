import {showMessage} from "../dialog/message";
import {Constants} from "../constants";
import {fetchPost, fetchSyncPost} from "../util/fetch";
import {confirmDialog} from "../dialog/confirmDialog";
import {saveExportFile, writeText} from "../protyle/util/compatibility";
import {processSync} from "../dialog/processSystem";
import {isPaidUser, needSubscribe} from "../util/needSubscribe";
import {bindSyncCloudListEvent, renderSyncCloudList, setKey, syncGuide} from "../sync/syncGuide";
import {hideElements} from "../protyle/ui/hideElements";
import {getCloudURL} from "./util/about";
import {Dialog} from "../dialog";
import {
    type SettingSection,
    switchRow,
    numberRow,
    selectRow,
    customRow,
    stackRow,
    findSettingRowByControlId,
} from "./ui/settingRows";
import {filterSettingSections} from "./ui/search";
import {genConfigItemMainHtml, genSettingTabHtmlFromSections, genConfigItemName} from "./ui/render";
import {readDomValue} from "./ui/formValue";
import {
    buildAccountSection,
    mountSiyuanAccountDebugPanel,
    sendAccountSetting,
    updateAccountSwitchesVisibility,
} from "./account";

import {mountSettingSaveHandlers} from "./ui/save";

export const syncSettings = {
    element: undefined as HTMLElement | undefined,

    mount: async (root: HTMLElement, searchQuery?: string) => {
        syncSettings.element = root;
        const sections = filterSettingSections(buildSyncSections(), searchQuery);
        root.innerHTML = genSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
    
        setSyncConfigItemVisible(root);
        setSyncModeRelatedConfigItemVisible(root);
        renderProviderConfig(root);
        renderCloudSpace(root);

        updateAccountSwitchesVisibility(root);
        mountSiyuanAccountDebugPanel();
    },

    set(el: HTMLElement, controlId: string) {
        const row = findSettingRowByControlId(buildSyncSections(), controlId);
        const value = readDomValue(el, row);
        if (value !== undefined) {
            syncSettings.send(controlId, value);
        }
    },

    send(controlId: string, value: unknown) {
        const root = syncSettings.element;
        switch (controlId) {
            case "account.displayTitle":
            case "account.displayVIP":
                sendAccountSetting();
                break;

            case "sync.provider": {
                const provider = value as Config.ISync["provider"];
                fetchPost("/api/sync/setSyncProvider", {provider}, (response) => {
                    const syncProviderElement = document.querySelector(`#${CSS.escape("sync.provider")}`) as HTMLSelectElement | null;
                    if (response.code === 1) {
                        showMessage(response.msg);
                        if (syncProviderElement) {
                            syncProviderElement.value = "0";
                        }
                        window.siyuan.config.sync.provider = 0;
                    } else {
                        window.siyuan.config.sync.provider = provider;
                    }
                    if (root) {
                        setSyncConfigItemVisible(root);
                        setSyncModeRelatedConfigItemVisible(root);
                        renderProviderConfig(root);
                        renderCloudSpace(root);
                    }
                    const syncConfigElement = root?.querySelector("#syncCloudList");
                    if (syncConfigElement) {
                        syncConfigElement.innerHTML = "";
                        syncConfigElement.classList.add("fn__none");
                    }
                });
                break;
            }
            case "sync.enabled": {
                const enabled = Boolean(value);
                if (enabled && window.siyuan.config.sync.cloudName === "") {
                    const switchElement = document.querySelector(`#${CSS.escape("sync.enabled")}`) as HTMLInputElement | null;
                    if (switchElement) {
                        switchElement.checked = false;
                    }
                    showMessage(window.siyuan.languages._kernel[123]);
                    return;
                }
                fetchPost("/api/sync/setSyncEnable", {enabled}, () => {
                    window.siyuan.config.sync.enabled = enabled;
                    processSync();
                });
                break;
            }
            case "sync.generateConflictDoc":
                fetchPost("/api/sync/setSyncGenerateConflictDoc", {enabled: Boolean(value)}, () => {
                    window.siyuan.config.sync.generateConflictDoc = Boolean(value);
                });
                break;
            case "sync.mode":
                fetchPost("/api/sync/setSyncMode", {mode: value as number}, () => {
                    window.siyuan.config.sync.mode = value as number;
                    if (root) {
                        setSyncModeRelatedConfigItemVisible(root);
                    }
                });
                break;
            case "sync.interval":
                fetchPost("/api/sync/setSyncInterval", {interval: value as number}, () => {
                    window.siyuan.config.sync.interval = value as number;
                    processSync();
                });
                break;
            case "sync.perception":
                fetchPost("/api/sync/setSyncPerception", {enabled: Boolean(value)}, () => {
                    window.siyuan.config.sync.perception = Boolean(value);
                    processSync();
                });
                break;

            case "repo.indexRetentionDays":
                fetchPost("/api/repo/setRepoIndexRetentionDays", {days: value as number}, () => {
                    window.siyuan.config.repo.indexRetentionDays = value as number;
                });
                break;
            case "repo.retentionIndexesDaily":
                fetchPost("/api/repo/setRetentionIndexesDaily", {indexes: value as number}, () => {
                    window.siyuan.config.repo.retentionIndexesDaily = value as number;
                });
                break;
            default:
                break;
        }
    },

    _tryGoRepos(element: Element) {
        if (element.getAttribute("data-action") !== "go-repos") {
            return;
        }
        if (needSubscribe("") && 0 === window.siyuan.config.sync.provider) {
            element.removeAttribute("data-action");
        } else {
            hideElements(["dialog"]);
            syncGuide();
        }
    },

    refreshSyncCloudSpaceGroup(root: Element) {
        setSyncConfigItemVisible(root);
        setSyncModeRelatedConfigItemVisible(root);
        renderProviderConfig(root);
        renderCloudSpace(root);
        const syncConfigElement = root.querySelector("#syncCloudList");
        if (syncConfigElement) {
            syncConfigElement.innerHTML = "";
            syncConfigElement.classList.add("fn__none");
            bindSyncCloudListEvent(syncConfigElement);
        }
    },
};

const setSyncConfigItemVisible = (root: Element) => {
    const isProviderOfficial = window.siyuan.config.sync.provider === 0;
    const visible = isProviderOfficial ? !needSubscribe("") : isPaidUser();
    [
        "cloudSpace",
        "sync.enabled",
        "sync.generateConflictDoc",
        "sync.mode",
        "sync.interval",
        "sync.perception",
        "syncCloudDirBlock",
        "syncCloudBackupBlock",
    ]
    .forEach((id) => {
        root.querySelector(`#${CSS.escape(id)}`)?.closest(".config-item")?.classList.toggle("fn__none", !visible);
    });
};

const setSyncModeRelatedConfigItemVisible = (root: Element) => {
    const syncModeElement = root.querySelector(`#${CSS.escape("sync.mode")}`) as HTMLSelectElement | null;
    if (!syncModeElement) {
        return;
    }
    const syncMode: Config.ISync["mode"] = Number(syncModeElement.value);
    const isProviderOfficialAutoSync = syncMode === 1 && !needSubscribe("");
    root.querySelector(`#${CSS.escape("sync.interval")}`)?.closest(".config-item")?.classList.toggle("fn__none", !isProviderOfficialAutoSync);
    root.querySelector(`#${CSS.escape("sync.perception")}`)?.closest(".config-item")?.classList.toggle("fn__none", !(isProviderOfficialAutoSync && window.siyuan.config.sync.provider === 0 && window.siyuan.config.system.container !== "docker"));
};

export function buildSyncSections(): SettingSection[] {
    return [
        buildAccountSection(),
        {
            title: window.siyuan.languages.configGroupSync,
            items: [
                selectRow({
                    id: "sync.provider",
                    title: window.siyuan.languages.syncProvider,
                    desc: window.siyuan.languages.syncProviderTip,
                    options: [
                        {value: 0, label: "SiYuan"},
                        {value: 2, label: "S3"},
                        {value: 3, label: "WebDAV"},
                        ...(["std", "docker"].includes(window.siyuan.config.system.container) ? [{value: 4, label: window.siyuan.languages.localFileSystem}] : []),
                    ],
                    value: window.siyuan.config.sync.provider,
                }),
                customRow({
                    keywords: buildProviderConfigKeywords(),
                    html: () => '<div id="syncProviderConfig" class="b3-label config-item"></div>',
                }),
                customRow({
                    keywords: [window.siyuan.languages.cloudStorage, window.siyuan.languages.trafficStat, window.siyuan.languages.backup],
                    html: () => '<div id="cloudSpace" class="b3-label config-item"></div>',
                }),
                switchRow({
                    id: "sync.enabled",
                    title: window.siyuan.languages.openSyncTip1,
                    desc: window.siyuan.languages.openSyncTip2,
                }),
                switchRow({
                    id: "sync.generateConflictDoc",
                    title: window.siyuan.languages.generateConflictDoc,
                    desc: window.siyuan.languages.generateConflictDocTip,
                }),
                selectRow({
                    id: "sync.mode",
                    title: window.siyuan.languages.syncMode,
                    desc: window.siyuan.languages.syncModeTip,
                    options: [
                        {value: 1, label: window.siyuan.languages.syncMode1},
                        {value: 2, label: window.siyuan.languages.syncMode2},
                        {value: 3, label: window.siyuan.languages.syncMode3},
                    ],
                    value: window.siyuan.config.sync.mode,
                }),
                numberRow({
                    id: "sync.interval",
                    title: window.siyuan.languages.syncInterval,
                    desc: window.siyuan.languages.syncIntervalTip,
                    min: 30,
                    max: 43200,
                    unit: window.siyuan.languages.second,
                }),
                switchRow({
                    id: "sync.perception",
                    title: window.siyuan.languages.syncPerception,
                    desc: window.siyuan.languages.syncPerceptionTip,
                }),
                customRow({
                    keywords: [window.siyuan.languages.cloudSyncDir, window.siyuan.languages.cloudSyncDirTip, window.siyuan.languages.config],
                    html: () => `<div class="b3-label config-item" id="syncCloudDirBlock">
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml(window.siyuan.languages.cloudSyncDir, window.siyuan.languages.cloudSyncDirTip)}
        <div class="fn__space"></div>
        <button class="b3-button b3-button--outline fn__flex-center fn__size200" data-action="config">
            <svg><use xlink:href="#iconSettings"></use></svg>${window.siyuan.languages.config}
        </button>
    </div>
    <div id="syncCloudList" class="fn__none"></div>
</div>`,
                    bind: (root) => {
                        const cloudListElement = root.querySelector("#syncCloudList");
                        if (cloudListElement) {
                            bindSyncCloudListEvent(cloudListElement);
                            root.querySelector('#syncCloudDirBlock [data-action="config"]')?.addEventListener("click", () => {
                                const hidden = cloudListElement.classList.toggle("fn__none");
                                if (!hidden) {
                                    renderSyncCloudList(cloudListElement, true);
                                }
                            });
                        }
                    },
                }),
                customRow({
                    keywords: [window.siyuan.languages.cloudBackup, window.siyuan.languages.cloudBackupTip],
                    html: () => `<div class="fn__flex b3-label config-item" id="syncCloudBackupBlock">
    <div class="fn__flex-center">${window.siyuan.languages.cloudBackup}</div>
    <div class="b3-list-item__meta fn__flex-center">${window.siyuan.languages.cloudBackupTip}</div>
</div>`,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupLocalDataRepo,
            items: [
                customRow({
                    keywords: [
                        window.siyuan.languages.dataRepoKey,
                        window.siyuan.languages.dataRepoKeyTip1,
                        window.siyuan.languages.dataRepoKeyTip2,
                        window.siyuan.languages.importKey,
                        window.siyuan.languages.genKey,
                        window.siyuan.languages.genKeyByPW,
                        window.siyuan.languages.copyKey,
                        window.siyuan.languages.resetRepo,
                    ],
                    html: () => `<div class="fn__flex b3-label config-item config-wrap">
    <div class="fn__flex-1 fn__flex-center">
        ${genConfigItemName(window.siyuan.languages.dataRepoKey)}
        <div class="fn__hr"></div>
        <div class="b3-label__text">
            ${window.siyuan.languages.dataRepoKeyTip1}
            <div class="fn__hr"></div>
            <span class="ft__error">${window.siyuan.languages.dataRepoKeyTip2}</span>
        </div>
    </div>
    <div class="fn__space"></div>
    <div class="fn__size200 fn__flex-center fn__none" id="repoKeyActionsEmpty">
        <button class="b3-button b3-button--outline fn__block" id="importKey"><svg><use xlink:href="#iconDownload"></use></svg>${window.siyuan.languages.importKey}</button>
        <div class="fn__hr"></div>
        <button class="b3-button b3-button--outline fn__block" id="initKey"><svg><use xlink:href="#iconLock"></use></svg>${window.siyuan.languages.genKey}</button>
        <div class="fn__hr"></div>
        <button class="b3-button b3-button--outline fn__block" id="initKeyByPW"><svg><use xlink:href="#iconHand"></use></svg>${window.siyuan.languages.genKeyByPW}</button>
    </div>
    <div class="fn__size200 fn__flex-center fn__none" id="repoKeyActionsSet">
        <button class="b3-button b3-button--outline fn__block" id="copyKey"><svg><use xlink:href="#iconCopy"></use></svg>${window.siyuan.languages.copyKey}</button>
        <div class="fn__hr"></div>
        <button class="b3-button b3-button--outline fn__block" id="resetRepo"><svg><use xlink:href="#iconUndo"></use></svg>${window.siyuan.languages.resetRepo}</button>
    </div>
</div>`,
                    bind: (root) => {
                        const emptyElement = root.querySelector("#repoKeyActionsEmpty");
                        const setElement = root.querySelector("#repoKeyActionsSet");
                        const toggleRepoKeyActions = () => {
                            const hasKey = Boolean(window.siyuan.config.repo.key);
                            emptyElement?.classList.toggle("fn__none", hasKey);
                            setElement?.classList.toggle("fn__none", !hasKey);
                        };
                        toggleRepoKeyActions();
                        root.querySelector("#importKey")?.addEventListener("click", () => {
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
                                    toggleRepoKeyActions();
                                    passwordDialog.destroy();
                                });
                            });
                        });
                        root.querySelector("#initKey")?.addEventListener("click", () => {
                            confirmDialog("🔑 " + window.siyuan.languages.genKey, window.siyuan.languages.initRepoKeyTip, () => {
                                fetchPost("/api/repo/initRepoKey", {}, (response) => {
                                    window.siyuan.config.repo.key = response.data.key;
                                    toggleRepoKeyActions();
                                });
                            });
                        });
                        root.querySelector("#initKeyByPW")?.addEventListener("click", () => {
                            setKey(false, () => {
                                toggleRepoKeyActions();
                            });
                        });
                        root.querySelector("#copyKey")?.addEventListener("click", () => {
                            writeText(window.siyuan.config.repo.key);
                            showMessage(window.siyuan.languages.copied);
                        });
                        root.querySelector("#resetRepo")?.addEventListener("click", () => {
                            confirmDialog("⚠️ " + window.siyuan.languages.resetRepo, window.siyuan.languages.resetRepoTip, () => {
                                fetchPost("/api/repo/resetRepo", {}, () => {
                                    window.siyuan.config.repo.key = "";
                                    window.siyuan.config.sync.enabled = false;
                                    processSync();
                                    toggleRepoKeyActions();
                                });
                            });
                        });
                    },
                }),
                stackRow({
                    lines: [
                        {left: {kind: "title", text: window.siyuan.languages.dataRepoPurge}},
                        {
                            left: {kind: "desc", text: window.siyuan.languages.dataRepoPurgeTip},
                            right: {
                                kind: "button",
                                id: "purgeRepo",
                                label: window.siyuan.languages.purge,
                                icon: "iconTrashcan",
                                bind: (root) => {
                                    root.querySelector("#purgeRepo")?.addEventListener("click", () => {
                                        confirmDialog("♻️ " + window.siyuan.languages.dataRepoPurge, window.siyuan.languages.dataRepoPurgeConfirm, () => {
                                            fetchPost("/api/repo/purgeRepo");
                                        });
                                    });
                                },
                            },
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.dataRepoAutoPurgeIndexRetentionDays},
                            right: {
                                kind: "number",
                                id: "repo.indexRetentionDays",
                                value: window.siyuan.config.repo.indexRetentionDays,
                                min: 1,
                            },
                        },
                        {
                            left: {kind: "desc", text: window.siyuan.languages.dataRepoAutoPurgeRetentionIndexesDaily},
                            right: {
                                kind: "number",
                                id: "repo.retentionIndexesDaily",
                                value: window.siyuan.config.repo.retentionIndexesDaily,
                                min: 1,
                            },
                        },
                    ],
                }),
            ],
        },
    ];
}

type SyncProviderConfigKey = Extract<keyof Config.ISync, "s3" | "webdav" | "local">;

type SyncProviderFieldDef =
    | {type: "input"; label: string; id: string; attrs?: string}
    | {type: "password"; label: string; id: string}
    | {type: "select"; label: string; id: string; options: {value: string; label: string}[]};

type SyncProviderIntroDef = {
    genIntro: () => string;
    genUnpaidIntro: () => string;
    isProviderConfigAllowed: () => boolean;
};

type SyncThirdPartyProviderDef = SyncProviderIntroDef & {
    configKey: SyncProviderConfigKey;
    api: string;
    getConfig: () => Config.ISync[SyncProviderConfigKey];
    fields: SyncProviderFieldDef[];
};

type SyncProviderDef = SyncProviderIntroDef | SyncThirdPartyProviderDef;

const isThirdPartySyncProviderDef = (def: SyncProviderDef): def is SyncThirdPartyProviderDef => {
    return "configKey" in def;
};

const genThirdPartyUnpaidIntro = (): string => {
    const accountServer = getCloudURL("");
    return `<div>
    ${window.siyuan.languages._kernel[214].replaceAll("${accountServer}", accountServer)}
</div>`;
};

const SYNC_PROVIDER_DEFS: Record<Config.ISync["provider"], SyncProviderDef> = {
    0: {
        isProviderConfigAllowed: () => !needSubscribe(""),
        genIntro: () => `<div class="b3-label b3-label--inner">${window.siyuan.languages.syncOfficialProviderIntro}</div>`,
        genUnpaidIntro: () => {
            const accountServer = getCloudURL("");
            return `<div class="b3-label b3-label--inner">
    ${window.siyuan.config.system.container === "ios"
        ? window.siyuan.languages._kernel[295]
        : window.siyuan.languages._kernel[29].replaceAll("${accountServer}", accountServer)}
</div>
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
        },
    },
    2: {
        isProviderConfigAllowed: isPaidUser,
        configKey: "s3",
        api: "/api/sync/setSyncProviderS3",
        getConfig: () => window.siyuan.config.sync.s3,
        genIntro: () => `<div class="b3-label b3-label--inner">
    ${window.siyuan.languages.syncThirdPartyProviderS3Intro}
    <div class="fn__hr"></div>
    <em>${window.siyuan.languages.proFeature}</em>
    <div class="fn__hr"></div>
    ${window.siyuan.languages.syncThirdPartyProviderTip}
</div>`,
        genUnpaidIntro: genThirdPartyUnpaidIntro,
        fields: [
            {type: "input", label: "Endpoint", id: "endpoint"},
            {type: "input", label: "Access Key", id: "accessKey"},
            {type: "password", label: "Secret Key", id: "secretKey"},
            {type: "input", label: "Bucket", id: "bucket"},
            {type: "input", label: "Region ID", id: "region"},
            {type: "input", label: "Timeout (s)", id: "timeout", attrs: 'type="number" min="7" max="300"'},
            {type: "select", label: "Addressing", id: "pathStyle", options: [
                {value: "true", label: "Path-style"},
                {value: "false", label: "Virtual-hosted-style"},
            ]},
            {type: "select", label: "TLS Verify", id: "skipTlsVerify", options: [
                {value: "false", label: "Verify"},
                {value: "true", label: "Skip"},
            ]},
            {type: "input", label: "Concurrent Reqs", id: "concurrentReqs", attrs: 'type="number" min="1" max="16"'},
        ],
    },
    3: {
        isProviderConfigAllowed: isPaidUser,
        configKey: "webdav",
        api: "/api/sync/setSyncProviderWebDAV",
        getConfig: () => window.siyuan.config.sync.webdav,
        genIntro: () => `<div class="b3-label b3-label--inner">
    ${window.siyuan.languages.syncThirdPartyProviderWebDAVIntro}
    <div class="fn__hr"></div>
    <em>${window.siyuan.languages.proFeature}</em>
    <div class="fn__hr"></div>
    ${window.siyuan.languages.syncThirdPartyProviderTip}
</div>`,
        genUnpaidIntro: genThirdPartyUnpaidIntro,
        fields: [
            {type: "input", label: "Endpoint", id: "endpoint"},
            {type: "input", label: "Username", id: "username"},
            {type: "password", label: "Password", id: "password"},
            {type: "input", label: "Timeout (s)", id: "timeout", attrs: 'type="number" min="7" max="300"'},
            {type: "select", label: "TLS Verify", id: "skipTlsVerify", options: [
                {value: "false", label: "Verify"},
                {value: "true", label: "Skip"},
            ]},
            {type: "input", label: "Concurrent Reqs", id: "concurrentReqs", attrs: 'type="number" min="1" max="16"'},
        ],
    },
    4: {
        isProviderConfigAllowed: isPaidUser,
        configKey: "local",
        api: "/api/sync/setSyncProviderLocal",
        getConfig: () => window.siyuan.config.sync.local,
        genIntro: () => `<div class="b3-label b3-label--inner">
    <div class="ft__error">
        ${window.siyuan.languages.mobileNotSupport}
    </div>
    <div class="fn__hr"></div>
    ${window.siyuan.languages.syncThirdPartyProviderLocalIntro}
    <div class="fn__hr"></div>
    <em>${window.siyuan.languages.proFeature}</em>
</div>`,
        genUnpaidIntro: () => `${genThirdPartyUnpaidIntro()}<div class="ft__error">
    <div class="fn__hr--b"></div>
    ${window.siyuan.languages.mobileNotSupport}
</div>`,
        fields: [
            {type: "input", label: "Endpoint", id: "endpoint"},
            {type: "input", label: "Timeout (s)", id: "timeout", attrs: 'type="number" min="7" max="300"'},
            {type: "input", label: "Concurrent Reqs", id: "concurrentReqs", attrs: 'type="number" min="1" max="1024"'},
        ],
    },
};

const buildProviderConfigKeywords = (): string[] => {
    const accountServer = getCloudURL("");
    return [
        // 官方云（provider === 0）
        window.siyuan.languages.syncOfficialProviderIntro,
        window.siyuan.languages._kernel[29].replaceAll("${accountServer}", accountServer),
        window.siyuan.languages._kernel[295],
        window.siyuan.languages.cloudIntro1,
        window.siyuan.languages.cloudIntro2,
        window.siyuan.languages.cloudIntro3,
        window.siyuan.languages.cloudIntro4,
        window.siyuan.languages.cloudIntro5,
        window.siyuan.languages.cloudIntro6,
        window.siyuan.languages.cloudIntro7,
        window.siyuan.languages.cloudIntro8,
        window.siyuan.languages.cloudIntro9,
        window.siyuan.languages.cloudIntro10,
        window.siyuan.languages.cloudIntro11,
        // 未订阅 / 本地等提示
        window.siyuan.languages._kernel[214].replaceAll("${accountServer}", accountServer),
        window.siyuan.languages.mobileNotSupport,
        // S3 / WebDAV / 本地第三方
        window.siyuan.languages.syncThirdPartyProviderS3Intro,
        window.siyuan.languages.syncThirdPartyProviderWebDAVIntro,
        window.siyuan.languages.syncThirdPartyProviderLocalIntro,
        window.siyuan.languages.proFeature,
        window.siyuan.languages.syncThirdPartyProviderTip,
        // 操作按钮
        window.siyuan.languages.cloudStoragePurge,
        window.siyuan.languages.import,
        window.siyuan.languages.export,
        // 表单标签与选项（硬编码英文）
        "Endpoint",
        "Access Key",
        "Secret Key",
        "Bucket",
        "Region ID",
        "Timeout (s)",
        "Addressing",
        "Path-style",
        "Virtual-hosted-style",
        "TLS Verify",
        "Verify",
        "Skip",
        "Concurrent Reqs",
        "Username",
        "Password",
    ];
};

const renderProviderConfig = (root: Element) => {
    const providerConfigElement = root.querySelector("#syncProviderConfig");
    if (!providerConfigElement) {
        return;
    }

    const def = SYNC_PROVIDER_DEFS[window.siyuan.config.sync.provider];
    let html = "";
    if (def) {
        if (!def.isProviderConfigAllowed()) {
            html = def.genUnpaidIntro();
        } else if (isThirdPartySyncProviderDef(def)) {
            html = `${def.genIntro()}${def.fields.map(renderProviderField).join("")}${genProviderActionButtons(def.configKey)}`;
        } else {
            html = def.genIntro();
        }
    }

    providerConfigElement.innerHTML = html;
    bindProviderConfigEvent(providerConfigElement, root);
};

const renderProviderField = (field: SyncProviderFieldDef): string => {
    switch (field.type) {
        case "input":
            return genProviderFlexInput(field.label, field.id, field.attrs);
        case "password":
            return genProviderFlexPassword(field.label, field.id);
        case "select":
            return genProviderFlexSelect(field.label, field.id, field.options.map((option) => `
    <option value="${option.value}">${option.label}</option>`).join(""));
    }
};

const genProviderFlexInput = (label: string, id: string, attrs = "") => `<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">${label}</div>
    <div class="fn__space"></div>
    <input id="${id}" class="b3-text-field fn__block"${attrs ? ` ${attrs}` : ""}>
</div>`;

const genProviderFlexPassword = (label: string, id: string) => `<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">${label}</div>
    <div class="fn__space"></div>
    <div class="b3-form__icona fn__block">
        <input id="${id}" type="password" class="b3-text-field b3-form__icona-input">
        <svg class="b3-form__icona-icon" data-action="togglePassword"><use xlink:href="#iconEye"></use></svg>
    </div>
</div>`;

const genProviderFlexSelect = (label: string, id: string, optionsHtml: string) => `<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">${label}</div>
    <div class="fn__space"></div>
    <select class="b3-select fn__block" id="${id}">
        ${optionsHtml}
    </select>
</div>`;

const genProviderActionButtons = (dataType: SyncProviderConfigKey) => {
    const importExportHtml = dataType === "s3" || dataType === "webdav" ? `<div class="fn__space"></div>
    <button class="b3-button b3-button--outline fn__size200" style="position: relative">
        <input id="importSyncConfig" class="b3-form__upload" type="file" data-type="${dataType}">
        <svg><use xlink:href="#iconDownload"></use></svg>${window.siyuan.languages.import}
    </button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--outline fn__size200" id="exportSyncConfig" data-type="${dataType}">
        <svg><use xlink:href="#iconUpload"></use></svg>${window.siyuan.languages.export}
    </button>` : "";
    return `<div class="b3-label b3-label--inner fn__flex fn__flex-wrap">
    <div class="fn__flex-1"></div>
    <button class="b3-button b3-button--outline fn__size200" id="purgeCloudData">
        <svg><use xlink:href="#iconTrashcan"></use></svg>${window.siyuan.languages.cloudStoragePurge}
    </button>${importExportHtml}
</div>`;
};

const syncProviderConfigBoundElements = new WeakSet<Element>();

const bindProviderConfigEvent = (configElement: Element, root: Element) => {
    const togglePasswordIcon = configElement.querySelector('[data-action="togglePassword"]');
    togglePasswordIcon?.addEventListener("click", () => {
        const useElement = togglePasswordIcon.firstElementChild;
        const isEye = useElement.getAttribute("xlink:href") === "#iconEye";
        useElement.setAttribute("xlink:href", isEye ? "#iconEyeoff" : "#iconEye");
        (togglePasswordIcon.previousElementSibling as HTMLInputElement).setAttribute("type", isEye ? "text" : "password");
    });

    const importElement = configElement.querySelector("#importSyncConfig") as HTMLInputElement;
    importElement?.addEventListener("change", () => {
        const formData = new FormData();
        formData.append("file", importElement.files[0]);
        const isS3 = importElement.getAttribute("data-type") === "s3";
        fetchPost(isS3 ? "/api/sync/importSyncProviderS3" : "/api/sync/importSyncProviderWebDAV", formData, (response) => {
            if (isS3) {
                window.siyuan.config.sync.s3 = response.data.s3;
            } else {
                window.siyuan.config.sync.webdav = response.data.webdav;
            }
            renderProviderConfig(root);
            showMessage(window.siyuan.languages.imported);
        });
    });

    const exportButton = configElement.querySelector("#exportSyncConfig");
    exportButton?.addEventListener("click", () => {
        fetchPost(exportButton.getAttribute("data-type") === "s3" ? "/api/sync/exportSyncProviderS3" : "/api/sync/exportSyncProviderWebDAV", {}, (response) => {
            saveExportFile(response.data.zip);
        });
    });

    configElement.querySelector("#purgeCloudData")?.addEventListener("click", () => {
        confirmDialog("♻️ " + window.siyuan.languages.cloudStoragePurge, `<div class="b3-typography">${window.siyuan.languages.cloudStoragePurgeConfirm}</div>`, () => {
            fetchPost("/api/repo/purgeCloudRepo");
        });
    });

    const provider = window.siyuan.config.sync.provider;
    const def = SYNC_PROVIDER_DEFS[provider];
    if (!isThirdPartySyncProviderDef(def) || !def.isProviderConfigAllowed()) {
        return;
    }
    fillSyncProviderConfigValues(configElement);
    if (syncProviderConfigBoundElements.has(configElement)) {
        return;
    }
    syncProviderConfigBoundElements.add(configElement);
    configElement.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLElement;
        if (!target.matches(".b3-text-field, .b3-select")) {
            return;
        }
        saveSyncProviderConfigValues(configElement);
    });
};

const saveSyncProviderConfigValues = (configElement: Element) => {
    const provider = window.siyuan.config.sync.provider;
    const def = SYNC_PROVIDER_DEFS[provider];
    if (!isThirdPartySyncProviderDef(def)) {
        return;
    }
    const data = readProviderConfigFields(configElement, def.getConfig());
    const configKey = def.configKey;
    // 使用 fetchSyncPost：内核返回 code < 0 时 fetchPost 不会调用回调，此处需始终回写界面与已保存配置一致
    fetchSyncPost(def.api, {[configKey]: data})
        .then((response) => {
            if (response.code === 0 && response.data?.[configKey]) {
                window.siyuan.config.sync[configKey] = response.data[configKey];
            }
        })
        .finally(() => {
            fillSyncProviderConfigValues(configElement);
        })
        .catch(() => {});
};

const fillSyncProviderConfigValues = (configElement: Element) => {
    const provider = window.siyuan.config.sync.provider;
    const def = SYNC_PROVIDER_DEFS[provider];
    if (!isThirdPartySyncProviderDef(def)) {
        return;
    }
    const data = def.getConfig();
    (Object.keys(data) as (keyof typeof data & string)[]).forEach((key) => {
        const el = configElement.querySelector(`#${key}`) as HTMLInputElement | HTMLSelectElement | null;
        if (el) {
            el.value = String(data[key]);
        }
    });
};

const readProviderConfigFields = <T extends object>(configElement: Element, template: T): T => {
    const result = {} as Record<string, unknown>;
    (Object.keys(template) as (keyof T & string)[]).forEach((key) => {
        const el = configElement.querySelector(`#${key}`) as HTMLInputElement | HTMLSelectElement | null;
        if (!el) {
            return;
        }
        const sample = template[key];
        if (typeof sample === "boolean") {
            result[key] = el.value === "true";
        } else if (typeof sample === "number") {
            result[key] = parseInt(el.value, 10);
        } else {
            result[key] = el.value;
        }
    });
    return result as T;
};

const renderCloudSpace = (root: Element) => {
    const cloudSpaceElement = root?.querySelector("#cloudSpace");
    if (!cloudSpaceElement) {
        return;
    }

    const isProviderOfficial = window.siyuan.config.sync.provider === 0;
    const subscribed = !needSubscribe("");
    const hidden = cloudSpaceElement.classList.toggle("fn__none", !isProviderOfficial || !subscribed);
    if (!hidden) {
        cloudSpaceElement.innerHTML = buildCloudSpaceHtml(
            Object.fromEntries(CLOUD_SPACE_DISPLAY_KEYS.map((key) => [key, "0B"])) as CloudSpaceDisplayData,
            true
        );
        fetchSyncPost("/api/cloud/getCloudSpace").then((response) => {
            if (response.code === 1) {
                cloudSpaceElement.innerHTML = `<span class="ft__error">${response.msg}</span>`;
                return;
            }
            if (response.code !== 0 || !response.data) {
                return;
            }
            cloudSpaceElement.innerHTML = buildCloudSpaceHtml({
                syncSize: response.data.sync.hSize,
                backupSize: response.data.backup.hSize,
                hAssetSize: response.data.hAssetSize,
                hSize: response.data.hSize,
                hTotalSize: response.data.hTotalSize,
                hExchangeSize: response.data.hExchangeSize,
                hTrafficUploadSize: response.data.hTrafficUploadSize,
                hTrafficDownloadSize: response.data.hTrafficDownloadSize,
                hTrafficAPIGet: response.data.hTrafficAPIGet,
                hTrafficAPIPut: response.data.hTrafficAPIPut,
            }, false);
        }).catch(() => {});
    }
};

const CLOUD_SPACE_DISPLAY_KEYS = [
    "syncSize",
    "backupSize",
    "hAssetSize",
    "hSize",
    "hTotalSize",
    "hExchangeSize",
    "hTrafficUploadSize",
    "hTrafficDownloadSize",
    "hTrafficAPIGet",
    "hTrafficAPIPut",
] as const;

type CloudSpaceDisplayData = Record<(typeof CLOUD_SPACE_DISPLAY_KEYS)[number], string>;

const buildCloudSpaceHtml = (data: CloudSpaceDisplayData, loading: boolean) =>
    `<div class="fn__flex config-cloud-space${loading ? " config-cloud-space--loading" : ""}">
    <div class="config-cloud-space__body">
        ${window.siyuan.languages.cloudStorage}
        <div class="config-cloud-space__placeholder">
        <div class="fn__hr"></div>
        <ul class="b3-list">
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.sync}<span class="b3-list-item__meta">${data.syncSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.backup}<span class="b3-list-item__meta">${data.backupSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;"><a href="${getCloudURL("settings/file?type=3")}" target="_blank">${window.siyuan.languages.cdn}</a><span class="b3-list-item__meta">${data.hAssetSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.total}<span class="b3-list-item__meta">${data.hSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.sizeLimit}<span class="b3-list-item__meta">${data.hTotalSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;"><a href="${getCloudURL("settings/point")}" target="_blank">${window.siyuan.languages.pointExchangeSize}</a><span class="b3-list-item__meta">${data.hExchangeSize}</span></li>
        </ul>
        </div>
    </div>
    <div class="config-cloud-space__body">
        ${window.siyuan.languages.trafficStat}
        <div class="config-cloud-space__placeholder">
        <div class="fn__hr"></div>
        <ul class="b3-list">
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.upload}<span class="fn__space"></span><span class="ft__on-surface">${data.hTrafficUploadSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.download}<span class="fn__space"></span><span class="ft__on-surface">${data.hTrafficDownloadSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">API GET<span class="fn__space"></span><span class="ft__on-surface">${data.hTrafficAPIGet}</span></li>
            <li class="b3-list-item" style="cursor: auto;">API PUT<span class="fn__space"></span><span class="ft__on-surface">${data.hTrafficAPIPut}</span></li>
        </ul>
        </div>
    </div>
    ${loading ? `<div class="fn__loading"><img width="64px" src="/stage/loading-pure.svg"></div>` : ""}
</div>`;
