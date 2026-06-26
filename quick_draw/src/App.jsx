import { useState } from "react";
import logo from './assets/logo.png'
import boss0Image from './assets/ingame_background.png';
import './App.css';
import revolver from './assets/revolver.png'
import Boss from './bossBattle.jsx'


function App() {
  const [bossindex, setBossindex] = useState(0);
  const [battlemod, Setbattlemod] = useState(false);

  const bossList = [
    {
      id: 0,
      name: "무법자",
      image: boss0Image,
      limitTime: 1400 
    },
    {
      id:1,
      name: "무빙맨",
      image: boss0Image,
      limitTime: 2400
    },
    {
      id: 2,
      name: "디럭스파이터",
      image: boss0Image,
      limitTime: 2540
    },
    {
      id: 3,
      name: "아서모건",
      image: boss0Image,
      limitTime: 4
    },
  ]
  const currentBoss = bossList[bossindex];
  
  return (
    <>
    {!battlemod ? (
      <div>
        <div id="logo_box">
        <img src={logo} id="logo"></img>
      </div>

      <div id="boss_select_container">
        <button onClick={()=> { //보스 좌 선택 버튼
          if(bossindex == 0) { //보스0보다 왼쪽으로 가면 가장 마지막 보스부터 다시보여줌
            setBossindex(bossList.length-1);
          }
          else {
            setBossindex(bossindex -1);
          }
        }}><img id="button1" src={revolver}></img></button>
        <div id="boss_box">
          <h1>{currentBoss.name}</h1>
          <img src={currentBoss.image} onClick={ () => {
            Setbattlemod(true);
          }
          }></img>
        </div>
        <button onClick={()=> { //보스 우 선택 버튼
          if(bossindex == bossList.length -1) { //보스 index보다 오른쪽으로 가면 0번 보스부터 다시 보여줌
            setBossindex(0);
          }
          else {
            setBossindex(bossindex + 1);
          }
        }}><img id="button2" src={revolver}></img></button>
      </div>
      </div>
    ) : (
      <Boss bossData={currentBoss}></Boss>
    )}
    </>
  )
}

export default App;