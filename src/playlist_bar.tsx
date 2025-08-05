

type InputProps = {
    createPlaylist : () => {},
    setPlaylistName: React.Dispatch<React.SetStateAction<string>>,

}

export function PlaylistBar({createPlaylist, setPlaylistName} : InputProps){
    return (
        <div className="h-full">
            <div className = "w-full h-[91.666666666%]">
            </div>
          <div className = "w-full h-1/12 bg-violet-200 flex flex-col items-center justify-evenly">
            <div className="flex flex-row">
              <div className="w-fit h-fit p-3 bg-violet-500 mr-4 rounded-md">
                Playlist Name
              </div> 
              <input placeholder="playlist.ghp" name = {"Playlist Name"} className="transition-all duration-300 ease-in-out p-3 rounded-md focus-within:rounded-2xl" onChange={(e) => setPlaylistName(e.currentTarget.value)}/>
              <div className="w-fit h-fit p-3 bg-zinc-900 ml-4 rounded-md hover:bg-violet-950" onClick = {() => {createPlaylist()}}>
                Create JSON File
              </div>
            </div>
          </div>
        </div>
    )
}