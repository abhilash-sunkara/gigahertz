import { invoke } from "@tauri-apps/api/core";
import "./globals.css";
import OverLayBar from "./overlay_bar";
import {info} from '@tauri-apps/plugin-log'
import { useRef, useState } from "react";
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { FileSystem } from "./file_system";
import { MdOutlinePauseCircleFilled, MdOutlinePlayCircleFilled, MdSkipNext } from "react-icons/md";

type Song = {
  name: String,
  length: String
}

function App() {
  const [songQueue, setSongQueue] = useState<Song[]>([]);
  const hasInitialized = useRef(false);

  function removeTopSongFromQueue() {
    setSongQueue(prevQueue => prevQueue.slice(1));
  }

  /* const unlisten = getCurrentWindow().listen('audio-ended', () => {
    console.log(`Ended song`);
  }); */

  useEffect(() => {
    console.log("edited song queue");
    console.log(songQueue)
  }, [songQueue])

  async function pauseSong() {
    await invoke("pause_song", {});
  }

  async function skipSong() {
    await invoke("skip_song", {});
    removeTopSongFromQueue();
  }

  async function unPauseSong() {
    await invoke("unpause_song", {});
  }

  /* useEffect(() => {
    for(let s of filteredDirectory){
      info(s.valueOf());
    }
    console.log(filteredDirectory);
  }, [filteredDirectory]) */

  useEffect(() => {
    if (!hasInitialized.current) {
      console.info("useEffectHook");
      createAudioHandler();
      hasInitialized.current = true;

      getCurrentWindow().listen('audio-ended', () => {
        console.log(`Ended song`);
        removeTopSongFromQueue()
      });
    }
  }, []);

  async function createAudioHandler() {
    /* info("function ran on mount"); */
    await invoke("set_audio_device", {});
    await invoke("set_audio_sink", {});
  }

  return (
    <main className="w-full h-full bg-zinc-700" style = {{overflow : "hidden"}}>
      <OverLayBar/>
      {/* <button onClick={() => {add_sine_to_sink()}}>sine</button>
      <button onClick={() => {add_saw_to_sink()}}>saw</button>
      <button onClick={() => {add_square_to_sink()}}>square</button> */}
      <div className="w-full h-full flex">
        <FileSystem songQueue={songQueue} setSongQueue={setSongQueue}/>
        <div className = "w-full h-full">
          <div className = "w-full h-8 bg-violet-200 flex justify-end items-center">
            <div className="text-violet-950 hover:text-zinc-900" onClick={skipSong}>
              <MdSkipNext size = {28}/>
            </div>
            <div className="text-violet-950 hover:text-zinc-900" onClick={pauseSong}>
              <MdOutlinePauseCircleFilled size = {28}/>
            </div>
            <div className="text-violet-950 hover:text-zinc-900" onClick={unPauseSong}>
              <MdOutlinePlayCircleFilled size = {28}/>
            </div>
          </div>
          {songQueue.map((item, index) => (
            <div key = {index} className="w-full h-6 bg-zinc-800 text-zinc-200">{item.name}</div>
          )) }
        </div>
      </div>
    </main>
  );
}

export default App;