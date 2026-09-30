/* Contrato común del widget. Cada proveedor conserva su fuente y normaliza solo su salida. */
(function(){
  const providers=new Map(),storageKey="wolfgames-selected-competitions";
  function register(provider){if(!provider?.id||typeof provider.getEvents!=="function")return;providers.set(provider.id,{icon:"🏟️",...provider});}
  function catalog(){return [...providers.values()].map(({id,label,icon,url})=>({id,label,icon,url}));}
  function selected(){try{const value=JSON.parse(localStorage.getItem(storageKey)||"null");if(Array.isArray(value))return value;}catch{}return catalog().map(item=>item.id);}
  function setSelected(ids){const valid=new Set(catalog().map(item=>item.id));const clean=[...new Set(ids)].filter(id=>valid.has(id));try{localStorage.setItem(storageKey,JSON.stringify(clean));}catch{}return clean;}
  function events(now=Date.now(),ids=selected()){
    return [...providers.values()].filter(provider=>ids.includes(provider.id)).flatMap(provider=>{
      try{return (provider.getEvents(now)||[]).map((event,index)=>({id:event.id||`${provider.id}-${index}`,competition:provider.id,competitionLabel:provider.label,icon:provider.icon,title:event.title||provider.label,startAt:Number(event.startAt),status:event.status||"scheduled",href:event.href||provider.url,participants:event.participants||[],summary:event.summary||""})).filter(event=>Number.isFinite(event.startAt));}catch(error){console.warn(`Proveedor ${provider.id} no disponible`,error);return [];}
    });
  }
  window.SportsWidget={register,catalog,selected,setSelected,events,storageKey};
})();
