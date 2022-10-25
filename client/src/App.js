import './App.css';
import React from 'react';
import CompanyScreen from './components/CompanyScreen';
import {Routes, BrowserRouter, Route} from 'react-router-dom';

const CopyRight = () => {
  return(
    <div id="copyRight">
      <ul className='menu'>
        <li>Powered by Ethereum</li>
        <li>{"Design: "} 
          <a href='https://github.com/soso-song'>Soso Song</a>{", "}
          <a href='https://github.com/shang8024'>Sandy Shang</a>
        </li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CompanyScreen/>}/>
      </Routes>
      <CopyRight/>
    </BrowserRouter>
  );
}

export default App;
