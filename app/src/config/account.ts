import {sync} from "./sync";

export const account = {
    element: undefined as Element,
    genHTML: (onlyPayHTML = false) => sync.genAccountHTML(onlyPayHTML),
    bindEvent: (element: Element) => sync.bindAccountEvent(element),
    _afterLogin: (userResponse: IWebSocketData, element: Element) => sync._afterLogin(userResponse, element),
    onSetaccount: () => sync.onSetaccount(),
};
