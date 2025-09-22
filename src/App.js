import { Route, Routes } from "react-router-dom";
import Checklist from "./pages/checklist/checklist";
import Login from "./pages/login/login";
import Mypage from "./pages/mypage/mypage";
import MypageEdit from './pages/editpage/editpage';
import Signup from "./pages/signup/signup";
import Start from "./pages/start/start";
import {Navigate, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<Signup />} />
<<<<<<< HEAD
      <Route path="/Mypage" element={<Mypage />} />
      <Route path="/MypageEdit" element={<MypageEdit />} />
      <Route path="/Checklist" element={<Checklist />} />
=======
      <Route path="/Mypage" element={<Mypage onEdit={() => navigate("/MypageEdit")} />} />
      <Route
        path="/MypageEdit"
        element={<MypageEdit onCancel={() => navigate("/Mypage")} onSaved={() => navigate("/Mypage")} />}
      />
      <Route path="/Checklist" element={<Checklist />} />
      <Route path="*" element={<Navigate to="/Mypage" replace />} />
>>>>>>> e990d0c (나머지 수정)
    </Routes>
  );
}


export default App;
