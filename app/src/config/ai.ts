import {fetchPost} from "../util/fetch";
import {
    type SettingSection,
    textBlockRow,
    numberRow,
    selectRow,
    findSettingRowByControlId,
} from "./ui/settingRows";
import {filterSettingSections} from "./ui/search";
import {genSettingTabHtmlFromSections} from "./ui/render";
import {readDomValue} from "./ui/formValue";
import {mergeRecordByDottedPath} from "./ui/dotPath";
import {mountSettingSaveHandlers} from "./ui/save";

export const aiSettings = {
    mount: async (root: HTMLElement, searchQuery?: string) => {
        const sections = filterSettingSections(buildAiSections(), searchQuery);
        root.innerHTML = genSettingTabHtmlFromSections(sections);
        await mountSettingSaveHandlers(root, sections);
    },

    set(el: HTMLElement, controlId: string) {
        if (!controlId.startsWith("ai.")) {
            return;
        }
        const row = findSettingRowByControlId(buildAiSections(), controlId);
        const value = readDomValue(el, row);
        if (value !== undefined) {
            aiSettings.send(controlId, value);
        }
    },

    send(controlId: string, value: unknown) {
        if (!controlId.startsWith("ai.")) {
            return;
        }
        const rel = controlId.slice("ai.".length);
        if (!rel) {
            return;
        }
        const prev = window.siyuan.config.ai as unknown as Record<string, unknown>;
        const payload = mergeRecordByDottedPath(prev, rel, value) as unknown as Config.IAI;
        fetchPost("/api/setting/setAI", payload, (response) => {
            // 当前修改 AI 设置之后内核不推送到所有前端实例，需要手动 apply
            aiSettings.apply(response.data);
        });
    },

    apply(data: Config.IAI) {
        window.siyuan.config.ai = data;
    },
};

/** 每次调用时重新构造。全量列表供 `filterSettingSections(..., searchQuery)` 使用。 */
export function buildAiSections(): SettingSection[] {
    return [
        {
            title: window.siyuan.languages.configGroupServiceConnection,
            items: [
                selectRow({
                    id: "ai.openAI.apiProvider",
                    title: window.siyuan.languages.apiProvider,
                    desc: window.siyuan.languages.apiProviderTip,
                    options: [
                        {value: "OpenAI"},
                        {value: "Azure"},
                    ],
                    value: window.siyuan.config.ai.openAI.apiProvider,
                    bind: async (root) => {
                        const providerSelect = root.querySelector<HTMLSelectElement>(`#${CSS.escape("ai.openAI.apiProvider")}`);
                        if (!providerSelect) {
                            return;
                        }
                        const toggleVersionWrap = () => {
                            root.querySelector(`#${CSS.escape("ai.openAI.apiVersion")}`)?.closest(".config-item")?.classList.toggle("fn__none", providerSelect.value !== "Azure");
                        };
                        providerSelect.addEventListener("change", toggleVersionWrap);
                        toggleVersionWrap();
                    },
                }),
                textBlockRow({
                    id: "ai.openAI.apiBaseURL",
                    title: window.siyuan.languages.apiBaseURL,
                    desc: window.siyuan.languages.apiBaseURLTip,
                    mode: "input-text",
                    value: window.siyuan.config.ai.openAI.apiBaseURL,
                }),
                textBlockRow({
                    id: "ai.openAI.apiKey",
                    title: window.siyuan.languages.apiKey,
                    desc: window.siyuan.languages.apiKeyTip,
                    mode: "input-password",
                    value: window.siyuan.config.ai.openAI.apiKey,
                }),
                textBlockRow({
                    id: "ai.openAI.apiVersion",
                    title: window.siyuan.languages.apiVersion,
                    desc: window.siyuan.languages.apiVersionTip,
                    mode: "input-text",
                    value: window.siyuan.config.ai.openAI.apiVersion,
                }),
                textBlockRow({
                    id: "ai.openAI.apiProxy",
                    title: window.siyuan.languages.apiProxy,
                    desc: window.siyuan.languages.apiProxyTip,
                    mode: "input-text",
                    value: window.siyuan.config.ai.openAI.apiProxy,
                }),
                textBlockRow({
                    id: "ai.openAI.apiUserAgent",
                    title: "User-Agent",
                    desc: window.siyuan.languages.apiUserAgentTip,
                    mode: "input-text",
                    value: window.siyuan.config.ai.openAI.apiUserAgent,
                }),
            ],
        },
        {
            title: window.siyuan.languages.configGroupModelParameters,
            items: [
                textBlockRow({
                    id: "ai.openAI.apiModel",
                    title: window.siyuan.languages.apiModel,
                    desc: window.siyuan.languages.apiModelTip,
                    mode: "input-text",
                    value: window.siyuan.config.ai.openAI.apiModel,
                }),
                numberRow({
                    id: "ai.openAI.apiTimeout",
                    title: window.siyuan.languages.apiTimeout,
                    desc: window.siyuan.languages.apiTimeoutTip,
                    min: 5,
                    max: 600,
                    unit: "s",
                }),
                numberRow({
                    id: "ai.openAI.apiMaxTokens",
                    title: window.siyuan.languages.apiMaxTokens,
                    desc: window.siyuan.languages.apiMaxTokensTip,
                    min: 0,
                }),
                numberRow({
                    id: "ai.openAI.apiMaxContexts",
                    title: window.siyuan.languages.apiMaxContexts,
                    desc: window.siyuan.languages.apiMaxContextsTip,
                    min: 1,
                    max: 64,
                }),
                numberRow({
                    id: "ai.openAI.apiTemperature",
                    title: window.siyuan.languages.apiTemperature,
                    desc: window.siyuan.languages.apiTemperatureTip,
                    min: 0,
                    max: 2,
                    step: "0.1",
                }),
            ],
        },
    ];
}
