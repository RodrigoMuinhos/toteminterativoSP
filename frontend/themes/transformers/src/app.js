const panel=document.querySelector('main')
const pad=panel.querySelector('.scan-pad')
const entry=panel.querySelector('.poster-entry')
const autobots=panel.querySelector('.autobots')
const status=panel.querySelector('[role="status"]')
const returnGlow=panel.querySelector('.return-glow')
const reduced=matchMedia('(prefers-reduced-motion: reduce)')
const home=panel.querySelector('.kioskHome')
const IDLE_TIMEOUT=15000
let idle=null
function resetIdle(){
  clearTimeout(idle);idle=null
  if(state!=='poster')idle=setTimeout(reset,IDLE_TIMEOUT)
}
const chargeDuration=5000
let state='poster',audio,animation,restart,held=null,charge=0,holdStarted=0,lastBeep=0

function display(next,message){
  state=next
  home.hidden=next==='poster'
  if(next==='poster'){clearTimeout(idle);idle=null}
  else if(idle===null)resetIdle()
  panel.className=next
  status.textContent=message
  pad.disabled=!['idle','scanning'].includes(next)
  entry.disabled=next!=='poster'
  autobots.hidden=!['select','transform','robot','squad','squad-win'].includes(next)
}

function tone(at,start,end,duration,level,type='sine'){
  const oscillator=audio.createOscillator()
  const gain=audio.createGain()
  oscillator.type=type
  oscillator.frequency.setValueAtTime(start,at)
  oscillator.frequency.exponentialRampToValueAtTime(end,at+duration)
  gain.gain.setValueAtTime(.001,at)
  gain.gain.linearRampToValueAtTime(level,at+Math.min(.03,duration/2))
  gain.gain.exponentialRampToValueAtTime(.001,at+duration)
  oscillator.connect(gain)
  gain.connect(audio.destination)
  oscillator.start(at)
  oscillator.stop(at+duration)
}

function scanAudio(){
  const Context=window.AudioContext||window.webkitAudioContext
  if(!Context)return
  try{
    audio??=new Context()
    audio.resume().catch(()=>{})
  }catch{}
}

function chargeProgress(fraction){
  return reduced.matches?Math.floor(fraction*8)/8:.14*fraction+.86*Math.pow(fraction,2.55)
}

function drawCharge(now){
  const fraction=Math.min(1,(charge+now-holdStarted)/chargeDuration)
  progress(chargeProgress(fraction))
  if(audio?.state==='running'&&now-lastBeep>=540-450*fraction){
    const pitch=300+fraction*620
    tone(audio.currentTime,pitch,pitch*1.19,.075,.058,'triangle')
    lastBeep=now
  }
  if(fraction===1){
    held=null
    suspense()
  }else{
    animation=requestAnimationFrame(drawCharge)
  }
}

function startHold(source){
  if(held!==null||!['idle','scanning'].includes(state))return
  held=source
  holdStarted=performance.now()
  lastBeep=holdStarted-540
  display('scanning','Scan em andamento.')
  if(charge===0&&!reduced.matches){
    panel.querySelector('.beam').animate([
      {opacity:.35},{opacity:1},{opacity:.8},{opacity:1}
    ],{duration:480,easing:'ease-out'})
  }
  scanAudio()
  animation=requestAnimationFrame(drawCharge)
}

function endHold(source){
  if(held!==source)return
  held=null
  cancelAnimationFrame(animation)
  charge=Math.min(chargeDuration,charge+performance.now()-holdStarted)
  if(charge===chargeDuration){suspense();return}
  const fraction=charge/chargeDuration
  progress(chargeProgress(fraction))
  status.textContent='Scan pausado. Pressione novamente para continuar.'
}
function animate(duration,update,done){
  const start=performance.now()
  function tick(now){
    const fraction=Math.min(1,(now-start)/duration)
    update(fraction)
    if(fraction===1)done()
    else animation=requestAnimationFrame(tick)
  }
  animation=requestAnimationFrame(tick)
}

function progress(fraction){
  panel.style.setProperty('--scan',fraction*100+'%')
}

function reset(keepGlow=false){
  if(!keepGlow)returnGlow.classList.remove('lit')
  pieceDrag=null
  autobots.replaceChildren()
  cancelAnimationFrame(animation)
  clearTimeout(restart)
  charge=0
  held=null
  progress(0)
  display('poster','Toque no pôster para começar.')
}

function returnToPoster(delay){
  clearTimeout(restart)
  restart=setTimeout(()=>{
    returnGlow.classList.add('lit')
    restart=setTimeout(()=>reset(true),420)
  },delay)
}
returnGlow.addEventListener('animationend',()=>returnGlow.classList.remove('lit'))

function finish(){
  display('complete','Optimus Prime ativado.')
  returnToPoster(1800)
  if(audio?.state==='running'){
    const now=audio.currentTime
    for(const [index,note] of [261.63,392,523.25,659.25].entries()){
      tone(now+index*.12,note,note,.38,.075)
    }
  }
}

function suspense(){
  progress(1)
  display('primed','Energia completa. Preparando a revelação.')
  if(audio?.state==='running'){
    const now=audio.currentTime
    tone(now,86,180,.83,.06,'triangle')
    tone(now+.42,220,440,.62,.065)
  }
  restart=setTimeout(sweep,1150)
}

function sweep(){
  progress(0)
  display('sweep','Scan final.')
  if(audio?.state==='running')tone(audio.currentTime,460,1180,1.15,.095,'triangle')
  animate(900,t=>progress(t),showLight)
}

function showLight(){
  display('light','Revelação em andamento.')
  if(audio?.state==='running')tone(audio.currentTime,620,1260,.46,.064)
  restart=setTimeout(finish,650)
}

const roster=[
  {id:'optimus',name:'Optimus Prime',color:'#70b9ff'},
  {id:'bumblebee',name:'Bumblebee',color:'#ffd164'},
  {id:'ratchet',name:'Ratchet',color:'#d7f6ff'},
  {id:'windblade',name:'Windblade',color:'#ff7191'},
  {id:'wheeljack',name:'Wheeljack',color:'#91edb7'}
]
const frameUrl=(id,step)=>'frames/'+id+'/'+step+'.webp'
const frameOrder=[0,5,1,6,2,7,3,8,4]
const framesCache=new Map()
let selected
function loadFrames(id){
  if(!framesCache.has(id)){
    const loading=Promise.all(frameOrder.map(step=>{
      const img=new Image()
      img.src=frameUrl(id,step)
      return img.decode()
    })).catch(error=>{framesCache.delete(id);throw error})
    framesCache.set(id,loading)
  }
  return framesCache.get(id)
}
function showRoster(){
  clearTimeout(restart)
  display('select','Escolha um dos cinco Autobots.')
  autobots.innerHTML=
    '<header><p>Autobots</p><h1>Escolha seu personagem</h1></header><div class="tf-roster">'+roster.map(robot=>
    '<button class="tf-band" data-robot="'+robot.id+'" style="--accent:'+robot.color+'">'+
    '<img src="'+frameUrl(robot.id,4)+'" alt="" draggable="false"><strong>'+robot.name+'</strong></button>').join('')+'</div>'
  for(const robot of roster)loadFrames(robot.id).catch(()=>{})
}
async function transformRobot(robot){
  if(state!=='select'&&state!=='robot')return
  clearTimeout(restart)
  returnGlow.classList.remove('lit')
  selected=robot
  display('transform','Transformação de '+robot.name+'.')
  autobots.innerHTML=
    '<div class="tf-stage" style="--accent:'+robot.color+'">'+
    '<img class="tf-figure" src="'+frameUrl(robot.id,0)+'" alt="Veículo de '+robot.name+'">'+
    '<i class="tf-energy" aria-hidden="true"></i><h2>'+robot.name+'</h2></div>'
  const figure=autobots.querySelector('.tf-figure')
  scanAudio()
  try{await loadFrames(robot.id)}
  catch{
    if(!figure.isConnected)return
    display('robot','A sequência não carregou. Tente novamente.')
    returnToPoster(3000)
    return
  }
  if(!figure.isConnected)return
  const effect=autobots.querySelector('.tf-energy')
  const delays=reduced.matches?[350,550,750,950,1150,1350,1550,1750]:[500,790,1060,1320,1570,1810,2040,2270]
  function advance(step){
    const final=step===frameOrder.length-1
    if(!reduced.matches){
      const previous=figure.cloneNode()
      previous.alt=''
      previous.setAttribute('aria-hidden','true')
      figure.before(previous)
      const dissolve=previous.animate([{opacity:1},{opacity:0}],{duration:130,fill:'forwards'})
      dissolve.finished.then(()=>previous.remove(),()=>previous.remove())
      figure.animate([{opacity:.18},{opacity:1}],{duration:155})
      if(final||step===3||step===6)effect.animate([{opacity:final?.85:.38},{opacity:0}],{duration:360})
    }
    figure.src=frameUrl(robot.id,frameOrder[step])
    figure.alt=final?robot.name+' em forma de robô':'Transformação de '+robot.name
    if(audio?.state==='running'){
      tone(audio.currentTime,120+step*55,200+step*90,.22,.05,'triangle')
    }
    if(!final){restart=setTimeout(()=>advance(step+1),delays[step]-delays[step-1]);return}
    display('robot',robot.name+' transformado.')
    if(robot.id==='optimus')autobots.querySelector('.tf-stage').insertAdjacentHTML('beforeend',
      '<div class="tf-actions"><button data-action="scan">Iniciar scan</button></div>')
    returnToPoster(6000)
  }
  restart=setTimeout(()=>advance(1),delays[0])
}
const experiences=['energize','transform','squad']
let lastExperience
function startExperience(){
  const options=experiences.filter(item=>item!==lastExperience)
  lastExperience=options[Math.floor(Math.random()*options.length)]
  if(lastExperience==='energize'){
    display('idle','Pressione e segure na área da mão para carregar o scan.')
  }else if(lastExperience==='transform'){
    showRoster()
  }else{
    startSquad()
  }
}

const eyePositions={
  optimus:[58,15.5],bumblebee:[54,18.2],ratchet:[44,13.9],
  windblade:[63,18.8],wheeljack:[53,17.5]
}
let squad=[]
const fitted=new Set()
let picked=null
let pieceDrag=null
function squadFigure(robot){
  const [x,y]=eyePositions[robot.id]
  return '<span class="squad-figure" style="--eye-x:'+x+'%;--eye-y:'+y+'%;--accent:'+robot.color+'">'+
    '<img src="'+frameUrl(robot.id,4)+'" alt="" draggable="false"><i class="squad-eyes" aria-hidden="true"></i></span>'
}
const badgeOutline='M242 21H423L430 50 463 8 492 0H732L769 49 777 21H958L903 264 868 286 891 296 873 484 777 566 754 534 754 582 713 619 701 587 695 630H505L499 587 486 619 446 582 446 534 424 566 327 484 309 296 332 284 297 265Z M515 94Q600 77 685 94L600 150Z M403 339L446 372V523L363 454 346 273 403 313Z M797 339L754 372V523L837 454 854 273 797 313Z'
const badgeSections=[0,214,422,630]
function badgeIcon(index,outline=false){
  const start=badgeSections[index],height=badgeSections[index+1]-start
  const shape=outline?'<path class="badge-outline" fill-rule="evenodd" d="'+badgeOutline+'"/>':
    '<image href="emblema-autobot.webp" width="1200" height="630" clip-path="url(#badge-mask)"/>'
  return '<svg viewBox="240 '+start+' 720 '+height+'" aria-hidden="true">'+shape+'</svg>'
}
function startSquad(){
  returnGlow.classList.remove('lit')
  clearTimeout(restart)
  const pool=[...roster]
  squad=Array.from({length:3},()=>pool.splice(Math.floor(Math.random()*pool.length),1)[0])
  fitted.clear()
  picked=null
  pieceDrag=null
  const order=[1,2,0]
  display('squad','Monte o símbolo para despertar o esquadrão.')
  autobots.innerHTML='<header><h1>Monte o símbolo</h1><p>Autobots</p></header>'+
    '<svg class="badge-defs" width="0" height="0" aria-hidden="true"><defs><clipPath id="badge-mask"><path clip-rule="evenodd" d="'+badgeOutline+'"/></clipPath></defs></svg>'+
    '<div class="badge-board" aria-label="Encaixes do símbolo Autobot">'+
    badgeSections.slice(0,-1).map((_,i)=>'<button class="badge-slot" data-slot="'+i+'" aria-label="Encaixe '+(i+1)+'">'+badgeIcon(i,true)+'</button>').join('')+'</div>'+
    '<div class="badge-tray" aria-label="Peças do símbolo">'+order.map(i=>
      '<button class="badge-piece" data-piece="'+i+'" aria-label="Peça '+(i+1)+'" aria-pressed="false">'+badgeIcon(i)+'</button>').join('')+'</div>'
}
function pickPiece(index){
  picked=index
  autobots.querySelectorAll('[data-piece]').forEach(button=>button.setAttribute('aria-pressed',Number(button.dataset.piece)===index))
}
function fitPiece(index){
  if(state!=='squad'||picked===null||fitted.has(index))return
  if(index!==picked){
    const slot=autobots.querySelector('[data-slot="'+index+'"]')
    if(!reduced.matches)slot.animate([{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'none'}],{duration:190})
    return
  }
  fitted.add(index)
  pickPiece(null)
  const piece=autobots.querySelector('[data-piece="'+index+'"]')
  const slot=autobots.querySelector('[data-slot="'+index+'"]')
  piece.disabled=true
  piece.classList.add('used')
  slot.disabled=true
  slot.classList.add('fitted')
  slot.innerHTML=badgeIcon(index)
  status.textContent=fitted.size+' de 3 peças encaixadas.'
  scanAudio()
  if(audio?.state==='running')tone(audio.currentTime,340+fitted.size*120,680+fitted.size*140,.22,.065,'triangle')
  clearTimeout(restart)
  if(fitted.size===3){
    autobots.querySelector('.badge-board').classList.add('powered')
    restart=setTimeout(squadWin,850)
  }
}
autobots.addEventListener('pointerdown',event=>{
  const piece=event.target.closest('[data-piece]')
  if(state!=='squad'||!piece||piece.disabled||!event.isPrimary||event.button!==0)return
  pieceDrag={piece,id:event.pointerId,x:event.clientX,y:event.clientY,ghost:null}
  piece.setPointerCapture(event.pointerId)
})
autobots.addEventListener('pointermove',event=>{
  if(pieceDrag?.id!==event.pointerId)return
  if(!pieceDrag.ghost&&Math.hypot(event.clientX-pieceDrag.x,event.clientY-pieceDrag.y)>8){
    pickPiece(Number(pieceDrag.piece.dataset.piece))
    const ghost=pieceDrag.piece.cloneNode(true)
    ghost.className='badge-ghost'
    ghost.setAttribute('aria-hidden','true')
    ghost.tabIndex=-1
    autobots.append(ghost)
    pieceDrag.ghost=ghost
  }
  if(pieceDrag.ghost){
    const rect=autobots.getBoundingClientRect()
    pieceDrag.ghost.style.left=event.clientX-rect.left+'px'
    pieceDrag.ghost.style.top=event.clientY-rect.top+'px'
  }
})
for(const type of ['pointerup','pointercancel','lostpointercapture']){
  autobots.addEventListener(type,event=>{
    if(pieceDrag?.id!==event.pointerId)return
    const ghost=pieceDrag.ghost
    pieceDrag=null
    if(!ghost)return
    ghost.remove()
    if(type==='pointerup'){
      const slot=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-slot]')
      if(slot)fitPiece(Number(slot.dataset.slot))
    }
  })
}
function squadWin(){
  display('squad-win','Esquadrão Autobot desperto!')
  autobots.innerHTML='<header><h1>Esquadrão desperto!</h1></header>'+
    '<div class="squad-lineup">'+squad.map(squadFigure).join('')+'</div>'
  if(audio?.state==='running'){
    const now=audio.currentTime
    for(const [index,note] of [261.63,392,523.25,659.25].entries())tone(now+index*.12,note,note,.38,.075)
  }
  returnToPoster(9000)
}
entry.addEventListener('click',()=>{if(state==='poster')startExperience()})
autobots.addEventListener('click',event=>{
  const button=event.target.closest('button')
  if(!button)return
  if(state==='squad'&&button.dataset.piece!==undefined&&!button.disabled){
    pickPiece(Number(button.dataset.piece));return
  }
  if(state==='squad'&&button.dataset.slot!==undefined){
    fitPiece(Number(button.dataset.slot));return
  }
  if(button.dataset.robot&&state==='select'){
    const robot=roster.find(item=>item.id===button.dataset.robot)
    if(robot)transformRobot(robot)
    return
  }
  const action=button.dataset.action
  if(action==='scan'&&state==='robot'&&selected?.id==='optimus'){
    clearTimeout(restart)
    returnGlow.classList.remove('lit')
    display('idle','Pressione e segure na área da mão para carregar o scan.')
  }
})

pad.addEventListener('contextmenu',event=>event.preventDefault())
pad.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0||held!==null)return
  event.preventDefault()
  pad.setPointerCapture(event.pointerId)
  startHold(event.pointerId)
})
for(const event of ['pointerup','pointercancel','lostpointercapture']){
  pad.addEventListener(event,e=>endHold(e.pointerId))
}
const holdKey=event=>event.key===' '||event.key==='Enter'
pad.addEventListener('keydown',event=>{
  if(!holdKey(event))return
  event.preventDefault()
  if(!event.repeat)startHold('keyboard')
})
pad.addEventListener('keyup',event=>{
  if(holdKey(event)){event.preventDefault();endHold('keyboard')}
})
pad.addEventListener('blur',()=>endHold('keyboard'))
window.addEventListener('blur',()=>{if(held!==null)endHold(held)})

panel.addEventListener('click',event=>{
  if(event.target.closest('[data-action="home"]'))reset()
})
for(const type of ['pointerdown','pointerup','click','keydown'])panel.addEventListener(type,resetIdle,true)
panel.addEventListener('pointermove',event=>{if(event.buttons||event.pressure)resetIdle()},true)
panel.addEventListener('contextmenu',event=>event.preventDefault())
