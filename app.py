from flask import Flask, jsonify, render_template
import random

app = Flask(__name__)

FORTUNES = [
    {"title": "大吉", "description": "今日は最高の運勢！思い切ってチャレンジすると吉。"},
    {"title": "中吉", "description": "良いことがありそう。感謝の気持ちを忘れずに。"},
    {"title": "小吉", "description": "穏やかな一日。コツコツ進めると成果に。"},
    {"title": "吉", "description": "平常心がポイント。いつも通りを意識して。"},
    {"title": "末吉", "description": "ゆっくり準備を整えれば良い方向へ。"},
    {"title": "凶", "description": "慎重に行動を。焦らず落ち着いて対応しよう。"},
]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/draw")
def draw_omikuji():
    fortune = random.choice(FORTUNES)
    return jsonify(fortune)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
