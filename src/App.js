import { Route, Routes } from "react-router-dom";
import Checklist from "./pages/checklist/checklist";
import Login from "./pages/login/login";
import Mypage from "./pages/mypage/mypage";
import MypageEdit from './pages/editpage/editpage';
import Signup from "./pages/signup/signup";
import Start from "./pages/start/start";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/Mypage" element={<Mypage />} />
      <Route path="/MypageEdit" element={<MypageEdit />} />
      <Route path="/Checklist" element={<Checklist />} />
    </Routes>
  );
}


export default App;
