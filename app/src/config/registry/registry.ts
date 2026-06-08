import type {App} from "../../index";
import {registryTabMatchesSearch, stringsMatchQuery} from "../search/match";
import {normalizeSearchText} from "../search/normalize";
import {
    TabBuilder,
    type ConfigTabOptions,
    type ConfigTabShell,
    type PanelTabOptions,
} from "./tabBuilder";
import {applyConfigTabSearch, mountConfigTab} from "./mount";

export type {ConfigTabOptions, PanelTabOptions, ConfigTabShell} from "./tabBuilder";

export type ConfigTab = ConfigTabShell & {
    mount: (root: HTMLElement, searchQuery?: string, app?: App) => Promise<void>;
    matchesSearch: (queryLower: string) => boolean;
};

export class RegistryBuilder {
    tab<TId extends string>(
        options: ConfigTabOptions<TId>,
        register: (tab: TabBuilder<TId>) => void,
    ): ConfigTab {
        const {afterMount, ...shell} = options;
        let registered = false;
        const ensureRegistered = () => {
            if (registered) {
                return;
            }
            registered = true;
            register(new TabBuilder(options));
        };
        return {
            ...shell,
            mount: async (root, searchQuery, app) => {
                ensureRegistered();
                if (root.innerHTML === "") {
                    await mountConfigTab(options.id, root);
                    await afterMount?.(root, app);
                }
                applyConfigTabSearch(root, options.id, options.title(), searchQuery);
            },
            matchesSearch: (queryLower) => {
                ensureRegistered();
                return registryTabMatchesSearch(options.id, options.title(), queryLower);
            },
        };
    }

    panel<TId extends string>(
        options: PanelTabOptions<TId>
    ): ConfigTab {
        const {searchStrings, mount: panelMount, ...shell} = options;
        const panelSearchIndex = () =>
            searchStrings().map(normalizeSearchText).filter((s) => s.length > 0);
        return {
            ...shell,
            mount: async (root, searchQuery, app) => panelMount(root, searchQuery, app),
            matchesSearch: (queryLower) => {
                const tabTitle = normalizeSearchText(options.title());
                if (tabTitle.includes(queryLower)) {
                    return true;
                }
                return stringsMatchQuery(panelSearchIndex(), queryLower);
            },
        };
    }
}

/** 声明设置 Tab 注册表；返回 `{ tabId: ConfigTab }` 供推导 `TConfigTab` */
export const defineConfigRegistry = <T extends Record<string, ConfigTab>>(
    setup: (registry: RegistryBuilder) => T,
): T => setup(new RegistryBuilder());

export interface IConfigTabShell<TId extends string = string> {
    id: TId;
    icon: string;
    title: string;
    hidden?: boolean;
}

let configTabShellCache: IConfigTabShell<string>[] | undefined;

export const buildConfigTabDefs = <T extends Record<string, ConfigTab>>(
    tabs: T,
): IConfigTabShell<keyof T & string>[] => {
    if (configTabShellCache) {
        return configTabShellCache as IConfigTabShell<keyof T & string>[];
    }
    configTabShellCache = (Object.keys(tabs) as (keyof T & string)[]).map((id) => {
        const tab = tabs[id];
        return {
            id,
            icon: tab.icon,
            title: tab.title(),
            hidden: tab.hidden?.(),
        };
    });
    return configTabShellCache as IConfigTabShell<keyof T & string>[];
};

export const getConfigTabFrom = (tabs: Record<string, ConfigTab>, id: string): ConfigTab | undefined =>
    tabs[id as keyof typeof tabs];
