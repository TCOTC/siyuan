import {sync} from "./sync";

export const repos = {
    element: undefined as Element,
    genHTML: () => sync.genReposHTML(),
    bindEvent: () => {
        sync.element = repos.element as Element;
        sync.bindReposEvent();
    },
};
