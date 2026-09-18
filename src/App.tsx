import { useEffect, useState } from 'react'
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
  status: 'Finalizado' | 'Próximo' | 'Fase final' | 'En directo'
  stage: string
}

type Group = { name: string; teams: string[][] }
type OfficialTeam = { id: string; name: string; group_id: string }

const fallbackGroups: Group[] = [
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

const fallbackMatches: Match[] = [
  { day: 'Lun 14 SEP', date: '14 de septiembre', time: '10:00', opponent: 'Estados Unidos', opponentFlag: '🇺🇸', score: '4 — 0', status: 'Finalizado', stage: 'Grupo C' },
  { day: 'Mar 15 SEP', date: '15 de septiembre', time: '08:00', opponent: 'Irlanda', opponentFlag: '🇮🇪', score: '5 — 0', status: 'Finalizado', stage: 'Grupo C' },
  { day: 'Mié 16 SEP', date: '16 de septiembre', time: '09:00', opponent: 'México', opponentFlag: '🇲🇽', score: '1 — 1', status: 'Finalizado', stage: 'Grupo C' },
  { day: 'Mié 16 SEP', date: '16 de septiembre', time: '13:50', opponent: 'Francia', opponentFlag: '🇫🇷', score: '2 — 0', status: 'Finalizado', stage: 'Grupo C' },
  { day: 'Jue 17 SEP', date: '17 de septiembre', time: 'Ahora', opponent: 'Chile', opponentFlag: '🇨🇱', score: '— —', status: 'En directo', stage: 'Cuartos de final' },
]

const fallbackBracket = [
  { label: 'Cuartos 1', top: 'Inglaterra', bottom: 'Italia', topScore: '3', bottomScore: '0' },
  { label: 'Cuartos 2', top: 'Gales', bottom: 'Colombia', topScore: '4', bottomScore: '1' },
  { label: 'Cuartos 3', top: 'México', bottom: 'Alemania', topScore: '5', bottomScore: '0' },
  { label: 'Cuartos 4', top: 'Chile', bottom: 'España', topScore: '1', bottomScore: '3' },
]

const fallbackSemiFinals = [
  { label: 'Semifinal 1', top: 'Inglaterra', bottom: 'Gales', topScore: '6', bottomScore: '4' },
  { label: 'Semifinal 2', top: 'México', bottom: 'España', topScore: '6', bottomScore: '7' },
]

const fallbackFinal = { top: 'Inglaterra', bottom: 'España', topScore: '—', bottomScore: '—', status: 'Próxima' }

const SUPABASE_URL = 'https://bxkkhwrflrscshrkcdku.supabase.co/rest/v1'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a2tod3JmbHJzY3NocmtjZGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDg0NTIsImV4cCI6MjA4NzcyNDQ1Mn0.1G9jZ8RDT4NdkHmrOAKgXgPPmOqbQGWn4ap4ztgAr40'
const GAME_ID = 'cd512e68-53d0-4e92-abbb-2311e565ddfc'
const YOUTUBE_CHANNEL_ID = 'UCN3fG_9iXDEro6WKIU6chlQ'
const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}/live`
const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=5OQ4DrKJy_s'

const officialName = (name: string) => ({ Spain: 'España', Wales: 'Gales', England: 'Inglaterra', Mexico: 'México', Germany: 'Alemania', Italy: 'Italia' }[name] ?? name)

async function fetchOfficialData() {
  const headers = { apikey: SUPABASE_ANON_KEY }
  const params = `game_id=eq.${GAME_ID}`
  const [matchesResponse, teamsResponse, groupsResponse] = await Promise.all([
    fetch(`${SUPABASE_URL}/tournament_matches?select=*&${params}&order=kickoff_at.asc.nullslast%2Cbracket_position.asc.nullslast`, { headers }),
    fetch(`${SUPABASE_URL}/tournament_teams?select=*&${params}&division=eq.mens`, { headers }),
    fetch(`${SUPABASE_URL}/tournament_groups?select=*&${params}&division=eq.mens&order=sort_order.asc`, { headers }),
  ])
  if (!matchesResponse.ok || !teamsResponse.ok || !groupsResponse.ok) throw new Error('Gateway unavailable')
  return { matches: await matchesResponse.json(), teams: await teamsResponse.json(), groups: await groupsResponse.json() }
}

function App() {
  const [matchFilter, setMatchFilter] = useState('Todos')
  const [groups, setGroups] = useState(fallbackGroups)
  const [matches, setMatches] = useState(fallbackMatches)
  const [bracket, setBracket] = useState(fallbackBracket)
  const [semiFinals, setSemiFinals] = useState(fallbackSemiFinals)
  const [finalMatch, setFinalMatch] = useState(fallbackFinal)
  const [lastSync, setLastSync] = useState('17 SEP 2026')

  useEffect(() => {
    fetchOfficialData().then(({ matches: officialMatches, teams, groups: officialGroups }) => {
      const teamsById = new Map<string, OfficialTeam>(teams.map((team: OfficialTeam) => [team.id, team]))
      const matchName = (teamId: string | null) => officialName(teamsById.get(teamId ?? '')?.name ?? 'Pendiente')
      const scoredMatches = officialMatches.filter((match: { stage: string; home_score: number | null; away_score: number | null }) => match.stage === 'group' && match.home_score !== null && match.away_score !== null)
      const liveMatches = officialMatches.filter((match: { stage: string; home_team_id: string | null; away_team_id: string | null }) => match.stage === 'quarterfinal' && (matchName(match.home_team_id) === 'España' || matchName(match.away_team_id) === 'España'))

      const calculatedGroups = officialGroups.map((group: { id: string; name: string }) => {
        const groupTeams = teams.filter((team: { group_id: string }) => team.group_id === group.id)
        const table = groupTeams.map((team: { id: string; name: string }) => {
          const stats = { played: 0, wins: 0, draws: 0, losses: 0, goalDifference: 0, points: 0 }
          scoredMatches.filter((match: { home_team_id: string | null; away_team_id: string | null; home_score: number; away_score: number }) => match.home_team_id === team.id || match.away_team_id === team.id).forEach((match: { home_team_id: string | null; home_score: number; away_score: number }) => {
            const home = match.home_team_id === team.id
            const goalsFor = home ? match.home_score : match.away_score
            const goalsAgainst = home ? match.away_score : match.home_score
            stats.played += 1
            stats.goalDifference += goalsFor - goalsAgainst
            if (goalsFor > goalsAgainst) { stats.wins += 1; stats.points += 3 } else if (goalsFor === goalsAgainst) { stats.draws += 1; stats.points += 1 } else stats.losses += 1
          })
          return [officialName(team.name), String(stats.played), String(stats.wins), String(stats.draws), String(stats.losses), `${stats.goalDifference >= 0 ? '+' : ''}${stats.goalDifference}`, String(stats.points)]
        }).sort((first: string[], second: string[]) => Number(second[6]) - Number(first[6]) || Number(second[5]) - Number(first[5]))
        return { name: group.name.replace('Group', 'Grupo'), teams: table }
      })

      const knockout = officialMatches.filter((match: { stage: string }) => match.stage === 'quarterfinal' || match.stage === 'semifinal' || match.stage === 'final')
      setBracket(knockout.filter((match: { stage: string }) => match.stage === 'quarterfinal').map((match: { bracket_position: number; home_team_id: string | null; away_team_id: string | null; home_score: number | null; away_score: number | null }) => ({ label: `Cuartos ${match.bracket_position}`, top: matchName(match.home_team_id), bottom: matchName(match.away_team_id), topScore: match.home_score === null ? '—' : String(match.home_score), bottomScore: match.away_score === null ? '—' : String(match.away_score) })))
      setSemiFinals(knockout.filter((match: { stage: string }) => match.stage === 'semifinal').map((match: { bracket_position: number; home_team_id: string | null; away_team_id: string | null; home_score: number | null; away_score: number | null }) => ({ label: `Semifinal ${match.bracket_position}`, top: matchName(match.home_team_id), bottom: matchName(match.away_team_id), topScore: match.home_score === null ? '—' : String(match.home_score), bottomScore: match.away_score === null ? '—' : String(match.away_score) })))
      const officialFinal = knockout.find((match: { stage: string }) => match.stage === 'final')
      if (officialFinal) setFinalMatch({ top: matchName(officialFinal.home_team_id), bottom: matchName(officialFinal.away_team_id), topScore: officialFinal.home_score === null ? '—' : String(officialFinal.home_score), bottomScore: officialFinal.away_score === null ? '—' : String(officialFinal.away_score), status: officialFinal.status === 'finished' ? 'Finalizada' : 'Próxima' })
      if (calculatedGroups.some((group: Group) => group.teams.length > 0)) setGroups(calculatedGroups)
      if (liveMatches[0]) {
        const current = liveMatches[0]
        setMatches((previous) => previous.map((match) => match.stage === 'Cuartos de final' ? { ...match, opponent: matchName(current.home_team_id) === 'España' ? matchName(current.away_team_id) : matchName(current.home_team_id), score: current.home_score === null ? '— —' : `${current.home_team_id && matchName(current.home_team_id) === 'España' ? current.home_score : current.away_score} — ${current.home_team_id && matchName(current.home_team_id) === 'España' ? current.away_score : current.home_score}`, status: current.home_score === null ? 'En directo' : 'Finalizado' } : match))
      }
      setLastSync(new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date()))
    }).catch(() => undefined)
  }, [])

  const filteredMatches = matchFilter === 'Todos' ? matches : matches.filter((match) => match.status === matchFilter)

  return (
    <main className="app-shell">
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
        <div className="section-heading"><div><p className="section-kicker">LA AGENDA DE ESPAÑA</p><h2>El camino de la selección</h2></div><span className="data-note"><RefreshCw size={13} /> Datos sincronizados · {lastSync}</span></div>
        <div className="match-strip" id="partidos">
          {filteredMatches.map((match, index) => <article className={match.status === 'Fase final' || match.status === 'En directo' ? 'match-card next-match' : 'match-card'} key={`${match.day}-${match.opponent}`}>
            <div className="match-date"><span>{match.day}</span><small>{match.date}</small></div><div className="match-stage">{match.stage}</div>
            <div className="match-body"><div className="country"><span>🇪🇸</span><strong>España</strong></div><div className="match-result">{match.score ? <strong>{match.score}</strong> : <span className="tbd">POR CONFIRMAR</span>}<small>{match.time} · {index === matches.length - 1 ? 'Campo 1' : 'Campo 2'}</small></div><div className="country opponent"><span>{match.opponentFlag}</span><strong>{match.opponent}</strong></div></div>
            <span className={match.status === 'Finalizado' ? 'status done' : match.status === 'En directo' ? 'status live' : 'status upcoming'}>{match.status}</span>
          </article>)}
        </div>
        <div className="filter-row"><span>Mostrar:</span>{['Todos', 'Finalizado', 'En directo', 'Fase final'].map((filter) => <button className={matchFilter === filter ? 'filter active' : 'filter'} key={filter} onClick={() => setMatchFilter(filter)}>{filter}</button>)}</div>

        <div className="dashboard-grid">
          <section className="panel standings-panel" id="clasificacion"><div className="panel-heading"><div><p className="section-kicker">TABLA EN VIVO</p><h2>Clasificación</h2></div><span className="group-label">GRUPOS <ChevronDown size={15} /></span></div><div className="groups-grid">{groups.map((group) => <div className="group" key={group.name}><div className="group-title"><strong>{group.name}</strong><span>5 equipos</span></div><div className="table-head"><span># / EQUIPO</span><span>P</span><span>DG</span><span>PTS</span></div>{group.teams.map((team, index) => <div className={team[0] === 'Spain' ? 'table-row highlight' : 'table-row'} key={team[0]}><span><b>{index + 1}</b>{team[0] === 'Spain' && <span className="mini-flag">🇪🇸</span>} {team[0]}</span><span>{team[1]}</span><span>{team[5]}</span><strong>{team[6]}</strong></div>)}</div>)}</div><a className="panel-link" href="https://wtgfgateway.org/tournament/cd512e68-53d0-4e92-abbb-2311e565ddfc" target="_blank" rel="noreferrer">Ver tabla completa en Gateway <ArrowUpRight size={15} /></a></section>

          <aside className="panel live-panel"><div className="panel-heading"><div><p className="section-kicker">SEÑAL OFICIAL</p><h2>Ahora en directo</h2></div><span className="on-air"><Radio size={13} /> ON AIR</span></div><div className="video-frame"><iframe title="Directo del canal WTGF" src={`https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}&rel=0`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /><div className="video-unavailable"><CirclePlay size={38} /><strong>Canal oficial WTGF</strong><span>Si no hay emisión activa, abre YouTube para ver el último directo.</span><a href={YOUTUBE_VIDEO_URL} target="_blank" rel="noreferrer">Abrir emisión en YouTube <ExternalLink size={14} /></a></div></div><div className="live-footer"><Tv size={17} /><span><strong>World Transplant Games Federation</strong><small>Directo del canal oficial</small></span><a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer" aria-label="Abrir el canal oficial de WTGF en YouTube"><ArrowUpRight size={17} /></a></div></aside>
        </div>

        <section className="panel bracket-panel" id="bracket"><div className="panel-heading"><div><p className="section-kicker">FASE FINAL</p><h2>Camino al título</h2></div><span className="bracket-note">8 equipos · 4 cruces</span></div><div className="bracket-layout"><div className="bracket-rounds"><div className="round-label">CUARTOS DE FINAL <span>JUE 17 SEP · ACTUALIZADO</span></div>{bracket.map((game) => <div className="bracket-match" key={game.label}><span className="bracket-label">{game.label}</span><div className={game.top.includes('España') ? 'bracket-team spain' : 'bracket-team'}><span>{game.top}</span><b>{game.topScore}</b></div><div className={game.bottom.includes('España') ? 'bracket-team spain' : 'bracket-team'}><span>{game.bottom}</span><b>{game.bottomScore}</b></div><i /></div>)}</div><div className="semi-round"><div className="round-label">SEMIFINALES <span>VIE 18 SEP · FINALIZADAS</span></div>{semiFinals.map((game) => <div className="semi-match" key={game.label}><span className="bracket-label">{game.label}</span><div className={game.top.includes('España') ? 'bracket-team spain' : 'bracket-team'}><span>{game.top}</span><b>{game.topScore}</b></div><div className={game.bottom.includes('España') ? 'bracket-team spain' : 'bracket-team'}><span>{game.bottom}</span><b>{game.bottomScore}</b></div></div>)}</div><div className="bracket-final"><span className="round-label">FINAL <span>VIE 18 SEP · 13:45</span></span><div className="final-card"><Trophy size={25} /><strong>{finalMatch.top} {finalMatch.topScore} — {finalMatch.bottomScore} {finalMatch.bottom}</strong><span>{finalMatch.status} · partido decisivo</span></div></div></div><p className="bracket-footnote"><Flag size={14} /> Datos oficiales de Gateway. España jugará la final contra Inglaterra.</p></section>
      </section>

      <footer><div className="footer-brand"><span className="brand-mark small">WT</span><span>Mundial de Juegos de Trasplantados</span></div><span>Una experiencia independiente para seguir a España · No afiliada a WTGF</span><a href="https://wtgfgateway.org/tournament/cd512e68-53d0-4e92-abbb-2311e565ddfc" target="_blank" rel="noreferrer">Fuente oficial <ExternalLink size={13} /></a></footer>
    </main>
  )
}

export default App
