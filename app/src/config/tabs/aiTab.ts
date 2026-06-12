import type {SettingTabBuilder} from "../setting/builder";

export const registerAiServiceGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("service", window.siyuan.languages.configGroupServiceConnection);

    group.select("openAI.apiProvider", {
        title: window.siyuan.languages.apiProvider,
        desc: window.siyuan.languages.apiProviderTip,
        options: [
            {value: "OpenAI"},
            {value: "Azure"},
        ],
        afterMount: bindApiProviderToggle,
    });
    group.textBlock("openAI.apiBaseURL", {
        title: window.siyuan.languages.apiBaseURL,
        desc: window.siyuan.languages.apiBaseURLTip,
        mode: "input-text",
    });
    group.textBlock("openAI.apiKey", {
        title: window.siyuan.languages.apiKey,
        desc: window.siyuan.languages.apiKeyTip,
        mode: "input-password",
    });
    group.textBlock("openAI.apiVersion", {
        title: window.siyuan.languages.apiVersion,
        desc: window.siyuan.languages.apiVersionTip,
        mode: "input-text",
    });
    group.textBlock("openAI.apiProxy", {
        title: window.siyuan.languages.apiProxy,
        desc: window.siyuan.languages.apiProxyTip,
        mode: "input-text",
    });
    group.textBlock("openAI.apiUserAgent", {
        title: "User-Agent",
        desc: window.siyuan.languages.apiUserAgentTip,
        mode: "input-text",
    });
};

const bindApiProviderToggle = (root: HTMLElement) => {
    const providerSelect = root.querySelector<HTMLSelectElement>(`#${CSS.escape("ai.openAI.apiProvider")}`);
    if (!providerSelect) {
        return;
    }
    const toggleVersionWrap = () => {
        root.querySelector(`#${CSS.escape("ai.openAI.apiVersion")}`)?.closest(".config-item")?.classList.toggle("fn__none", providerSelect.value !== "Azure");
    };
    providerSelect.addEventListener("change", toggleVersionWrap);
    toggleVersionWrap();
};

export const registerAiModelGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("model", window.siyuan.languages.configGroupModelParameters);

    group.textBlock("openAI.apiModel", {
        title: window.siyuan.languages.apiModel,
        desc: window.siyuan.languages.apiModelTip,
        mode: "input-text",
    });
    group.number("openAI.apiTimeout", {
        title: window.siyuan.languages.apiTimeout,
        desc: window.siyuan.languages.apiTimeoutTip,
        min: 5,
        max: 600,
        unit: "s",
    });
    group.number("openAI.apiMaxTokens", {
        title: window.siyuan.languages.apiMaxTokens,
        desc: window.siyuan.languages.apiMaxTokensTip,
        min: 0,
    });
    group.number("openAI.apiMaxContexts", {
        title: window.siyuan.languages.apiMaxContexts,
        desc: window.siyuan.languages.apiMaxContextsTip,
        min: 1,
        max: 64,
    });
    group.number("openAI.apiTemperature", {
        title: window.siyuan.languages.apiTemperature,
        desc: window.siyuan.languages.apiTemperatureTip,
        min: 0,
        max: 2,
        step: "0.1",
    });
    group.number("openAI.agentTimeout", {
        title: window.siyuan.languages.agentTimeout,
        desc: window.siyuan.languages.agentTimeoutTip,
        min: 0,
        unit: "s",
    });
    group.number("openAI.agentConfirmTimeout", {
        title: window.siyuan.languages.agentConfirmTimeout,
        desc: window.siyuan.languages.agentConfirmTimeoutTip,
        min: 10,
        max: 600,
        unit: "s",
    });
    group.number("openAI.agentMaxRetries", {
        title: window.siyuan.languages.agentMaxRetries,
        desc: window.siyuan.languages.agentMaxRetriesTip,
        min: 0,
        max: 10,
    });
};

export const registerAiTab = (tab: SettingTabBuilder) => {
    registerAiServiceGroup(tab);
    registerAiModelGroup(tab);
};
