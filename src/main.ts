import type {Message} from "./types/types";
import {Tabulator} from "tabulator-tables"
import "tabulator-tables/dist/css/tabulator.css"
import  Tab = chrome.tabs.Tab;
import {GPData, GPEventData} from "./types/types";


function setPageParamPageUrl(url: string){
    const span = document.getElementById("pageUrl");
    if(!span)return;
    span.innerHTML = `Адрес страници · ${url}`
}
function setPageError(){
    const div=  document.createElement('div');
    div.classList.add("error");
    div.innerHTML = `Не найден установленный контейнер!`
    document.body.appendChild(div)
}

function paramsComponent(text:string,id:string){
  const div= document.getElementById(id)|| document.createElement('div');
  div.innerHTML = '';
  div.id=id;
  const span = document.createElement('span');
  span.classList.add("params");
  span.innerHTML=text;
    div.appendChild(span)
    return div
}
function renderGPData(data: GPData ){
    const article = document.getElementById("GP_params");
    if(!article)return;
    if(data.version){
        const versionComponent = paramsComponent(`Версия контейнера · ${data.version}`,'version_param')
        article.appendChild(versionComponent)
    }
    if(data.options?.id){
        const idComponent = paramsComponent(`ID · ${data.options?.id}`,'id_param')
        article.appendChild(idComponent)
    }
    if(data.uid){
        const uidComponent = paramsComponent(`UID · ${data.uid}`,'uid_param')
        article.appendChild(uidComponent)
    }
}

const table = new Tabulator("#GP_table", {
    data:[],
    columns:[
        {title:"Событие", field:"event",width:180},
        {title:"Значение", field:"value",},
    ],
    // layout:"fitColumns",
});

type TableData = {
    event: string ,
    value: string
}

type StoreForTable = {
    eventData:TableData[],
    RTGData:TableData[],
}
const storeForTable:StoreForTable = {
    eventData:[],
    RTGData:[],
};


chrome.runtime.onMessage.addListener( (message:Message,_)=> {

        switch (message.action){
            case "error_event_data":
                setPageError()
                break;
            case "set_tab_data":
                const tab = (message.payload as Tab)
                setPageParamPageUrl(tab.url ?? '')
                break;
            case "set_gp_data":
                const gpData = (message.payload as GPData )
                renderGPData(gpData)
                break;
            case "set_event_data":
                const gpEventData = (message.payload as GPEventData[] )
                const eventDataFormat = gpEventData.map(item =>{
                    const {event,value} = item
                    const valueStr = typeof value === "string" ? value:JSON.stringify(value||{},null, "</br>")
                    return{event,value:valueStr}
                })
                try {
                    storeForTable.eventData = eventDataFormat
                    table.replaceData([...storeForTable.RTGData,...eventDataFormat])
                }catch (e) {
                    console.error(e)
                }
                break;
            case "set_RTG_data":
                const gpRTGData = (message.payload as DataForRTGMessage[] )
                const gpRTGDataFormat = gpRTGData.map(item =>{
                    const {action,...rest} = item
                    const valueStr = JSON.stringify(rest||{},null, "</br>")
                    return{event:action,value:valueStr}
                })
                try {
                    storeForTable.RTGData = gpRTGDataFormat
                    table.replaceData([...gpRTGDataFormat,...storeForTable.eventData])
                }catch (e) {
                    console.error(e)
                }
                break;

        }

});





