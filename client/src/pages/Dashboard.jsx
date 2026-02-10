import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../lib/api";
import { getToken, removeToken } from "../lib/auth";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          removeToken();
          navigate("/", { replace: true });
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUser(data.user);
      })
      .catch(() => {
        removeToken();
        navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-600">Loading…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <p className="text-gray-600">
        You're logged in as <strong>{user?.email}</strong>. Dashboard and features go here.
      </p>
    </Layout>
  )
}
