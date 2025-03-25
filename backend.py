from fastapi import FastAPI
import requests
import sqlite3
import time
import threading

app = FastAPI()

# データベースの初期化
conn = sqlite3.connect("usage_data.db", check_same_thread=False)
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    data TEXT
)
""")
conn.commit()

API_URL = "https://prozemi-prd.cdn-dena.com/api/usage"

def fetch_and_store_data():
    """定期的にAPIからデータを取得し、DBに保存"""
    while True:
        response = requests.get(API_URL)
        if response.status_code == 200:
            data = response.json()
            cursor.execute("INSERT INTO usage (timestamp, data) VALUES (datetime('now'), ?)", (str(data),))
            conn.commit()
            print("✅ データ取得成功:", data)
        else:
            print("❌ データ取得失敗:", response.status_code)
        
        time.sleep(3600)  # 1時間ごとに取得

# データ取得スレッドの開始
threading.Thread(target=fetch_and_store_data, daemon=True).start()

@app.get("/data")
def get_usage_data():
    """保存された利用状況データを取得"""
    cursor.execute("SELECT timestamp, data FROM usage ORDER BY id DESC LIMIT 10")
    rows = cursor.fetchall()
    return [{"timestamp": row[0], "data": row[1]} for row in rows]
