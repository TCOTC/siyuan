import type {App} from "../../index";
import {registryTabMatchesSearch, stringsMatchQuery} from "../search/match";
import {normalizeSearchText} from "../search/normalize";
import {
    PageBuilder,
    type ConfigPageOptions,
    type ConfigPageShell,
    type PanelPageOptions,
} from "./pageBuilder";
import {applyConfigPageSearch, mountConfigPage} from "./mount";

export type {ConfigPageOptions, PanelPageOptions, ConfigPageShell} from "./pageBuilder";

export type ConfigPage = ConfigPageShell & {
    mount: (root: HTMLElement, searchQuery?: string, app?: App) => Promise<void>;
    matchesSearch: (queryLower: string) => boolean;
};

export class RegistryBuilder {
    page<TId extends string>(
        options: ConfigPageOptions<TId>,
        register: (page: PageBuilder<TId>) => void,
    ): ConfigPage {
        const {afterMount, ...shell} = options;
        let registered = false;
        const ensureRegistered = () => {
            if (registered) {
                return;
            }
            registered = true;
            register(new PageBuilder(options));
        };
        return {
            ...shell,
            mount: async (root, searchQuery, app) => {
                ensureRegistered();
                if (root.innerHTML === "") {
                    await mountConfigPage(options.id, root);
                    await afterMount?.(root, app);
                }
                applyConfigPageSearch(root, options.id, options.title(), searchQuery);
            },
            matchesSearch: (queryLower) => {
                ensureRegistered();
                return registryTabMatchesSearch(options.id, options.title(), queryLower);
            },
        };
    }

    panel<TId extends string>(
        options: PanelPageOptions<TId>
    ): ConfigPage {
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

/** 声明设置 Tab 注册表；返回 `{ tabId: ConfigPage }` 供推导 `TConfigTab` */
export const defineConfigRegistry = <T extends Record<string, ConfigPage>>(
    setup: (registry: RegistryBuilder) => T,
): T => setup(new RegistryBuilder());

export interface IConfigTabShell<TId extends string = string> {
    id: TId;
    icon: string;
    title: string;
    hidden?: boolean;
}

let configTabShellCache: IConfigTabShell<string>[] | undefined;

export const buildConfigTabDefs = <T extends Record<string, ConfigPage>>(
    pages: T,
): IConfigTabShell<keyof T & string>[] => {
    if (configTabShellCache) {
        return configTabShellCache as IConfigTabShell<keyof T & string>[];
    }
    configTabShellCache = (Object.keys(pages) as (keyof T & string)[]).map((id) => {
        const page = pages[id];
        return {
            id,
            icon: page.icon,
            title: page.title(),
            hidden: page.hidden?.(),
        };
    });
    return configTabShellCache as IConfigTabShell<keyof T & string>[];
};

export const getConfigPageFrom = (pages: Record<string, ConfigPage>, id: string): ConfigPage | undefined =>
    pages[id as keyof typeof pages];
