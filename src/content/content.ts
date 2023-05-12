import type {Message} from "../types/types";


function createExecute() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("execute.js");

    document.body.appendChild(script);

    script.onload = () => {
        // window.postMessage({action:'newTab_data',payload:newTab})
    };

    return script;
}


let script: HTMLScriptElement | null = null;

chrome.runtime.onMessage.addListener( (message:Message)=> {
    if(message?.action === "create_execute"){
        script =  createExecute();
    }
    if(message?.action === "remove_execute"){
        window.postMessage({action:'remove_execute'})
        script?.remove();
    }
});


async function proxyMessage(message:Message){
    try {
        await  chrome.runtime.sendMessage({...message,action:`${message.action}_PROXY`});

    }catch (e) {
        console.error(e)
        throw e
    }

}

window.addEventListener("message", listenerMessage);


const actionsForProxy = [
    'set_event_data',
    'set_Uid',
    'set_gp_data',
    'set_RTG_data',
    'error_event_data',
]
function listenerMessage(e: MessageEvent<Message>) {
    const {data} =e;

    if(data?.action && actionsForProxy.includes(data.action)){
        proxyMessage(data)
    }
}
