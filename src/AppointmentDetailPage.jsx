import React, { useEffect, useState } from 'react'
import { loadAppointments, saveAppointments } from './storage'

function qsFromHash(){
  const h = window.location.hash || '#/';
  const idx = h.indexOf('?');
  if(idx === -1) return new URLSearchParams('');
  return new URLSearchParams(h.slice(idx+1));
}

function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

export default function AppointmentDetailPage({ navigate }){
  const [appt, setAppt] = useState(null);

  useEffect(()=>{
    const p = qsFromHash(); const id = p.get('id');
    if(!id){ setAppt(undefined); return; }
    const a = loadAppointments().find(x=>x.id === id);
    setAppt(a || null);
  },[])

  function cancel(){
    if(!appt) return;
    if(!confirm('Cancel this appointment?')) return;
    const arr = loadAppointments();
    const item = arr.find(x=>x.id === appt.id);
    if(item){ item.status = 'Cancelled'; item.cancelledAt = new Date().toISOString(); saveAppointments(arr); }
    alert('Appointment marked as cancelled. Returning to list.');
    navigate('#/');
  }

  if(appt === undefined) return <div className="container"><div className="muted">No appointment id provided in the URL.</div></div>
  if(appt === null) return <div className="container"><div className="muted">Appointment not found.</div></div>

  return (
    <div className="container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{margin:0}}>Appointment Details</h2>
        <div>
          <button className="secondary" onClick={()=>navigate('#/')}>Back</button>
        </div>
      </div>
      <div style={{marginTop:14}}>
        <div><strong>{escapeHtml(appt.name)}</strong> <span className="muted">({escapeHtml(appt.mode)})</span></div>
        <div className="muted" style={{marginTop:6}}>{escapeHtml(appt.doctor)} · {escapeHtml(appt.date)} {escapeHtml(appt.time)}</div>
        <div style={{marginTop:10}}>Phone: <span className="muted">{escapeHtml(appt.phone)}</span></div>
        <div style={{marginTop:6}}>Email: <span className="muted">{escapeHtml(appt.email||'')}</span></div>
        <div style={{marginTop:10}}>Reason:</div>
        <div style={{marginTop:6,color:'#334155'}}>{escapeHtml(appt.reason||'—')}</div>
        {appt.status ? <div className="muted" style={{marginTop:8}}>Status: {escapeHtml(appt.status)}</div> : null}
      </div>
      <div style={{marginTop:14,textAlign:'right'}}>
        {appt.status === 'Cancelled' ? null : <button className="secondary" onClick={cancel}>Cancel Appointment</button>}
      </div>
    </div>
  )
}
