import { invoke } from "@tauri-apps/api/core";
import {useEffect, useState } from "react";
import { info } from "tauri-plugin-log-api";
import { Mode } from "./app";

export type Song = {
  name: String,
  length: String,
  path: String,
  rawLength: number
}

type InputProps = {
    setSongQueue: React.Dispatch<React.SetStateAction<Song[]>>,
    appMode: Mode,
    shouldReloadFiles: boolean,
    setShouldReloadFiles: React.Dispatch<React.SetStateAction<boolean>>
}

export function FileSystem({setSongQueue, appMode, shouldReloadFiles, setShouldReloadFiles}: InputProps) {
    const [directoryInput, setDirectoryInput] = useState("");
    const [directory, setDirectory] = useState<String[]>([]);
    const [filteredDirectory, setFilteredDirectory] = useState<String[]>([]);
    const [showFiles, setShowFiles] = useState(false);

    function backPath() {
        let current_directory = directoryInput;
        let li = current_directory.lastIndexOf('/');
        current_directory = current_directory.substring(0, li);
        /* info(current_directory); */
        if(current_directory.length != 0){
            queryForFiles(current_directory);
            setDirectoryInput(current_directory);
        } else {
            setShowFiles(false);
            setDirectoryInput("");
            setDirectory([]);
            setFilteredDirectory([]);
        }
    }

    useEffect(() => {
      if(shouldReloadFiles == true){
        console.log("trying to reload files")
        queryForFiles(directoryInput);
        setShouldReloadFiles(false);
      }
    }, [shouldReloadFiles])

    function filter_for_dirs_mp3(s:String): boolean {
    if(s.includes(".")){
      if(s.slice(-4) == ".mp3"){
        return true;
      } else if (s.slice(-5) == ".json"){
        return true;
      }
      return false;
    }
    /* console.log(s); */
    return true;
  }

    useEffect(() => {
        let filteredArray = directory.filter((s) => filter_for_dirs_mp3(s))
        setFilteredDirectory(filteredArray)
        /* for(let s of directory){
          info(s.valueOf());
        }
        console.log(directory); */
      }, [directory])

    function initPath() {
        console.log("opening fs")
    queryForFiles("/Users");
    setDirectoryInput("/Users");
    setShowFiles(true)
  }

  async function queryForFiles(path: string) {
    setDirectory(await invoke<String[]>("list_files", {path}));
  }

  async function openPlaylist(filePath:string){
    let s:String[] = await invoke<String[]>("get_playlist", {path: filePath});
    console.log(s)
    for(const _s of s) {
      await playFile(_s.toString());
    }
  }

  function handleFileOpen(addPath: String) {
      if(!addPath.includes(".")){
        /* console.log("opened folder"); */
        queryForFiles(directoryInput + "/" + addPath);
        setDirectoryInput(directoryInput + "/" + addPath);
      } else if(addPath.slice(-4) == ".mp3") {
        /* console.log("opened .mp3"); */
        console.log(directoryInput + "/" + addPath);
        info(directoryInput + "/" +  addPath);
        playFile(directoryInput + "/" +  addPath)
      } else if(addPath.slice(-5) == ".json") {
        openPlaylist(directoryInput + "/" +  addPath)
      }
    }

    function getSongObject(length: number, path:string) {
    let mins = Math.floor(length/60);
    let secs = length % 60;
    let song_length;
    if(secs < 10) {
      song_length = mins + ": 0" + secs
    } else {
      song_length = mins + ": " + secs
    }
    let li = path.lastIndexOf("/");
    let s_name = path.substring(li + 1);
    return {name: s_name, length : song_length, path : path, rawLength : length};
  } 

    async function playFile(path: string) {
      console.log("opened path: " + path);

      let newSong:Song;

      if(appMode == Mode.PlaySongs){
        let song_length: number = await invoke ("play_song", {filePath : path})
        newSong = getSongObject(song_length, path);
      } else {
        let song_length: number = await invoke ("get_song_length", {filePath : path})
        newSong = getSongObject(song_length, path);
      }
      
      setSongQueue(prevQueue => [...prevQueue, newSong]);
    }

    return (
        <div className = "h-full min-h-8 bg-zinc-800 w-3/12 flex flex-col">
          {!showFiles && <div className="transition-all duration-300 ease-in-out text-lg min-h-12 min-w-10 bg-zinc-300 text-zinc-950 hover:bg-zinc-900 hover:text-zinc-200 items-center flex justify-center hover:text-2xl" onClick={initPath}>
            <h1>Open Files</h1>
          </div>}
          {showFiles && <div className="transition-all duration-300 ease-in-out text-lg min-h-12 min-w-10 bg-zinc-300 text-zinc-950 hover:bg-zinc-900 hover:text-zinc-200 items-center flex justify-center hover:text-2xl" onClick={backPath}>
            <h1>Back</h1>
          </div>}
          <div className="flex-1 overflow-y-scroll scrollbar-hide scroll-smooth">
          {filteredDirectory.map((item, index) => (
            <div className="transition-all duration-300 ease-in-out min-w-full rounded-md text-m h-fit bg-zinc-900 hover:bg-zinc-300 text-zinc-200 hover:text-zinc-950 hover:text-lg mt-0.5 pl-3 py-3 items-center flex overflow-hidden" key = {index} onClick={() => handleFileOpen(item)}>{item}</div>
          ))}
          </div>
      </div>
    )
}
