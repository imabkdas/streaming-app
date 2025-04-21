import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home'
import Room from './components/Room'
import './App.css';



function App() {
  return (
		<Router>
			<Routes>
				{/* Use the actual imported Home component here */}
				<Route path="/" element={<Home />} /> 
				<Route path='/room' element={<Room />} />
			</Routes>
		</Router>
  );
}

export default App;
