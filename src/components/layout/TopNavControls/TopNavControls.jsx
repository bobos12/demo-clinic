import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TopNavControls = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = location.pathname === "/login";

  const [historyLength, setHistoryLength] = useState(() => window.history.length);

  useEffect(() => {
    setHistoryLength(window.history.length);
  }, [location.key]);

  const canGoBack = useMemo(() => {
    return window.history.length > 1;
  }, [historyLength]);

  if (isLogin) return null;

  return (
    <div className="top-nav-controls" aria-label="Page navigation controls">
      <button
        type="button"
        className="top-nav-btn"
        onClick={() => navigate(-1)}
        disabled={!canGoBack}
        aria-label="Go back"
        title="Back"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        className="top-nav-btn"
        onClick={() => navigate(1)}
        aria-label="Go forward"
        title="Forward"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};

export default TopNavControls;

