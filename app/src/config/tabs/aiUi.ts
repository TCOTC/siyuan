import {genConfigItemMainHtml, genListSwitchItemHtml, bindPasswordIconaToggle} from "../render/fragments";
import {genButtonHtml, genNumberInputHtml} from "../render/render";
import {aiConfigApi} from "./aiRuntime";

const EMBEDDING_CONTROL_PREFIX = "ai.__embedding.";
const MCP_LIST_ID = "aiMcpServerList";
const CHAT_PROVIDERS_LIST_ID = "aiChatProviderList";

const isEmbeddingProvider = (provider: Config.IOpenAI) => provider.type === "embedding";

const getProviders = (): Config.IOpenAI[] =>
    (window.siyuan.config.ai.providers ?? []).map((p) => ({...p}));

export const getChatProviders = (): Config.IOpenAI[] =>
    getProviders().filter((p) => !isEmbeddingProvider(p));

const saveProviders = (providers: Config.IOpenAI[]) => {
    aiConfigApi.patch("providers", providers);
};

const mergeProvidersWithEmbedding = (chatProviders: Config.IOpenAI[]) => {
    const providers = chatProviders.map((p) => ({...p}));
    const embedding = getEmbeddingProvider();
    if (embedding) {
        providers.push({...embedding, type: "embedding"});
    }
    return providers;
};

const defaultEmbeddingProvider = (): Config.IOpenAI => ({
    apiKey: "",
    apiBaseURL: "https://api.openai.com/v1",
    apiModel: "text-embedding-3-small",
    apiProvider: "OpenAI",
    apiProxy: "",
    apiUserAgent: window.siyuan.config.ai.openAI?.apiUserAgent ?? "",
    apiVersion: "",
    apiMaxContexts: 7,
    apiMaxTokens: 0,
    apiTemperature: 1,
    apiTimeout: 30,
    agentTimeout: 600,
    agentConfirmTimeout: 120,
    agentMaxRetries: 3,
    type: "embedding",
    enabled: true,
});

export const getEmbeddingProvider = (): Config.IOpenAI | undefined =>
    getProviders().find((p) => isEmbeddingProvider(p));

export const upsertEmbeddingProvider = (patch: Partial<Config.IOpenAI>) => {
    const current = getEmbeddingProvider() ?? defaultEmbeddingProvider();
    const next: Config.IOpenAI = {...current, ...patch, type: "embedding"};
    saveProviders([...getChatProviders(), next]);
};

const createMcpServer = (): Config.IMCPServer => ({
    name: "",
    enabled: true,
    type: "stdio",
    command: "",
    args: [],
    url: "",
    headers: {},
    timeout: 30,
});

const getMcpServers = (): Config.IMCPServer[] => {
    const servers = window.siyuan.config.ai.mcp?.servers;
    return servers ? servers.map((s) => ({...s})) : [];
};

const saveMcpServers = (servers: Config.IMCPServer[]) => {
    aiConfigApi.patch("mcp", {servers});
};

const formatMcpArgs = (args: string[]): string => args.join(", ");

const parseMcpArgs = (raw: string): string[] =>
    raw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

const formatMcpHeaders = (headers: Record<string, string>): string => {
    if (!headers || Object.keys(headers).length === 0) {
        return "";
    }
    try {
        return JSON.stringify(headers, null, 2);
    } catch {
        return "";
    }
};

const parseMcpHeaders = (raw: string, fallback: Record<string, string>): Record<string, string> => {
    const trimmed = raw.trim();
    if (!trimmed) {
        return {};
    }
    try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            return parsed as Record<string, string>;
        }
    } catch {
        // 保留原值
    }
    return fallback;
};

const fieldId = (index: number, field: string) => `ai.__mcp.${index}.${field}`;

const genMcpServerCardHtml = (index: number, server: Config.IMCPServer): string => {
    const isStdio = server.type !== "http";
    const headersText = formatMcpHeaders(server.headers ?? {});
    return `<div class="b3-label config-item" data-mcp-index="${index}">
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml(`MCP 服务 ${index + 1}`, server.name || "未命名")}
        <span class="fn__space"></span>
        ${genButtonHtml(`removeMcpServer_${index}`, "删除", "iconTrashcan")}
    </div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml("名称", "用于日志与工具名前缀")}
        <span class="fn__space"></span>
        <input class="b3-text-field fn__flex-center fn__size200" id="${fieldId(index, "name")}" type="text" value="${Lute.EscapeHTMLStr(server.name)}"/>
    </div>
    <div class="fn__hr--small"></div>
    ${genListSwitchItemHtml(fieldId(index, "enabled"), "启用", server.enabled)}
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml("连接类型", "stdio：本地进程；http：远程 HTTP 服务")}
        <span class="fn__space"></span>
        <select class="b3-select fn__flex-center fn__size200" id="${fieldId(index, "type")}">
            <option value="stdio"${isStdio ? " selected" : ""}>stdio</option>
            <option value="http"${!isStdio ? " selected" : ""}>http</option>
        </select>
    </div>
    <div class="fn__hr--small"></div>
    <div data-mcp-stdio="${index}" class="${isStdio ? "" : "fn__none"}">
        <div class="fn__flex config-wrap">
            ${genConfigItemMainHtml("命令", "stdio 模式下的可执行文件路径")}
            <span class="fn__space"></span>
            <input class="b3-text-field fn__flex-center fn__size200" id="${fieldId(index, "command")}" type="text" value="${Lute.EscapeHTMLStr(server.command)}"/>
        </div>
        <div class="fn__hr--small"></div>
        <div class="b3-label__text">参数（逗号或换行分隔）</div>
        <div class="fn__hr--small"></div>
        <textarea class="b3-text-field fn__block" id="${fieldId(index, "args")}" rows="2">${Lute.EscapeHTMLStr(formatMcpArgs(server.args ?? []))}</textarea>
    </div>
    <div data-mcp-http="${index}" class="${isStdio ? "fn__none" : ""}">
        <div class="fn__flex config-wrap">
            ${genConfigItemMainHtml("URL", "http 模式下的服务地址")}
            <span class="fn__space"></span>
            <input class="b3-text-field fn__flex-center fn__size200" id="${fieldId(index, "url")}" type="text" value="${Lute.EscapeHTMLStr(server.url)}"/>
        </div>
        <div class="fn__hr--small"></div>
        <div class="b3-label__text">HTTP 请求头（JSON 对象，当前内核尚未应用此字段）</div>
        <div class="fn__hr--small"></div>
        <textarea class="b3-text-field fn__block" id="${fieldId(index, "headers")}" rows="3" placeholder='{"Authorization":"Bearer ..."}'>${Lute.EscapeHTMLStr(headersText)}</textarea>
    </div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml("超时", "单位：秒（当前内核使用固定 30 秒，此字段预留）")}
        <span class="fn__space"></span>
        ${genNumberInputHtml(fieldId(index, "timeout"), server.timeout ?? 30, 1, 600, undefined, "s")}
    </div>
</div>`;
};

const collectMcpServersFromDom = (root: HTMLElement): Config.IMCPServer[] => {
    const cards = root.querySelectorAll<HTMLElement>("[data-mcp-index]");
    const servers: Config.IMCPServer[] = [];
    cards.forEach((card) => {
        const index = card.getAttribute("data-mcp-index");
        if (index === null) {
            return;
        }
        const prev = getMcpServers()[parseInt(index, 10)] ?? createMcpServer();
        const typeEl = card.querySelector<HTMLSelectElement>(`#${CSS.escape(fieldId(parseInt(index, 10), "type"))}`);
        const type = typeEl?.value === "http" ? "http" : "stdio";
        servers.push({
            name: (card.querySelector<HTMLInputElement>(`#${CSS.escape(fieldId(parseInt(index, 10), "name"))}`)?.value ?? "").trim(),
            enabled: card.querySelector<HTMLInputElement>(`#${CSS.escape(fieldId(parseInt(index, 10), "enabled"))}`)?.checked ?? true,
            type,
            command: card.querySelector<HTMLInputElement>(`#${CSS.escape(fieldId(parseInt(index, 10), "command"))}`)?.value ?? "",
            args: parseMcpArgs(card.querySelector<HTMLTextAreaElement>(`#${CSS.escape(fieldId(parseInt(index, 10), "args"))}`)?.value ?? ""),
            url: card.querySelector<HTMLInputElement>(`#${CSS.escape(fieldId(parseInt(index, 10), "url"))}`)?.value ?? "",
            headers: parseMcpHeaders(
                card.querySelector<HTMLTextAreaElement>(`#${CSS.escape(fieldId(parseInt(index, 10), "headers"))}`)?.value ?? "",
                prev.headers ?? {},
            ),
            timeout: parseInt(card.querySelector<HTMLInputElement>(`#${CSS.escape(fieldId(parseInt(index, 10), "timeout"))}`)?.value ?? "30", 10) || 30,
        });
    });
    return servers;
};

const toggleMcpServerTypeFields = (card: HTMLElement) => {
    const index = card.getAttribute("data-mcp-index");
    if (index === null) {
        return;
    }
    const type = card.querySelector<HTMLSelectElement>(`#${CSS.escape(fieldId(parseInt(index, 10), "type"))}`)?.value;
    card.querySelector(`[data-mcp-stdio="${index}"]`)?.classList.toggle("fn__none", type === "http");
    card.querySelector(`[data-mcp-http="${index}"]`)?.classList.toggle("fn__none", type !== "http");
};

const renderMcpServerList = (root: HTMLElement) => {
    const listEl = root.querySelector(`#${MCP_LIST_ID}`);
    if (!listEl) {
        return;
    }
    const servers = getMcpServers();
    listEl.innerHTML = servers.length > 0
        ? servers.map((server, index) => genMcpServerCardHtml(index, server)).join("")
        : `<div class="b3-label__text ft__on-surface">尚未配置 MCP 服务。</div>`;
};

const persistMcpServersFromDom = (root: HTMLElement) => {
    const servers = collectMcpServersFromDom(root);
    window.siyuan.config.ai.mcp = {servers};
    saveMcpServers(servers);
};

export const genEmbeddingProviderHtml = (
    enabledId: string,
    apiKeyId: string,
    apiBaseURLId: string,
    apiModelId: string,
    readEnabled: () => boolean,
    readApiKey: () => string,
    readApiBaseURL: () => string,
    readApiModel: () => string,
): string => `<div class="b3-label config-item">
    ${genConfigItemMainHtml("语义搜索（Embedding）", "配置向量模型后，可在全文搜索中使用语义搜索。")}
    <div class="fn__hr--small"></div>
    ${genListSwitchItemHtml(enabledId, "启用语义搜索模型", readEnabled())}
    <div class="fn__hr--small"></div>
    <div class="b3-label__text">API Key</div>
    <div class="fn__hr--small"></div>
    <div class="b3-form__icona fn__block">
        <input id="${apiKeyId}" type="password" class="b3-text-field b3-form__icona-input" value="${Lute.EscapeHTMLStr(readApiKey())}">
        <svg class="b3-form__icona-icon" data-action="togglePassword" style="user-select: none;"><use xlink:href="#iconEye"></use></svg>
    </div>
    <div class="fn__hr--small"></div>
    <div class="b3-label__text">API Base URL</div>
    <div class="fn__hr--small"></div>
    <input class="b3-text-field fn__block" id="${apiBaseURLId}" type="text" spellcheck="false" value="${Lute.EscapeHTMLStr(readApiBaseURL())}"/>
    <div class="fn__hr--small"></div>
    <div class="b3-label__text">模型名称</div>
    <div class="fn__hr--small"></div>
    <input class="b3-text-field fn__block" id="${apiModelId}" type="text" spellcheck="false" value="${Lute.EscapeHTMLStr(readApiModel())}"/>
</div>`;

export const genMcpServersBlockHtml = (): string => `<div class="b3-label config-item" id="aiMcpServersBlock">
    ${genConfigItemMainHtml("MCP 服务", "为 AI Agent 配置 Model Context Protocol 外部工具服务。")}
    <div class="fn__hr--small"></div>
    <div id="${MCP_LIST_ID}"></div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        <div class="fn__flex-1"></div>
        ${genButtonHtml("addMcpServer", "添加 MCP 服务", "iconAdd")}
    </div>
</div>`;

export const mountMcpServersBlock = (root: HTMLElement) => {
    const block = root.querySelector("#aiMcpServersBlock");
    if (!block) {
        return;
    }
    if (!window.siyuan.config.ai.mcp) {
        window.siyuan.config.ai.mcp = {servers: []};
    }
    renderMcpServerList(root);

    block.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        const removeBtn = target.closest<HTMLButtonElement>("[id^='removeMcpServer_']");
        if (removeBtn) {
            const index = parseInt(removeBtn.id.replace("removeMcpServer_", ""), 10);
            const servers = getMcpServers();
            servers.splice(index, 1);
            window.siyuan.config.ai.mcp = {servers};
            renderMcpServerList(root);
            saveMcpServers(servers);
            return;
        }
        if (target.closest("#addMcpServer")) {
            const servers = getMcpServers();
            servers.push(createMcpServer());
            window.siyuan.config.ai.mcp = {servers};
            renderMcpServerList(root);
            saveMcpServers(servers);
        }
    });

    block.addEventListener("change", (event) => {
        const target = event.target as HTMLElement;
        const card = target.closest<HTMLElement>("[data-mcp-index]");
        if (!card) {
            return;
        }
        if (target.matches("select")) {
            toggleMcpServerTypeFields(card);
        }
        persistMcpServersFromDom(root);
    });
};

const createChatProvider = (): Config.IOpenAI => {
    const openAI = window.siyuan.config.ai.openAI;
    return {
        id: Lute.NewNodeID(),
        name: "",
        apiKey: "",
        apiBaseURL: openAI?.apiBaseURL ?? "https://api.openai.com/v1",
        apiProvider: openAI?.apiProvider ?? "OpenAI",
        apiProxy: openAI?.apiProxy ?? "",
        apiUserAgent: openAI?.apiUserAgent ?? "",
        apiVersion: openAI?.apiVersion ?? "",
        apiModel: "",
        apiTimeout: openAI?.apiTimeout ?? 30,
        apiMaxTokens: openAI?.apiMaxTokens ?? 0,
        apiTemperature: openAI?.apiTemperature ?? 1,
        apiMaxContexts: openAI?.apiMaxContexts ?? 7,
        agentTimeout: openAI?.agentTimeout ?? 600,
        agentConfirmTimeout: openAI?.agentConfirmTimeout ?? 120,
        agentMaxRetries: openAI?.agentMaxRetries ?? 3,
        enabled: true,
        type: "chat",
    };
};

const providerFieldId = (index: number, field: string) => `ai.__provider.${index}.${field}`;

const genChatProviderCardHtml = (index: number, provider: Config.IOpenAI): string => {
    const isAzure = provider.apiProvider === "Azure";
    const displayName = provider.name || provider.apiModel || "未命名";
    return `<div class="b3-label config-item" data-provider-index="${index}">
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml(`模型提供商 ${index + 1}`, displayName)}
        <span class="fn__space"></span>
        ${genButtonHtml(`removeChatProvider_${index}`, "删除", "iconTrashcan")}
    </div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml("显示名称", "在 Agent 模型列表中展示")}
        <span class="fn__space"></span>
        <input class="b3-text-field fn__flex-center fn__size200" id="${providerFieldId(index, "name")}" type="text" value="${Lute.EscapeHTMLStr(provider.name ?? "")}"/>
    </div>
    <div class="fn__hr--small"></div>
    ${genListSwitchItemHtml(providerFieldId(index, "enabled"), "启用", provider.enabled !== false)}
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml("API 提供商", "OpenAI 或 Azure")}
        <span class="fn__space"></span>
        <select class="b3-select fn__flex-center fn__size200" id="${providerFieldId(index, "apiProvider")}">
            <option value="OpenAI"${!isAzure ? " selected" : ""}>OpenAI</option>
            <option value="Azure"${isAzure ? " selected" : ""}>Azure</option>
        </select>
    </div>
    <div class="fn__hr--small"></div>
    <div class="b3-label__text">API Base URL</div>
    <div class="fn__hr--small"></div>
    <input class="b3-text-field fn__block" id="${providerFieldId(index, "apiBaseURL")}" type="text" spellcheck="false" value="${Lute.EscapeHTMLStr(provider.apiBaseURL)}"/>
    <div class="fn__hr--small"></div>
    <div class="b3-label__text">API Key</div>
    <div class="fn__hr--small"></div>
    <div class="b3-form__icona fn__block">
        <input id="${providerFieldId(index, "apiKey")}" type="password" class="b3-text-field b3-form__icona-input" value="${Lute.EscapeHTMLStr(provider.apiKey)}">
        <svg class="b3-form__icona-icon" data-action="togglePassword" style="user-select: none;"><use xlink:href="#iconEye"></use></svg>
    </div>
    <div class="fn__hr--small"></div>
    <div data-provider-version="${index}" class="${isAzure ? "" : "fn__none"}">
        <div class="b3-label__text">API Version（Azure）</div>
        <div class="fn__hr--small"></div>
        <input class="b3-text-field fn__block" id="${providerFieldId(index, "apiVersion")}" type="text" spellcheck="false" value="${Lute.EscapeHTMLStr(provider.apiVersion)}"/>
        <div class="fn__hr--small"></div>
    </div>
    <div class="b3-label__text">API 代理</div>
    <div class="fn__hr--small"></div>
    <input class="b3-text-field fn__block" id="${providerFieldId(index, "apiProxy")}" type="text" spellcheck="false" value="${Lute.EscapeHTMLStr(provider.apiProxy)}"/>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml("模型名称", "Agent 调用时使用的模型 ID")}
        <span class="fn__space"></span>
        <input class="b3-text-field fn__flex-center fn__size200" id="${providerFieldId(index, "apiModel")}" type="text" value="${Lute.EscapeHTMLStr(provider.apiModel)}"/>
    </div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml("API 超时", "单次请求超时")}
        <span class="fn__space"></span>
        ${genNumberInputHtml(providerFieldId(index, "apiTimeout"), provider.apiTimeout ?? 30, 5, 600, undefined, "s")}
    </div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml("Agent 会话超时", "0 表示不限制")}
        <span class="fn__space"></span>
        ${genNumberInputHtml(providerFieldId(index, "agentTimeout"), provider.agentTimeout ?? 600, 0, 3600, undefined, "s")}
    </div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml("Agent 确认超时", "工具调用等待确认的秒数")}
        <span class="fn__space"></span>
        ${genNumberInputHtml(providerFieldId(index, "agentConfirmTimeout"), provider.agentConfirmTimeout ?? 120, 10, 600, undefined, "s")}
    </div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        ${genConfigItemMainHtml("Agent 最大重试", "API 失败时的重试次数")}
        <span class="fn__space"></span>
        ${genNumberInputHtml(providerFieldId(index, "agentMaxRetries"), provider.agentMaxRetries ?? 3, 0, 10)}
    </div>
</div>`;
};

const readProviderField = <T extends HTMLElement>(card: HTMLElement, index: number, field: string) =>
    card.querySelector<T>(`#${CSS.escape(providerFieldId(index, field))}`);

const collectChatProvidersFromDom = (root: HTMLElement): Config.IOpenAI[] => {
    const cards = root.querySelectorAll<HTMLElement>("[data-provider-index]");
    const providers: Config.IOpenAI[] = [];
    cards.forEach((card) => {
        const indexAttr = card.getAttribute("data-provider-index");
        if (indexAttr === null) {
            return;
        }
        const index = parseInt(indexAttr, 10);
        const prev = getChatProviders()[index] ?? createChatProvider();
        const apiProvider = readProviderField<HTMLSelectElement>(card, index, "apiProvider")?.value === "Azure" ? "Azure" : "OpenAI";
        providers.push({
            ...prev,
            name: (readProviderField<HTMLInputElement>(card, index, "name")?.value ?? "").trim(),
            enabled: readProviderField<HTMLInputElement>(card, index, "enabled")?.checked ?? true,
            apiProvider,
            apiBaseURL: readProviderField<HTMLInputElement>(card, index, "apiBaseURL")?.value ?? "",
            apiKey: readProviderField<HTMLInputElement>(card, index, "apiKey")?.value ?? "",
            apiVersion: readProviderField<HTMLInputElement>(card, index, "apiVersion")?.value ?? "",
            apiProxy: readProviderField<HTMLInputElement>(card, index, "apiProxy")?.value ?? "",
            apiModel: readProviderField<HTMLInputElement>(card, index, "apiModel")?.value ?? "",
            apiTimeout: parseInt(readProviderField<HTMLInputElement>(card, index, "apiTimeout")?.value ?? "30", 10) || 30,
            agentTimeout: parseInt(readProviderField<HTMLInputElement>(card, index, "agentTimeout")?.value ?? "600", 10) || 0,
            agentConfirmTimeout: parseInt(readProviderField<HTMLInputElement>(card, index, "agentConfirmTimeout")?.value ?? "120", 10) || 120,
            agentMaxRetries: parseInt(readProviderField<HTMLInputElement>(card, index, "agentMaxRetries")?.value ?? "3", 10) || 0,
            type: prev.type && prev.type !== "embedding" ? prev.type : "chat",
        });
    });
    return providers;
};

const toggleChatProviderApiVersion = (card: HTMLElement, index: number) => {
    const apiProvider = readProviderField<HTMLSelectElement>(card, index, "apiProvider")?.value;
    card.querySelector(`[data-provider-version="${index}"]`)?.classList.toggle("fn__none", apiProvider !== "Azure");
};

const bindChatProviderPasswordToggles = (root: HTMLElement) => {
    getChatProviders().forEach((_, index) => {
        bindPasswordIconaToggle(root, providerFieldId(index, "apiKey"));
    });
};

const renderChatProviderList = (root: HTMLElement) => {
    const listEl = root.querySelector(`#${CHAT_PROVIDERS_LIST_ID}`);
    if (!listEl) {
        return;
    }
    const providers = getChatProviders();
    listEl.innerHTML = providers.length > 0
        ? providers.map((provider, index) => genChatProviderCardHtml(index, provider)).join("")
        : `<div class="b3-label__text ft__on-surface">尚未添加额外模型提供商。主模型配置在上方「服务连接」中。</div>`;
    bindChatProviderPasswordToggles(root);
};

const persistChatProvidersFromDom = (root: HTMLElement) => {
    const chatProviders = collectChatProvidersFromDom(root);
    const providers = mergeProvidersWithEmbedding(chatProviders);
    window.siyuan.config.ai.providers = providers;
    saveProviders(providers);
};

export const genChatProvidersBlockHtml = (): string => `<div class="b3-label config-item" id="aiChatProvidersBlock">
    ${genConfigItemMainHtml("额外模型提供商", "除主模型外，可添加更多聊天模型供 AI Agent 切换使用（不含语义搜索 Embedding 模型）。")}
    <div class="fn__hr--small"></div>
    <div id="${CHAT_PROVIDERS_LIST_ID}"></div>
    <div class="fn__hr--small"></div>
    <div class="fn__flex config-wrap">
        <div class="fn__flex-1"></div>
        ${genButtonHtml("addChatProvider", "添加模型提供商", "iconAdd")}
    </div>
</div>`;

export const mountChatProvidersBlock = (root: HTMLElement) => {
    const block = root.querySelector("#aiChatProvidersBlock");
    if (!block) {
        return;
    }
    renderChatProviderList(root);

    block.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        const removeBtn = target.closest<HTMLButtonElement>("[id^='removeChatProvider_']");
        if (removeBtn) {
            const index = parseInt(removeBtn.id.replace("removeChatProvider_", ""), 10);
            const chatProviders = getChatProviders();
            chatProviders.splice(index, 1);
            const providers = mergeProvidersWithEmbedding(chatProviders);
            window.siyuan.config.ai.providers = providers;
            renderChatProviderList(root);
            saveProviders(providers);
            return;
        }
        if (target.closest("#addChatProvider")) {
            const chatProviders = getChatProviders();
            chatProviders.push(createChatProvider());
            const providers = mergeProvidersWithEmbedding(chatProviders);
            window.siyuan.config.ai.providers = providers;
            renderChatProviderList(root);
            saveProviders(providers);
        }
    });

    block.addEventListener("change", (event) => {
        const target = event.target as HTMLElement;
        const card = target.closest<HTMLElement>("[data-provider-index]");
        if (!card) {
            return;
        }
        const indexAttr = card.getAttribute("data-provider-index");
        if (indexAttr === null) {
            return;
        }
        if (target.matches("select")) {
            toggleChatProviderApiVersion(card, parseInt(indexAttr, 10));
        }
        persistChatProvidersFromDom(root);
    });
};

export const EMBEDDING_ENABLED_ID = `${EMBEDDING_CONTROL_PREFIX}enabled`;
export const EMBEDDING_API_KEY_ID = `${EMBEDDING_CONTROL_PREFIX}apiKey`;
export const EMBEDDING_API_BASE_URL_ID = `${EMBEDDING_CONTROL_PREFIX}apiBaseURL`;
export const EMBEDDING_API_MODEL_ID = `${EMBEDDING_CONTROL_PREFIX}apiModel`;
