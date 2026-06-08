import type {RegistryTabSearchVisibility} from "../search/match";
import type {App} from "../../index";
import {scanRegistryTabSearch, stringsMatchQuery} from "../search/match";
import {normalizeSearchText} from "../search/normalize";
import {
    TabBuilder,
    type ConfigTabOptions,
    type ConfigTabShell,
    type PanelTabOptions,
} from "./tabBuilder";
import {applyConfigTabSearch, mountConfigTab} from "./mount";

interface ConfigTabSearchScan {
    matches: boolean;
    registryVisibility?: RegistryTabSearchVisibility;
}

export type ConfigTab = ConfigTabShell & {
    mount: (
        root: HTMLElement,
        searchQueryLower?: string,
        app?: App,
        registryVisibility?: RegistryTabSearchVisibility,
    ) => Promise<void>;
    scanSearch: (queryLower: string) => ConfigTabSearchScan;
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
            mount: async (root, searchQueryLower, app, registryVisibility) => {
                ensureRegistered();
                if (root.innerHTML === "") {
                    await mountConfigTab(options.id, root);
                    await afterMount?.(root, app);
                }
                applyConfigTabSearch(
                    root,
                    options.id,
                    options.title(),
                    searchQueryLower,
                    registryVisibility,
                );
            },
            scanSearch: (queryLower) => {
                ensureRegistered();
                const scan = scanRegistryTabSearch(options.id, options.title(), queryLower);
                return {
                    matches: scan.matches,
                    registryVisibility: {
                        visibleGroupKeys: scan.visibleGroupKeys,
                        visibleItemIds: scan.visibleItemIds,
                    },
                };
            },
        };
    }

    panel<TId extends string>(
        options: PanelTabOptions<TId>,
    ): ConfigTab {
        const {searchStrings, mount: panelMount, ...shell} = options;
        let normalizedTitle: string | undefined;
        const getNormalizedTitle = () => {
            if (normalizedTitle === undefined) {
                normalizedTitle = normalizeSearchText(options.title());
            }
            return normalizedTitle;
        };
        let cachedSearchIndex: readonly string[] | undefined;
        const getSearchIndex = () => {
            if (!cachedSearchIndex) {
                cachedSearchIndex = searchStrings()
                    .map(normalizeSearchText)
                    .filter((s) => s.length > 0);
            }
            return cachedSearchIndex;
        };
        return {
            ...shell,
            mount: async (root, searchQueryLower, app) => panelMount(root, searchQueryLower, app),
            scanSearch: (queryLower) => ({
                matches: getNormalizedTitle().includes(queryLower)
                    || stringsMatchQuery(getSearchIndex(), queryLower),
            }),
        };
    }
}
