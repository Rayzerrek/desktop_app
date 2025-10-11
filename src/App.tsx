import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {

  const [wynik, setWynik] = useState<number>(0);

  async function addNumbers(a:number, b:number) {
    const result = await invoke('add_numbers', {a,b})
    setWynik(result as number)
  }

  return (
    <div>
      <button className="bg-blue-500" onClick={() => addNumbers(1,2)}>Add Numbers</button>
      <div className="text-2xl">{wynik}</div>
    </div>
  );
}

export default App;
