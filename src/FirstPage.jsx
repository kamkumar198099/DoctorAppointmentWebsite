import React, { useEffect, useState } from 'react'
import { loadAppointments, saveAppointments, makeId } from './storage'

function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

function computeAnalytics(appts){
  const stats = { total: appts.length, upcoming:0, past:0, byDoctor:{}, byMode:{}, last7:new Array(7).fill(0) }
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  appts.forEach(a=>{
    const dt = new Date((a.date||'') + 'T' + (a.time||'00:00'));
    if(dt >= now) stats.upcoming++; else stats.past++;
    stats.byDoctor[a.doctor] = (stats.byDoctor[a.doctor]||0) + 1;
    stats.byMode[a.mode] = (stats.byMode[a.mode]||0) + 1;
    const dayDiff = Math.floor((dt - todayStart) / (1000*60*60*24));
    if(dayDiff >= -6 && dayDiff <= 0) stats.last7[6 + dayDiff] += 1;
  })
  return stats;
}

export default function FirstPage({ navigate }){
  const [appts, setAppts] = useState(loadAppointments())
  const [form, setForm] = useState({ name:'', phone:'', email:'', doctor:'Dr. Amit Verma — General Physician', date:'', time:'', mode:'In-person', reason:'' })

  useEffect(()=>{ saveAppointments(appts) }, [appts])

  function handleSubmit(e){
    e.preventDefault();
    const data = { id: makeId(), ...form };
    if(!data.name || !data.date || !data.time || !data.phone){ alert('Please fill required fields: name, phone, date and time.'); return; }
    const sel = new Date(data.date + 'T' + (data.time||'00:00'));
    const now = new Date();
    if(sel < now){ if(!confirm('Selected slot is in the past. Book anyway?')) return; }
    setAppts(prev => [...prev, data]);
    setForm({ name:'', phone:'', email:'', doctor:'Dr. Amit Verma — General Physician', date:'', time:'', mode:'In-person', reason:'' })
    alert('Appointment booked successfully.')
  }

  function markCancelled(id){
    if(!confirm('Cancel this appointment?')) return;
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status:'Cancelled', cancelledAt: new Date().toISOString() } : a))
  }

  function exportJSON(){
    const blob = new Blob([JSON.stringify(appts, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'appointments.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  const stats = computeAnalytics(appts);

  return (
    <div className="container">
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Doctor Appointment</h1>
        <div className="muted">Book and manage appointments</div>
      </header>
      <div className="grid">
        <section>
          <form id="bookingForm" onSubmit={handleSubmit} autoComplete="off">
            <div className="row">
              <div>
                <label>Full name</label>
                <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required placeholder="e.g. Priya Sharma" />
              </div>
              <div>
                <label>Phone</label>
                <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} required placeholder="+91 98765 43210" />
              </div>
            </div>
            <label>Email</label>
            <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} type="email" placeholder="you@example.com" />

            <div className="row" style={{marginTop:12}}>
              <div>
                <label>Doctor</label>
                <select value={form.doctor} onChange={e=>setForm({...form, doctor:e.target.value})}>
                  <option>Dr. Amit Verma — General Physician</option>
                  <option>Dr. Sangeeta Rao — Pediatrician</option>
                  <option>Dr. R. K. Singh — Cardiologist</option>
                  <option>Dr. Leena Patel — Dermatologist</option>
                </select>
              </div>
              <div>
                <label>Date</label>
                <input value={form.date} onChange={e=>setForm({...form, date:e.target.value})} type="date" required />
              </div>
            </div>

            <div className="row" style={{marginTop:12}}>
              <div>
                <label>Time</label>
                <input value={form.time} onChange={e=>setForm({...form, time:e.target.value})} type="time" required />
              </div>
              <div>
                <label>Visit type</label>
                <select value={form.mode} onChange={e=>setForm({...form, mode:e.target.value})}>
                  <option>In-person</option>
                  <option>Teleconsultation</option>
                </select>
              </div>
            </div>

            <label style={{marginTop:12}}>Reason (optional)</label>
            <textarea rows={3} value={form.reason} onChange={e=>setForm({...form, reason:e.target.value})} placeholder="Short description" />

            <div className="actions">
              <button type="submit">Book Appointment</button>
              <button type="button" className="secondary" onClick={()=>setForm({ name:'', phone:'', email:'', doctor:'Dr. Amit Verma — General Physician', date:'', time:'', mode:'In-person', reason:'' })}>Clear</button>
            </div>
          </form>
        </section>

        <aside className="panel">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <strong>Appointments</strong>
            <div className="muted">{appts.length}</div>
          </div>

          <div style={{marginTop:12,minHeight:160}}>
            {appts.length === 0 ? <div className="empty">No appointments yet</div> : (
              appts.slice().reverse().map(a => (
                <div key={a.id} className={'appt' + (a.status === 'Cancelled' ? ' cancelled' : '')}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div><strong>{escapeHtml(a.name)}</strong> <span className="muted">({escapeHtml(a.mode)})</span></div>
                      <div className="muted">{escapeHtml(a.doctor)} · {escapeHtml(a.date)} {escapeHtml(a.time)}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div className="muted">{escapeHtml(a.phone||'')}</div>
                      <div style={{marginTop:8, display:'flex', gap:6, justifyContent:'flex-end'}}>
                        <button className="secondary" onClick={()=>navigate('#/detail?id=' + encodeURIComponent(a.id))}>Details</button>
                        <button className="secondary" onClick={()=>markCancelled(a.id)}>{a.status === 'Cancelled' ? 'Cancelled' : 'Cancel'}</button>
                      </div>
                    </div>
                  </div>
                  <div style={{marginTop:8,color:'#334155'}}>{escapeHtml(a.reason||'')}</div>
                  {a.status ? <div className="muted" style={{marginTop:6}}>Status: {escapeHtml(a.status)}</div> : null}
                </div>
              ))
            )}
          </div>

          <div style={{marginTop:10,textAlign:'center'}}>
            <button className="secondary" onClick={exportJSON}>Export JSON</button>
          </div>

          <div id="analytics" style={{marginTop:12,borderTop:'1px dashed #eef2f7',paddingTop:10}}>
            <strong>Analytics</strong>
            <div style={{marginTop:8}}>
              <div className="muted">Total appointments: <span>{stats.total}</span></div>
              <div className="muted">Upcoming: <span>{stats.upcoming}</span> · Past: <span>{stats.past}</span></div>
            </div>
            <div style={{marginTop:8}}>
              <div className="muted">By Doctor:</div>
              <div style={{marginTop:6}}>
                {Object.keys(stats.byDoctor).map(k=> <div key={k} className="muted">{k} — {stats.byDoctor[k]}</div>)}
              </div>
            </div>
            <div style={{marginTop:8}}>
              <div className="muted">By Mode:</div>
              <div style={{marginTop:6}}>
                {Object.keys(stats.byMode).map(k=> <div key={k} className="muted">{k} — {stats.byMode[k]}</div>)}
              </div>
            </div>
            <canvas id="trendCanvas" width={300} height={50} style={{width:'100%',height:50,marginTop:8,border:'1px solid #eef2f7',borderRadius:6}}></canvas>
          </div>
        </aside>
      </div>
    </div>
  )
}
