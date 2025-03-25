import React, { useEffect, useState } from 'react';
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FastAPIのエンドポイントからデータを取得
    axios.get('https://your-railway-app.onrender.com/data')  // ここにデプロイしたAPIのURLを入れる
      .then(response => {
        const formattedData = response.data.map(entry => ({
          time: entry.timestamp,
          value: JSON.parse(entry.data).someMetric, // "someMetric"はAPIから取得する実際の値に合わせてください
        }));
        setData(formattedData);
        setLoading(false);
      })
      .catch(error => {
        console.error("データ取得エラー", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="App">
      <h1>プロゼミ 利用状況</h1>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default App;
