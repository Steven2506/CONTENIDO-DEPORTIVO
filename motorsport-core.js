/* Núcleo común de sesiones para F1 y MotoGP. Cada campeonato conserva su propio calendario. */
const MOTORSPORT_SESSION_MINUTES = {
  f1: {"Libres 1":60,"Libres 2":60,"Libres 3":60,"Clasificación Sprint":50,"Sprint":60,"Clasificación":70,"Carrera":150},
  motogp: {"FP1":45,"Practice":60,"FP2":30,"Clasificación (Q1/Q2)":55,"Sprint":45,"Warm Up":20,"Carrera":90}
};

function motorsportSession(competition, session) {
  if (Array.isArray(session)) {
    const name=String(session[0]||"Sesión"), start=session[1], sourceStatus=session[2]||"scheduled";
    return {competition,name,start,duration:MOTORSPORT_SESSION_MINUTES[competition]?.[name]||90,sourceStatus};
  }
  const name=String(session?.name||"Sesión");
  return {competition,name,start:session?.start,duration:Number(session?.duration)||MOTORSPORT_SESSION_MINUTES[competition]?.[name]||90,sourceStatus:session?.status||session?.state||"scheduled"};
}
function motorsportSessionEnd(competition, session) {
  const normalized=motorsportSession(competition,session),start=new Date(normalized.start).getTime();
  return Number.isFinite(start)?start+normalized.duration*60000:NaN;
}
function motorsportSessionState(competition, session, now=Date.now()) {
  const normalized=motorsportSession(competition,session),source=String(normalized.sourceStatus).toLowerCase();
  if(["live","in_progress","running"].includes(source))return "live";
  if(["final","finished","completed"].includes(source))return "finished";
  if(source==="postponed")return "postponed";
  if(["cancelled","canceled"].includes(source))return "cancelled";
  const start=new Date(normalized.start).getTime(),end=motorsportSessionEnd(competition,session);
  if(!Number.isFinite(start))return "pending";
  if(now<start)return "upcoming";
  if(now<end)return competition==="f1"?"pending":"live";
  return "finished";
}
function motorsportRaceEnd(competition, race) {
  if(race?.sessions?.length)return Math.max(...race.sessions.map(session=>motorsportSessionEnd(competition,session)).filter(Number.isFinite));
  const date=new Date(race?.date||NaN).getTime();
  return Number.isFinite(date)?date+3*86400000:NaN;
}
function motorsportNextSession(competition, race, now=Date.now()) {
  return race?.sessions?.find(session=>motorsportSessionEnd(competition,session)>now)||null;
}
function motorsportNextRace(competition, calendar, now=Date.now()) {
  return (calendar||[]).find(race=>motorsportRaceEnd(competition,race)>now)||null;
}
function motorsportSessionView(competition, session) {
  const normalized=motorsportSession(competition,session);
  return {competition:normalized.competition,name:normalized.name,start:normalized.start,duration:normalized.duration,status:motorsportSessionState(competition,session)};
}
