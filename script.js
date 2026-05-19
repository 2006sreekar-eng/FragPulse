let time=30;
let hits=0;
let misses=0;
let score=0;
let gameRunning=false;
let timer;
let targetAppearTime;
let reactionTimes=[];

let socket=new WebSocket(
"wss://fragpulse-backend.onrender.com/ws"
);

socket.onopen=function(){
console.log("Connected to multiplayer server");
};

socket.onmessage=function(event){
let data=JSON.parse(event.data);

if(data.type==="leaderboard"){
let table=document.getElementById("leaderboard");
table.innerHTML="";

data.leaderboard.forEach(player=>{
table.innerHTML+=`
<tr>
<td>${player.name}</td>
<td>${player.score}</td>
<td>${player.accuracy}%</td>
<td>${player.reaction}ms</td>
</tr>
`;
});
}
};

const game=document.getElementById("game");
const target=document.getElementById("target");

function startGame(){
const username=document.getElementById("username").value.trim();

if(username===""){
alert("Enter username");
return;
}

clearInterval(timer);

time=30;
hits=0;
misses=0;
score=0;
reactionTimes=[];

document.getElementById("time").innerText=time;
document.getElementById("hits").innerText=hits;
document.getElementById("misses").innerText=misses;
document.getElementById("score").innerText=score;
document.getElementById("result").innerText="Game running...";

target.style.display="none";

let count=3;
document.getElementById("countdown").innerText=count;

let countdownTimer=setInterval(()=>{
count--;

if(count>0){
document.getElementById("countdown").innerText=count;
}
else if(count===0){
document.getElementById("countdown").innerText="GO!";
}
else{
clearInterval(countdownTimer);
document.getElementById("countdown").innerText="";
gameRunning=true;
showTarget();

timer=setInterval(()=>{
time--;
document.getElementById("time").innerText=time;

if(time<=0){
endGame();
}
},1000);
}
},1000);
}

function showTarget(){
if(!gameRunning)return;

const maxX=game.clientWidth-45;
const maxY=game.clientHeight-45;

const x=Math.random()*maxX;
const y=Math.random()*maxY;

target.style.left=x+"px";
target.style.top=y+"px";
target.style.display="block";

targetAppearTime=Date.now();
}

target.onclick=function(e){
if(!gameRunning)return;

e.stopPropagation();

hits++;
score+=10;

let reaction=Date.now()-targetAppearTime;
reactionTimes.push(reaction);

document.getElementById("hits").innerText=hits;
document.getElementById("score").innerText=score;

showTarget();
};

game.onclick=function(){
if(!gameRunning)return;

misses++;
document.getElementById("misses").innerText=misses;
};

function endGame(){
gameRunning=false;
clearInterval(timer);
target.style.display="none";

let total=hits+misses;

let accuracy=total===0?0:((hits/total)*100).toFixed(2);

let avgReaction=
reactionTimes.length===0
?0
:Math.round(reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length);

document.getElementById("result").innerText=
`Score: ${score}
Accuracy: ${accuracy}%
Reaction: ${avgReaction}ms`;

saveScore(accuracy,avgReaction);
}

function saveScore(accuracy,avgReaction){
let username=document.getElementById("username").value.trim();

if(socket.readyState===WebSocket.OPEN){
socket.send(JSON.stringify({
type:"score",
name:username,
score:score,
accuracy:accuracy,
reaction:avgReaction
}));
}
else{
alert("Multiplayer server not connected");
}
}

function loadLeaderboard(){
console.log("Leaderboard comes from multiplayer server");
}

function resetLeaderboard(){
alert("Restart Go server to reset multiplayer leaderboard");
}

function clearCurrentGame(){
clearInterval(timer);

gameRunning=false;
target.style.display="none";

document.getElementById("countdown").innerText="";

time=30;
hits=0;
misses=0;
score=0;
reactionTimes=[];

document.getElementById("time").innerText=30;
document.getElementById("hits").innerText=0;
document.getElementById("misses").innerText=0;
document.getElementById("score").innerText=0;
document.getElementById("result").innerText="Start the game to see your stats";
}