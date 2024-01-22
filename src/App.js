import './App.css';
import { Mapper } from './mapper.js';

function App() {
  return (
    <div className="App">
      <header className="App-header">
	  <Mapper entranceDefs="./AllRooms.json" />
      </header>
    </div>
  );
}

export default App;
