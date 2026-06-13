import type {SettingTabBuilder} from "../setting/builder";
import {controlBoolean, controlString} from "../setting/control";
import {bindPasswordIconaToggle, genSwitchRow} from "../render/fragments";
import {aiConfigApi} from "./aiRuntime";
import {
    EMBEDDING_API_BASE_URL_ID,
    EMBEDDING_API_KEY_ID,
    EMBEDDING_API_MODEL_ID,
    EMBEDDING_ENABLED_ID,
    genChatProvidersBlockHtml,
    genEmbeddingProviderHtml,
    genMcpServersBlockHtml,
    getEmbeddingProvider,
    mountChatProvidersBlock,
    mountMcpServersBlock,
    upsertEmbeddingProvider,
} from "./aiUi";

const registerAiServiceGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("service", window.siyuan.languages.configGroupServiceConnection);

    const openAIEnabledControl = controlBoolean("ai.openAI.enabled", {
        readConfig: () => window.siyuan.config.ai.openAI?.enabled !== false,
    });
    group.composite({
        key: "openAIEnabled",
        keywords: ["启用主模型", "openAI", "enabled"],
        html: () => genSwitchRow(
            openAIEnabledControl.id,
            "启用主模型",
            "关闭后 ChatGPT 与 Agent 将不再使用下方主模型配置（仍可使用其他提供商）。",
            openAIEnabledControl.readConfig() as boolean,
        ),
        controls: [{
            control: openAIEnabledControl,
            save: (value) => aiConfigApi.patch("openAI.enabled", value),
        }],
    });
    group.select("ai.openAI.apiProvider", {
        title: window.siyuan.languages.apiProvider,
        desc: window.siyuan.languages.apiProviderTip,
        options: [
            {value: "OpenAI"},
            {value: "Azure"},
        ],
        afterMount: bindApiProviderToggle,
    });
    group.textBlock("ai.openAI.apiBaseURL", {
        title: window.siyuan.languages.apiBaseURL,
        desc: window.siyuan.languages.apiBaseURLTip,
        mode: "input-text",
    });
    group.textBlock("ai.openAI.apiKey", {
        title: window.siyuan.languages.apiKey,
        desc: window.siyuan.languages.apiKeyTip,
        mode: "input-password",
    });
    group.textBlock("ai.openAI.apiVersion", {
        title: window.siyuan.languages.apiVersion,
        desc: window.siyuan.languages.apiVersionTip,
        mode: "input-text",
    });
    group.textBlock("ai.openAI.apiProxy", {
        title: window.siyuan.languages.apiProxy,
        desc: window.siyuan.languages.apiProxyTip,
        mode: "input-text",
    });
    group.textBlock("ai.openAI.apiUserAgent", {
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

const registerAiModelGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("model", window.siyuan.languages.configGroupModelParameters);

    group.textBlock("ai.openAI.apiModel", {
        title: window.siyuan.languages.apiModel,
        desc: window.siyuan.languages.apiModelTip,
        mode: "input-text",
    });
    group.number("ai.openAI.apiTimeout", {
        title: window.siyuan.languages.apiTimeout,
        desc: window.siyuan.languages.apiTimeoutTip,
        min: 5,
        max: 600,
        unit: "s",
    });
    group.number("ai.openAI.apiMaxTokens", {
        title: window.siyuan.languages.apiMaxTokens,
        desc: window.siyuan.languages.apiMaxTokensTip,
        min: 0,
    });
    group.number("ai.openAI.apiMaxContexts", {
        title: window.siyuan.languages.apiMaxContexts,
        desc: window.siyuan.languages.apiMaxContextsTip,
        min: 1,
        max: 64,
    });
    group.number("ai.openAI.apiTemperature", {
        title: window.siyuan.languages.apiTemperature,
        desc: window.siyuan.languages.apiTemperatureTip,
        min: 0,
        max: 2,
        step: "0.1",
    });
    group.number("ai.openAI.agentTimeout", {
        title: window.siyuan.languages.agentTimeout,
        desc: window.siyuan.languages.agentTimeoutTip,
        min: 0,
        unit: "s",
    });
    group.number("ai.openAI.agentConfirmTimeout", {
        title: window.siyuan.languages.agentConfirmTimeout,
        desc: window.siyuan.languages.agentConfirmTimeoutTip,
        min: 10,
        max: 600,
        unit: "s",
    });
    group.number("ai.openAI.agentMaxRetries", {
        title: window.siyuan.languages.agentMaxRetries,
        desc: window.siyuan.languages.agentMaxRetriesTip,
        min: 0,
        max: 10,
    });
};

const registerAiProvidersGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("providers", "额外模型");

    group.slot({
        key: "chatProviders",
        keywords: [
            "providers",
            "模型提供商",
            "Agent",
            "apiKey",
            "apiModel",
            "Azure",
            "OpenAI",
        ],
        html: genChatProvidersBlockHtml,
        afterMount: mountChatProvidersBlock,
    });
};

const registerAiEmbeddingGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("embedding", "语义搜索");

    const enabledControl = controlBoolean(EMBEDDING_ENABLED_ID, {
        readConfig: () => getEmbeddingProvider()?.enabled !== false,
    });
    const apiKeyControl = controlString(EMBEDDING_API_KEY_ID, {
        readConfig: () => getEmbeddingProvider()?.apiKey ?? "",
    });
    const apiBaseURLControl = controlString(EMBEDDING_API_BASE_URL_ID, {
        readConfig: () => getEmbeddingProvider()?.apiBaseURL ?? "https://api.openai.com/v1",
    });
    const apiModelControl = controlString(EMBEDDING_API_MODEL_ID, {
        readConfig: () => getEmbeddingProvider()?.apiModel ?? "text-embedding-3-small",
    });

    group.composite({
        key: "embeddingProvider",
        keywords: [
            "语义搜索",
            "Embedding",
            "向量",
            "embedding",
            "apiKey",
            "apiBaseURL",
            "apiModel",
        ],
        html: () => genEmbeddingProviderHtml(
            EMBEDDING_ENABLED_ID,
            EMBEDDING_API_KEY_ID,
            EMBEDDING_API_BASE_URL_ID,
            EMBEDDING_API_MODEL_ID,
            () => enabledControl.readConfig() as boolean,
            () => apiKeyControl.readConfig() as string,
            () => apiBaseURLControl.readConfig() as string,
            () => apiModelControl.readConfig() as string,
        ),
        afterMount: (root) => {
            bindPasswordIconaToggle(root, EMBEDDING_API_KEY_ID);
        },
        controls: [
            {
                control: enabledControl,
                save: (value) => upsertEmbeddingProvider({enabled: value as boolean}),
            },
            {
                control: apiKeyControl,
                save: (value) => upsertEmbeddingProvider({apiKey: value as string}),
            },
            {
                control: apiBaseURLControl,
                save: (value) => upsertEmbeddingProvider({apiBaseURL: value as string}),
            },
            {
                control: apiModelControl,
                save: (value) => upsertEmbeddingProvider({apiModel: value as string}),
            },
        ],
    });
};

const registerAiMcpGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("mcp", "MCP");

    group.slot({
        key: "mcpServers",
        keywords: [
            "MCP",
            "Model Context Protocol",
            "stdio",
            "http",
            "工具",
        ],
        html: genMcpServersBlockHtml,
        afterMount: mountMcpServersBlock,
    });
};

export const registerAiTab = (tab: SettingTabBuilder) => {
    registerAiServiceGroup(tab);
    registerAiModelGroup(tab);
    registerAiProvidersGroup(tab);
    registerAiEmbeddingGroup(tab);
    registerAiMcpGroup(tab);
};
