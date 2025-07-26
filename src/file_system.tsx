import { invoke } from "@tauri-apps/api/core";
import {useEffect, useState } from "react";
import { info } from "tauri-plugin-log-api";

type Song = {
  name: String,
  length: String
}

type InputProps = {
    songQueue: Song[],
    setSongQueue: React.Dispatch<React.SetStateAction<Song[]>>;
}

export function FileSystem({songQueue, setSongQueue}: InputProps) {
    const [directoryInput, setDirectoryInput] = useState("");
    const [directory, setDirectory] = useState<String[]>([]);
    const [filteredDirectory, setFilteredDirectory] = useState<String[]>([]);
    const [showFiles, setShowFiles] = useState(false);

    function backPath() {
        let current_directory = directoryInput;
        let li = current_directory.lastIndexOf('\\');
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

    function filter_for_dirs_mp3(s:String): boolean {
    if(s.includes(".")){
      if(s.slice(-4) == ".mp3"){
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
    queryForFiles("\\Users");
    setDirectoryInput("\\Users");
    setShowFiles(true)
  }

  async function queryForFiles(path: string) {
    setDirectory(await invoke<String[]>("list_files", {path}));
  }

  function handleFileOpen(addPath: String) {
      if(!addPath.includes(".")){
        /* console.log("opened folder"); */
        queryForFiles(directoryInput + "\\" + addPath);
        setDirectoryInput(directoryInput + "\\" + addPath);
      } else {
        /* console.log("opened .mp3"); */
        info(directoryInput + "\\" +  addPath);
        playFile(directoryInput + "\\" +  addPath)
      }
    }

    function getSongObject(length: number, path:string) {
    let mins = Math.floor(length/60);
    let secs = length % 60;
    let li = path.lastIndexOf("\\");
    let s_name = path.substring(li + 1);
    return {name: s_name, length : mins + ": " + secs};
  } 

    async function playFile(path: string) {
    /* console.log("opened path: " + path); */
    let song_length: number = await invoke ("play_song", {filePath : path})
    const newSong = getSongObject(song_length, path);

    setSongQueue(prevQueue => [...prevQueue, newSong]);
  }

    return (
        <div className = "w-fit max-w-1/4 h-full bg-zinc-800 min-w-44 flex flex-col flex-nowrap">
        {/* <form onSubmit={(e) => {
          e.preventDefault();
          queryForFiles(directoryInput);
        }} className="w-fit">
            <input className="w-fit text-2xl m-1" type="text" onChange={(e) => setDirectoryInput(e.currentTarget.value)}
          placeholder="Enter a directory..." />
            {/* <button type="submit">Greet</button> 
        </form> */}
        {!showFiles && <div className="min-h-6 min-w-10 bg-zinc-300 text-zinc-950 hover:bg-zinc-900 hover:text-zinc-200" onClick={initPath}>
          <h1>Open File Directory</h1>
        </div>}
        {showFiles && <div className="min-h-6 min-w-10 bg-zinc-300 text-zinc-950 hover:bg-zinc-900 hover:text-zinc-200" onClick={backPath}>
          <h1>Back</h1>
        </div>}
        {filteredDirectory.map((item, index) => (
          <div className="min-w-full h-6 bg-zinc-900 hover:bg-zinc-300 text-zinc-200 hover:text-zinc-950" key = {index} onClick={() => handleFileOpen(item)}>{item}</div>
        ))}
        
      </div>
    )
}

export type {Song};
