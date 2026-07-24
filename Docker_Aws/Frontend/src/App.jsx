import './App.css'
import { Editor } from "@monaco-editor/react"
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { MonacoBinding } from "y-monaco"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
import { io } from "socket.io-client"

function App() {
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })

  const [users, setUsers] = useState([])

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])

  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);

  const handleMount = (editor) => {
    editorRef.current = editor;

    const provider = new SocketIOProvider(
      "/",
      "monaco",
      ydoc,
      {
        autoConnect: true,
      }
    );

    providerRef.current = provider;

    bindingRef.current = new MonacoBinding(
      yText,
      editor.getModel(), // ✅ getModel()
      new Set([editor]),
      provider.awareness
    );

    provider.awareness.setLocalStateField("user", {
      username,
    });

    provider.awareness.on("change", () => {
      const states = Array.from(provider.awareness.getStates().values());

      setUsers(
        states
          .filter((state) => state?.user)
          .map((state) => state.user)
      );
    });
  };

  useEffect(() => {
    function handleBeforeUnload() {
      providerRef.current?.awareness.setLocalStateField("user", null);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      providerRef.current?.disconnect();
      bindingRef.current?.destroy();
      ydoc.destroy();

      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!providerRef.current) return;

    providerRef.current.awareness.setLocalStateField("user", {
      username,
    });
  }, [username]);

  const handleJoin = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value)
    window.history.pushState({}, "", `/editor?username=${e.target.username.value}`)
  }

  if (!username) {
    return (
      <form onSubmit={handleJoin} className="h-screen w-full bg-gray-950 flex justify-center items-center">
        <div className="w-full max-w-md bg-neutral-800 rounded-xl p-6 flex gap-3">
          <input
            type="text"
            placeholder="Enter your username"
            name='username'
            className="flex-1 bg-neutral-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            className="bg-green-500 hover:bg-green-600 transition text-white px-5 py-2 rounded-lg"
          >
            Join
          </button>
        </div>
      </form>
    )
  }

  return (
    <>
      <main className='h-screen w-full bg-gray-950 flex gap-4 p-2 overflow-hidden'>
        <aside className=' h-screen w-1/4 bg-amber-100 rounded-xl flex flex-col'>
          <h1 className="text-2xl font-bold px-4 py-2 border-b border-neutral-300">Users</h1>
          {users.map((user, index) => (
            <div key={index} className='p-2 border-b border-neutral-300'>
              {user.username}
            </div>
          ))}

        </aside>
        <section className='h-screen w-11/12 bg-neutral-800 rounded-xl'>
          <Editor
            height="90vh"
            defaultLanguage="javascript"
            defaultValue="// some comment"
            theme='vs-dark'
            onMount={handleMount}
          />

        </section>
      </main>
    </>

  )
}

export default App
