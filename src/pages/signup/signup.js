import React, { useState } from "react";
import axios from "axios";
import dropdownArrow from "../../images/ploygon.png";
import "./signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  // 1. 입력받을 값들을 state로 관리
  const [department, setDepartment] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [studentIdNum, setStudentIdNum] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 2. 폼 제출 시 실행될 함수
  const handleSubmit = async (event) => {
    event.preventDefault(); // 기본 폼 제출 동작 방지

    // 비밀번호 확인
    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // API 요청에 보낼 데이터 구성
    const requestData = {
      studentId: `${admissionYear}${studentIdNum}`, // 학번 조합
      password: password,
      passwordConfirm: passwordConfirm,
      name: name,
      department: department,
      admissionYear: `Y${admissionYear}`, // 'Y' 붙여서 전송
    };

    try {
      // 3. axios를 사용하여 회원가입 API 호출
      const response = await axios.post("/api/auth/register", requestData);

      // 4. 성공적으로 응답을 받았을 때의 처리
      if (response.data && response.data.success) {
        alert(response.data.message || "회원가입에 성공했습니다!");
        navigate("/login"); // 로그인 페이지로 이동
      } else {
        // 서버에서 success: false를 보냈을 경우
        alert(response.data.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      // 5. API 호출 중 에러가 발생했을 때의 처리
      console.error("Signup error:", error);
      if (error.response && error.response.data) {
        alert(error.response.data.message || "에러가 발생했습니다.");
      } else {
        alert("회원가입 중 문제가 발생했습니다.");
      }
    }
  };

  return (
    <div className="form-container">
      {/* 6. handleSubmit 함수를 form의 onSubmit 이벤트와 연결 */}
      <form className="signup-form" onSubmit={handleSubmit}>
        <h1>Create Account</h1>

        <div className="form-row">
          <label htmlFor="department">학과</label>
          <div className="input-wrapper">
            {/* 7. value와 onChange를 추가하여 state와 연결 */}
            <select
              id="department"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="" disabled>
                학과를 선택하세요
              </option>
              <option value="SOFTWARE">소프트웨어학부</option>
              <option value="AI">인공지능학부</option>
            </select>
            <img
              className="dropdown-arrow"
              src={dropdownArrow}
              alt="dropdown"
            />
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="student-id-year">학번</label>
          <div className="input-group">
            <div className="input-wrapper">
              <select
                id="student-id-year"
                name="student-id-year"
                value={admissionYear}
                onChange={(e) => setAdmissionYear(e.target.value)}
                required
              >
                <option value="" disabled>
                  입학년도
                </option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
              <img
                className="dropdown-arrow"
                src={dropdownArrow}
                alt="dropdown"
              />
            </div>
            <span>-</span>
            <input
              type="text"
              id="student-id-num"
              name="student-id-num"
              value={studentIdNum}
              onChange={(e) => setStudentIdNum(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="password-confirm">비밀번호 확인</label>
          <input
            type="password"
            id="password-confirm"
            name="password-confirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;