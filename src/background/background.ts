import type {Message} from "../types/types";
import Tab = chrome.tabs.Tab;

const openTabs = new Map<number, number>()

async function setFocused(extensionTabId: number) {
    try {
        const tab = await chrome.tabs.get(extensionTabId);
        const windowId = tab.windowId
        await chrome.windows.update(windowId, {focused: true},)
    } catch (e) {
        console.error(e)
    }
}

chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    try {
        if (openTabs.has(tab.id)) {
            const extensionTabId = openTabs.get(tab.id)
            if (extensionTabId) await setFocused(extensionTabId);
            return
        }
        ;

        const win = await chrome.windows.create({
            url: chrome.runtime.getURL("index.html"),
            type: "popup",
            height: 500,
            width: 850,
        },);

        const newTab = win.tabs?.[0];
        if (!newTab) return;
        const newTabId = newTab.id;
        if (!newTabId) return;
        openTabs.set(tab.id, newTabId);

        const message: Message = {"action": "create_execute", payload: newTab}
        await chrome.tabs.sendMessage(tab.id, message);

    } catch (e) {
        console.error(e)
    }

});


const listTabsComplete = new Set<number>()
const asideMessage = new Map<number, Message[]>()


function messageDelProxy(message: Message): Message {
    return {...message, action: message.action.replace('_PROXY', '')}
}

chrome.tabs.onUpdated.addListener(
    async (tabId, changeInfo) => {
        if (changeInfo.status === "complete" && openTabs.has(tabId)) {
            try {
                const message: Message = {"action": "create_execute", payload: openTabs.get(tabId)}
                await chrome.tabs.sendMessage(tabId, message);
            } catch (e) {
                console.error(e)
            }
            return;
        }


        const item = [...openTabs].find(([_, value]) => value === tabId);
        if (!item) return;
        try {
            if (changeInfo.status === "complete") {
                const page = await chrome.tabs.get(item[0]);
                const message: Message<Tab> = {"action": "set_tab_data", payload: page}
                await chrome.tabs.sendMessage(tabId, message);
                listTabsComplete.add(tabId)
                const messages = asideMessage.get(tabId)
                // console.log(tabId)
                // messages?.forEach(async (item) => await chrome.tabs.sendMessage(tabId, item));

                for await (let item of messages || []) {
                    await chrome.tabs.sendMessage(tabId, messageDelProxy(item))
                }

                asideMessage.delete(tabId)
            }
        } catch (e) {
            console.error(e)
        }

    }
)

chrome.runtime.onMessage.addListener(
    async (message, sender) => {
        try {
            const adr = openTabs.get(sender.tab?.id || -1)
            if (!adr) return;
            if (!listTabsComplete.has(adr)) {
                const messages = asideMessage.get(adr)
                if (messages) messages.push(message);
                if (!messages) asideMessage.set(adr, [message]);
                return;
            }
            await chrome.tabs.sendMessage(adr, messageDelProxy(message));
        } catch (e) {
            console.error(e)
        }

    }
)


chrome.tabs.onRemoved.addListener(
    async (tabId) => {
        const item = [...openTabs].find(([_, value]) => value === tabId);
        if (!item) return;
        openTabs.delete(item[0]);
        try {
            const message: Message = {"action": "remove_execute"}
            await chrome.tabs.sendMessage(item[0], message);
        } catch (e) {
            console.error(e)
        }

    },
)

