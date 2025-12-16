export function loadAppointments(){
  try{ return JSON.parse(localStorage.getItem('appointments')||'[]'); }
  catch(e){ return []; }
}
export function saveAppointments(arr){ localStorage.setItem('appointments', JSON.stringify(arr)); }
export function makeId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
