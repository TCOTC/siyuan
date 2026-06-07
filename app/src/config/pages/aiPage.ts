import type {PageBuilder} from "../registry/pageBuilder";

export const registerAiServiceSection = (p: PageBuilder) => {
    const s = p.section("service", window.siyuan.languages.configGroupServiceConnection);

    s.select("openAI.apiProvider", {
        title: window.siyuan.languages.apiProvider,
        desc: window.siyuan.languages.apiProviderTip,
        options: [
            {value: "OpenAI"},
            {value: "Azure"},
        ],
        value: window.siyuan.config.ai.openAI.apiProvider,
        afterMount: bindApiProviderToggle,
    });
    s.textBlock("openAI.apiBaseURL", {
        title: window.siyuan.languages.apiBaseURL,
        desc: window.siyuan.languages.apiBaseURLTip,
        mode: "input-text",
        value: window.siyuan.config.ai.openAI.apiBaseURL,
    });
    s.textBlock("openAI.apiKey", {
        title: window.siyuan.languages.apiKey,
        desc: window.siyuan.languages.apiKeyTip,
        mode: "input-password",
        value: window.siyuan.config.ai.openAI.apiKey,
    });
    s.textBlock("openAI.apiVersion", {
        title: window.siyuan.languages.apiVersion,
        desc: window.siyuan.languages.apiVersionTip,
        mode: "input-text",
        value: window.siyuan.config.ai.openAI.apiVersion,
    });
    s.textBlock("openAI.apiProxy", {
        title: window.siyuan.languages.apiProxy,
        desc: window.siyuan.languages.apiProxyTip,
        mode: "input-text",
        value: window.siyuan.config.ai.openAI.apiProxy,
    });
    s.textBlock("openAI.apiUserAgent", {
        title: "User-Agent",
        desc: window.siyuan.languages.apiUserAgentTip,
        mode: "input-text",
        value: window.siyuan.config.ai.openAI.apiUserAgent,
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

export const registerAiModelSection = (p: PageBuilder) => {
    const s = p.section("model", window.siyuan.languages.configGroupModelParameters);

    s.textBlock("openAI.apiModel", {
        title: window.siyuan.languages.apiModel,
        desc: window.siyuan.languages.apiModelTip,
        mode: "input-text",
        value: window.siyuan.config.ai.openAI.apiModel,
    });
    s.number("openAI.apiTimeout", {
        title: window.siyuan.languages.apiTimeout,
        desc: window.siyuan.languages.apiTimeoutTip,
        min: 5,
        max: 600,
        unit: "s",
    });
    s.number("openAI.apiMaxTokens", {
        title: window.siyuan.languages.apiMaxTokens,
        desc: window.siyuan.languages.apiMaxTokensTip,
        min: 0,
    });
    s.number("openAI.apiMaxContexts", {
        title: window.siyuan.languages.apiMaxContexts,
        desc: window.siyuan.languages.apiMaxContextsTip,
        min: 1,
        max: 64,
    });
    s.number("openAI.apiTemperature", {
        title: window.siyuan.languages.apiTemperature,
        desc: window.siyuan.languages.apiTemperatureTip,
        min: 0,
        max: 2,
        step: "0.1",
    });
    s.number("openAI.agentTimeout", {
        title: window.siyuan.languages.agentTimeout,
        desc: window.siyuan.languages.agentTimeoutTip,
        min: 0,
        unit: "s",
    });
    s.number("openAI.agentConfirmTimeout", {
        title: window.siyuan.languages.agentConfirmTimeout,
        desc: window.siyuan.languages.agentConfirmTimeoutTip,
        min: 10,
        max: 600,
        unit: "s",
    });
    s.number("openAI.agentMaxRetries", {
        title: window.siyuan.languages.agentMaxRetries,
        desc: window.siyuan.languages.agentMaxRetriesTip,
        min: 0,
        max: 10,
    });
};
