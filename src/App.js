import React from 'react';
import { Routes, Route } from "react-router-dom";
import Start from './pages/start/start';
import Login from './pages/login/login';
import Signup from './pages/signup/signup';
import Mypage from './pages/mypage/mypage';
import MypageEdit from './pages/mypage/mypageEdit';
import Checklist from './pages/checklist/checklist';


function App() {
    return (
        <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/Mypage" element={<Mypage />} />
            <Route path="/MypageEdit" element={<MypageEdit />} />  {/* /Mymenu 경로 추가 */}
            <Route path={"/Checklist"} element={<Checklist />} /> {/* /Result 경로 추가 */}
        </Routes>
    );
}

export default App;
