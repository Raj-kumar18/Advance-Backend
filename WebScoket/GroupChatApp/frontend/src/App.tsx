import { useState } from 'react'



function App() {

  const [username, setUsername] = useState("")
  const [showNamePopup, setShowNamePopup] = useState(true)
  const [inputName, setInputName] = useState("")

  const [message, setMessage] = useState([])
  const [text, setText] = useState("")

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimed = inputName.trim()
    if (!trimed) return

    setUsername(trimed)
    setShowNamePopup(false)
  }

  function formatTime(ts) {
    const d = new Date(ts)
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")

    return `${hours}:${minutes}`
  }

  const sendMessage = () => {
    const t = text.trim()
    if (!t) return
    //User message

    const msg = {
      id: Date.now(),
      sender: username,
      text: t,
      ts: Date.now()
    }

    setMessage((prev) => [...prev, msg])
    setText("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }


  return (
    <>
      <div className='min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-inter'>

        {showNamePopup && (
          <div className='fixed inset-0 flex items-center justify-center z-40'>
            <div className='bg-white rounded-xl shadow-lg max-w-md p-6'>
              <h1 className='text-xl font-semibold text-black'>Enter your name</h1>
              <p className='text-sm text-gray-500 mt-1'>
                Enter your name to start chatting. This will be used to identify
              </p>

              <form onSubmit={handleNameSubmit} className='mt-4'>
                <input type="text" value={inputName}
                  onChange={(e) => { setInputName(e.target.value) }}
                  autoFocus
                  required
                  placeholder='Your Name' className='w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-600' />
                <button type="submit" className='w-full mt-2 py-2 px-4 bg-green-600 text-white rounded-xl cursor-pointer hover:bg-green-700 transition-colors'>Enter Chat</button>
              </form>

            </div>

          </div>
        )}

        {/* chatWindow */}

        {!showNamePopup && (
          <div className='w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-md flex flex-col overflow-hidden'>
            {/* chatHeader */}

            <div className="flex items-center gap-3 px-5 py-4 bg-[#075E54] text-white shadow-md">
              {/* Avatar */}
              <div className="h-11 w-11 rounded-full bg-green-600 flex items-center justify-center text-lg font-bold uppercase">
                {username.charAt(0)}
              </div>

              {/* Chat Info */}
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Realtime Group Chat</h2>

                <p className="text-xs text-green-100 animate-pulse">
                  Someone is typing...
                </p>
              </div>

              {/* User Info */}
              <div className="text-right">
                <p className="text-xs text-green-100">Signed in as</p>
                <p className="font-medium">{username}</p>
              </div>
            </div>

            {/* chat message list */}

            <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 flex flex-col">
              {message.map((m) => {
                const mine = m.sender === username;

                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] p-3 my-2 rounded-[18px] text-sm leading-5 shadow-sm ${mine
                        ? "bg-[#DCF8C6] text-[#303030] rounded-br-2xl"
                        : "bg-white text-[#303030] rounded-bl-2xl"
                        }`}
                    >
                      <div className="break-words whitespace-pre-wrap">
                        {m.text}
                      </div>

                      <div className="flex justify-between items-center mt-1 gap-16">
                        <div className="text-[11px] font-bold">
                          {m.sender}
                        </div>

                        <div className="text-[11px] text-gray-500 text-right">
                          {formatTime(m.ts)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* chatArea */}

            <div className="px-4 py-3 bg-white border-t">
              <div className="flex items-end gap-3 bg-zinc-100 rounded-3xl px-4 py-2">

                <textarea
                  rows={1}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent resize-none outline-none text-sm py-2"
                />

                <button
                  onClick={sendMessage}
                  className="h-11 w-11 cursor-pointer rounded-full bg-[#25D366] hover:bg-[#20bd5d] text-white flex items-center justify-center transition"
                >
                  ➤
                </button>

              </div>
            </div>


          </div>
        )}

      </div>
    </>
  )
}

export default App
