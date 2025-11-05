import { useState, useEffect } from 'react'
import { toHTML } from "@odiffey/discord-markdown"
import channelList from "./channels.json"
import './App.css'

interface Category {
  icon: string;
  explanation: string
}

interface Message {
  command: string;
  counter: number;
  message: string;
  categoryId: string;
}

interface NoteFile {
  categories: Category[];
  messages: Message[];
}

interface ChannelListEntry {
  id: string,
  name: string
}

function formatCategoryIcon(icon: string) {
  if (!/^\d+$/.test(icon)) {
    return <span>{decodeURIComponent(icon)}</span>
  }
  else {
    return (<img
      src={`https://cdn.discordapp.com/emojis/${icon}.png`}
      style={{width: "1em"}}
      />)
  }
}
function APIDiscordMarkdownParse(content: string) {
  return toHTML(content, {
    discordCallback: {
      channel: node => '#' + (channelList as ChannelListEntry[]).find(channel => channel.id == node.id)?.name || '#unknown-channel'
    }
  })
}
function App() {
  const noteFilePath = "https://raw.githubusercontent.com/Token07/botty-notes/refs/heads/master/info_data.json";
  const welcomeMessagePath = "https://raw.githubusercontent.com/Token07/botty-notes/refs/heads/master/message.markdown";

  const [noteFile, setNoteFile] = useState<NoteFile | null>();
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    fetch(noteFilePath).then((res) => {
      if (res.ok) return res.json();
    }).then((json: NoteFile) =>{
      setNoteFile(json);
    })
  }, []);
  useEffect(() => {
    fetch(welcomeMessagePath).then((res) => {
      if (res.ok) return res.text();
    }).then((body) =>{
      setWelcomeMessage(body);
    })
  }, []);

  return (
    <>
    <h1>Botty Notes</h1>
    <div>
      {noteFile?.categories?.map((category) => (
        <button
          key={category.icon}
          title={category.explanation}
          onClick={() => setSelectedCategory(category.icon)}
          >
            {formatCategoryIcon(category.icon)}
          </button>
      ))}
    </div>
    {!selectedCategory && ( <div key="welcome" style={{textAlign: "left", whiteSpace: "pre-wrap", maxWidth: "80%"}} dangerouslySetInnerHTML={{__html: APIDiscordMarkdownParse(welcomeMessage || "")}}></div> ) }
    {selectedCategory && ( 
    <div>
      {noteFile?.messages.filter(note => note.categoryId.indexOf(selectedCategory) !== -1).map(note => (
        <div key={note.command} style={{textAlign: "left", whiteSpace: "pre-wrap", maxWidth: "80%"}}>
          <h2>{note.command}</h2>
          <div dangerouslySetInnerHTML={{__html: APIDiscordMarkdownParse(note.message)}}></div>
        </div>
      ))}
    </div>)}
    </>
  )
}

export default App
