import { useState } from 'react'
import {
  ArrowUpRight,
  ChevronDown,
  CirclePlay,
  ExternalLink,
  Flag,
  Radio,
  RefreshCw,
  Trophy,
  Tv,
} from 'lucide-react'
import './App.css'

type Match = {
  day: string
  date: string
  time: string
  opponent: string
  opponentFlag: string
  score?: string
  status: 'Finalizado' | 'Próximo' | 'Fase final'
  stage: string
}

const groups = [
  {
    name: 'Grupo A',
    teams: [
      ['Wales', '4', '3', '0', '1', '+6', '9'],
      ['Germany', '4', '2', '1', '1', '+5', '7'],
      ['Italy', '4', '1', '2', '1', '-2', '5'],
      ['Australia', '4', '1', '1', '2', '-3', '4'],
      ['Northern Ireland', '4', '1', '0', '3', '-6', '3'],
    ],
  },
  {
    name: 'Grupo B',
    teams: [
      ['England', '4', '3', '0', '1', '+17', '9'],
      ['Chile', '4', '3', '0', '1', '+11', '9'],
      ['Colombia', '4', '2', '0', '2', '-5', '6'],
      ['Romania', '4', '2', '0', '2', '-7', '6'],
      ['Netherlands', '4', '0', '0', '4', '-16', '0'],
    ],
  },
  {
    name: 'Grupo C',
    teams: [
      ['Mexico', '4', '3', '1', '0', '+20', '10'],
      ['Spain', '4', '3', '1', '0', '+15', '10'],
      ['United States', '4', '1', '1', '2', '-5', '4'],
      ['France', '4', '0', '2', '2', '-13', '2'],
      ['Ireland', '4', '0', '1', '3', '-17', '1'],
    ],
  },
]

const matches: Match[] = [
  { day: 'Lun 14 SEP', date: '14 de septiembre', time: '10:00', opponent: 'Estados Unidos', opponentFlag: '🇺🇸', score: '4 — 0', status: 'Finalizado', stage: 'Grupo C' },
  { day: 'Mar 15 SEP', date: '15 de septiembre', time: '08:00', opponent: 'Irlanda', opponentFlag: '🇮🇪', score: '5 — 0', status: 'Finalizado', stage: 'Grupo C' },
  { day: 'Mié 16 SEP', date: '16 de septiembre', time: '09:00', opponent: 'México', opponentFlag: '🇲🇽', score: '1 — 1', status: 'Finalizado', stage: 'Grupo C' },
  { day: 'Mié 16 SEP', date: '16 de septiembre', time: '13:50', opponent: 'Francia', opponentFlag: '🇫🇷', score: '2 — 0', status: 'Finalizado', stage: 'Grupo C' },
  { day: 'Jue 17 SEP', date: '17 de septiembre', time: '11:30', opponent: 'Pendiente de sorteo', opponentFlag: '🌍', status: 'Fase final', stage: 'Cuartos de final' },
]

const bracket = [
  { label: 'Cuartos 1', top: '1.º Grupo A', bottom: '3.º Grupo B', winner: 'Semifinal 1' },
  { label: 'Cuartos 2', top: '1.º Grupo B', bottom: '3.º Grupo A', winner: 'Semifinal 1' },
  { label: 'Cuartos 3', top: '1.º Grupo C', bottom: '2.º Grupo B', winner: 'Semifinal 2' },
  { label: 'Cuartos 4', top: '2.º Grupo C · ESP', bottom: '2.º Grupo A', winner: 'Semifinal 2' },
]

function App() {
  const [activeView, setActiveView] = useState('Resumen')
  const [matchFilter, setMatchFilter] = useState('Todos')
  const filteredMatches = matchFilter === 'Todos' ? matches : matches.filter((match) => match.status === matchFilter)

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Inicio Mundial de Juegos de Trasplantados">
          <span className="brand-mark">WT</span>
          <span><strong>MUNDIAL</strong><small>de trasplantados</small></span>
        </a>
        <nav className="main-nav" aria-label="Navegación principal">
          {['Resumen', 'Partidos', 'Clasificación', 'Bracket'].map((view) => (
            <button className={activeView === view ? 'nav-link active' : 'nav-link'} key={view} onClick={() => setActiveView(view)}>{view}</button>
          ))}
        </nav>
        <a className="live-pill" href="https://wtgfgateway.org/tournament/cd512e68-53d0-4e92-abbb-2311e565ddfc" target="_blank" rel="noreferrer"><span className="pulse-dot" /> Gateway oficial <ArrowUpRight size={14} /></a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow"><span className="live-dot" /> EN DIRECTO · FRANKFURT 2026</p>
          <h1>España,<br /><em>partido a partido.</em></h1>
          <p className="hero-text">Todo lo que necesitas para seguir a la selección española en el Transplant Football World Cup.</p>
          <div className="hero-actions"><a className="primary-button" href="#partidos">Ver el seguimiento <ArrowUpRight size={17} /></a><a className="text-link" href="https://wtgf.org/2026-transplant-football-world-cup/" target="_blank" rel="noreferrer">Web oficial <ExternalLink size={15} /></a></div>
        </div>
        <div className="hero-scoreboard">
          <div className="scoreboard-top"><span>FASE DE GRUPOS · GRUPO C</span><span>FINALIZADA</span></div>
          <div className="score-teams"><div><span className="team-flag">🇪🇸</span><strong>España</strong></div><span className="score">10 <small>PTS</small></span></div>
          <div className="score-meta"><span>4 partidos</span><span>3V · 1E · 0D</span><span>+15 DG</span></div>
          <div className="qualification"><Trophy size={16} /> Clasificada a la fase final <span>2.ª de grupo</span></div>
        </div>
      </section>

      <section className="content-wrap">
        <div className="section-heading"><div><p className="section-kicker">LA AGENDA DE ESPAÑA</p><h2>El camino de la selección</h2></div><span className="data-note"><RefreshCw size={13} /> Datos sincronizados · 17 SEP 2026</span></div>
        <div className="match-strip" id="partidos">
          {filteredMatches.map((match, index) => <article className={match.status === 'Fase final' ? 'match-card next-match' : 'match-card'} key={`${match.day}-${match.opponent}`}>
            <div className="match-date"><span>{match.day}</span><small>{match.date}</small></div><div className="match-stage">{match.stage}</div>
            <div className="match-body"><div className="country"><span>🇪🇸</span><strong>España</strong></div><div className="match-result">{match.score ? <strong>{match.score}</strong> : <span className="tbd">POR CONFIRMAR</span>}<small>{match.time} · {index === matches.length - 1 ? 'Campo 1' : 'Campo 2'}</small></div><div className="country opponent"><span>{match.opponentFlag}</span><strong>{match.opponent}</strong></div></div>
            <span className={match.status === 'Finalizado' ? 'status done' : 'status upcoming'}>{match.status}</span>
          </article>)}
        </div>
        <div className="filter-row"><span>Mostrar:</span>{['Todos', 'Finalizado', 'Fase final'].map((filter) => <button className={matchFilter === filter ? 'filter active' : 'filter'} key={filter} onClick={() => setMatchFilter(filter)}>{filter}</button>)}</div>

        <div className="dashboard-grid">
          <section className="panel standings-panel" id="clasificacion"><div className="panel-heading"><div><p className="section-kicker">TABLA EN VIVO</p><h2>Clasificación</h2></div><span className="group-label">GRUPOS <ChevronDown size={15} /></span></div><div className="groups-grid">{groups.map((group) => <div className="group" key={group.name}><div className="group-title"><strong>{group.name}</strong><span>5 equipos</span></div><div className="table-head"><span># / EQUIPO</span><span>P</span><span>DG</span><span>PTS</span></div>{group.teams.map((team, index) => <div className={team[0] === 'Spain' ? 'table-row highlight' : 'table-row'} key={team[0]}><span><b>{index + 1}</b>{team[0] === 'Spain' && <span className="mini-flag">🇪🇸</span>} {team[0]}</span><span>{team[1]}</span><span>{team[5]}</span><strong>{team[6]}</strong></div>)}</div>)}</div><a className="panel-link" href="https://wtgfgateway.org/tournament/cd512e68-53d0-4e92-abbb-2311e565ddfc" target="_blank" rel="noreferrer">Ver tabla completa en Gateway <ArrowUpRight size={15} /></a></section>

          <aside className="panel live-panel"><div className="panel-heading"><div><p className="section-kicker">SEÑAL OFICIAL</p><h2>Ahora en directo</h2></div><span className="on-air"><Radio size={13} /> ON AIR</span></div><div className="video-frame"><iframe title="Emisión oficial WTGF" src="https://www.youtube.com/@WorldTransplantGames/live" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /><div className="video-fallback"><CirclePlay size={38} /><strong>Emisión WTGF</strong><span>Si el directo no carga, ábrelo en YouTube.</span><a href="https://www.youtube.com/@WorldTransplantGames/live" target="_blank" rel="noreferrer">Abrir emisión <ExternalLink size={14} /></a></div></div><div className="live-footer"><Tv size={17} /><span><strong>Canal oficial WTGF</strong><small>Transplant Football World Cup 2026</small></span><a href="https://www.youtube.com/@WorldTransplantGames/live" target="_blank" rel="noreferrer" aria-label="Abrir canal de YouTube"><ArrowUpRight size={17} /></a></div></aside>
        </div>

        <section className="panel bracket-panel" id="bracket"><div className="panel-heading"><div><p className="section-kicker">FASE FINAL</p><h2>Camino al título</h2></div><span className="bracket-note">8 equipos · 4 cruces</span></div><div className="bracket-layout"><div className="bracket-rounds"><div className="round-label">CUARTOS DE FINAL <span>JUE 17 SEP</span></div>{bracket.map((game) => <div className="bracket-match" key={game.label}><span className="bracket-label">{game.label}</span><div className={game.top.includes('ESP') ? 'bracket-team spain' : 'bracket-team'}><span>{game.top}</span><b>—</b></div><div className="bracket-team"><span>{game.bottom}</span><b>—</b></div><i /></div>)}</div><div className="bracket-connector"><span>SEMIFINALES<br /><small>VIE 18 SEP · 08:00</small></span><div className="connector-line" /><div className="connector-line second" /></div><div className="bracket-final"><span className="round-label">FINAL <span>VIE 18 SEP · 13:45</span></span><div className="final-card"><Trophy size={25} /><strong>Campeón del<br />mundo 2026</strong><span>El partido decisivo</span></div></div></div><p className="bracket-footnote"><Flag size={14} /> Cruces pendientes de confirmación oficial en Gateway. El formato contempla 8 equipos en el Championship Knockout.</p></section>
      </section>

      <footer><div className="footer-brand"><span className="brand-mark small">WT</span><span>Mundial de Juegos de Trasplantados</span></div><span>Una experiencia independiente para seguir a España · No afiliada a WTGF</span><a href="https://wtgfgateway.org/tournament/cd512e68-53d0-4e92-abbb-2311e565ddfc" target="_blank" rel="noreferrer">Fuente oficial <ExternalLink size={13} /></a></footer>
    </main>
  )
}

export default App
