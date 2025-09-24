import { Link } from "react-router-dom";
import "./login.css";
import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const Login = () => {

  const navigate = useNavigate();

  // 입력 받을값을 state로 관리
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {

    event.preventDefault();

    // API 요청시 보낼 데이터 객체
    const requestData = {
      studentId: studentId,
      password: password,
    };

    try{
      const response = await axios.post("/api/auth/login", requestData)
      if (response.data && response.data.success){
        // 서버에서 success: true를 보냈을 경우
        localStorage.setItem('token', response.data.token);
        // alert(response.data.message || "로그인에 성공했습니다.");
        navigate('/checklist'); // 로그인 성공 시 mypage로 이동
      }else{
        // 서버에서 success: false를 보냈을 경우
        alert(response.data.message || '학번 또는 비밀번호를 확인해주세요.');
      }
    } catch(error){
      console.error("Login error:", error)
      if (error.response && error.response.data) {
        alert(error.response.data.message || "에러가 발생했습니다.");
      } else {
        alert("로그인 중 문제가 발생했습니다.");
      }
    }

  }


  return (
      <div className="login-page">
        <div className="form-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <h1>Login to Account</h1>

            <div className="form-row">
              <label htmlFor="student-id">학번</label>
              <input
                  type="text"
                  id="student-id"
                  name="student-id"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label htmlFor="password">비밀번호</label>
              <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn">
              Sign In
            </button>

            <div className="signup-link">
              <span>계정이 없으신가요? </span>
              <Link to="/signup">회원가입하기</Link>
            </div>
          </form>
        </div>
      </div>
  );
};

export default Login;
