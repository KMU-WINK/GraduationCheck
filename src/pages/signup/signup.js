import dropdownArrow from "../../images/ploygon.png";
import "./signup.css";

const Signup = () => {
  return (
    <div className="form-container">
      <form className="signup-form">
        <h1>Create Account</h1>

        <div className="form-row">
          <label htmlFor="department">학과</label>
          <div className="input-wrapper">
            <select id="department" name="department" defaultValue="">
              <option value="" disabled>
                학과를 선택하세요
              </option>
              <option value="computer-science">소프트웨어학부</option>
              <option value="electrical-engineering">인공지능학부</option>
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
                defaultValue=""
              >
                <option value="" disabled>
                  학번을 선택하세요
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
            <input type="text" id="student-id-num" name="student-id-num" />
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="name">이름</label>
          <input type="text" id="name" name="name" />
        </div>

        <div className="form-row">
          <label htmlFor="password">비밀번호</label>
          <input type="password" id="password" name="password" />
        </div>

        <div className="form-row">
          <label htmlFor="password-confirm">비밀번호 확인</label>
          <input
            type="password"
            id="password-confirm"
            name="password-confirm"
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
